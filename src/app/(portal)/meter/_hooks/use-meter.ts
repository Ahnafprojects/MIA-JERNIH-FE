"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useKabarMeter } from "@/lib/use-kabar-meter";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { DataMeterDetail, LogMeter, ModalRelay, PesanAksi } from "../_tipe";

/**
 * Jendela pengamatan kebocoran: tengah malam sampai menjelang subuh.
 *
 * Rumah yang semua kerannya tertutup seharusnya mencatat mendekati nol di
 * jam-jam ini. Angka yang bertahan di atas ambang malam demi malam berarti
 * ada yang mengalir tanpa ada yang memakainya.
 */
const JAM_MALAM_MULAI = 0;
const JAM_MALAM_SELESAI = 5.5;

/**
 * Ambang dugaan kebocoran, liter per JAM.
 *
 * Dua liter per jam kira-kira rembesan kloset yang paling ringan — cukup di
 * atas derau pengukuran, tetapi masih di bawah sumber kebocoran rumah yang
 * sebenarnya. Satuannya mengikuti ember yang dikirim server, bukan L/mnt.
 */
const AMBANG_BOCOR_L_JAM = 2;

export function useMeter() {
  const { meterAktif, muatUlangData } = useAuth();

  const [meterDetail, setMeterDetail] = useState<DataMeterDetail | null>(null);
  const [logList, setLogList] = useState<LogMeter[]>([]);
  /*
   * Ember pemakaian per jam, sumber SATU-SATUNYA deteksi kebocoran.
   *
   * `/log` TIDAK bisa dipakai: ia hanya menyimpan 20 cuplikan telemetri
   * terakhir, dan pada akun mana pun ia menjawab kosong — fiturnya tidak
   * akan pernah menyala. `pemakaian?rentang=bulan` mengirim ember volume
   * per jam, dan itu yang benar-benar bisa diperiksa.
   */
  const [emberBulan, setEmberBulan] = useState<{ waktu: string; volumeL: number }[]>([]);

  const [modalRelay, setModalRelay] = useState<ModalRelay>(null);
  const [alasanRelay, setAlasanRelay] = useState("");
  const [memuatAksi, setMemuatAksi] = useState(false);
  const [pesanAksi, setPesanAksi] = useState<PesanAksi | null>(null);

  const ambilDetailMeter = useCallback(async (meterId: string) => {
    try {
      const [resMeter, resLog, resEmber] = await Promise.all([
        api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
          `/api/meter/${meterId}`,
        ),
        api<{ log: LogMeter[] }>(`/api/meter/${meterId}/log`).catch(() => ({ log: [] })),
        api<{ deret: { waktu: string; volumeL: number }[] }>(
          `/api/meter/${meterId}/pemakaian?rentang=bulan`,
        ).catch(() => ({ deret: [] })),
      ]);

      setMeterDetail(resMeter.meter);
      setLogList(resLog.log || []);
      setEmberBulan(resEmber.deret || []);

    } catch {
      // Abaikan bila ada kendala fetch
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      try {
        const [resMeter, resLog, resEmber] = await Promise.all([
          api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
            `/api/meter/${meterAktif.id}`,
          ),
          api<{ log: LogMeter[] }>(`/api/meter/${meterAktif.id}/log`).catch(() => ({ log: [] })),
          api<{ deret: { waktu: string; volumeL: number }[] }>(
            `/api/meter/${meterAktif.id}/pemakaian?rentang=bulan`,
          ).catch(() => ({ deret: [] })),
        ]);
        if (aktif) {
          setMeterDetail(resMeter.meter);
          setLogList(resLog.log || []);
          setEmberBulan(resEmber.deret || []);
        }
      } catch {
        // Abaikan
      }
    })();

    // Polling live 5 detik
    const interval = setInterval(() => {
      ambilDetailMeter(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDetailMeter]);

  /*
   * Relay yang diubah petugas dari konsol, atau token yang ditukar dari
   * perangkat lain, langsung terbaca di sini tanpa menunggu penarikan
   * berikutnya. Isinya selalu dibaca ulang dari server.
   */
  const saatKabar = useCallback(() => {
    if (meterAktif) ambilDetailMeter(meterAktif.id);
  }, [meterAktif, ambilDetailMeter]);
  useKabarMeter(meterAktif?.id, saatKabar);

  const handleEksekusiRelay = async () => {
    if (!meterDetail || !modalRelay || alasanRelay.trim().length < 3) return;

    setMemuatAksi(true);
    setPesanAksi(null);

    try {
      await api(`/api/meter/${meterDetail.id}/relay`, {
        method: "POST",
        body: JSON.stringify({
          aksi: modalRelay,
          alasan: alasanRelay.trim(),
        }),
      });

      setPesanAksi({
        tipe: "sukses",
        teks: `Katup relay berhasil diubah menjadi ${modalRelay === "buka" ? "AKTIF" : "NONAKTIF"}. Perintah tercatat di audit log.`,
      });
      setModalRelay(null);
      setAlasanRelay("");
      await muatUlangData();
      ambilDetailMeter(meterDetail.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanAksi({ tipe: "galat", teks: err.message });
      } else {
        setPesanAksi({ tipe: "galat", teks: "Gagal mengubah status relay meter." });
      }
    } finally {
      setMemuatAksi(false);
    }
  };

  const statusAlarm = useMemo(() => {
    const s = meterDetail?.saldoL ?? 0;
    if (s <= 0) {
      return {
        level: "Kritis (0 L)",
        nada: "bahaya" as const,
        keterangan: "Bunyi terus dan aliran tertutup otomatis.",
      };
    }
    if (s <= 2.0) {
      return {
        level: "Genting (≤ 2 L)",
        nada: "bahaya" as const,
        keterangan: "Bip tiap 2 detik — segera isi token.",
      };
    }
    if (s <= 5.0) {
      return {
        level: "Peringatan (≤ 5 L)",
        nada: "peringatan" as const,
        keterangan: "Bip tiap 10 detik.",
      };
    }
    return {
      level: "Normal",
      nada: "sukses" as const,
      keterangan: "Senyap — pasokan saldo aman.",
    };
  }, [meterDetail?.saldoL]);

  /**
   * Pola pemakaian dini hari — dasar deteksi kebocoran.
   *
   * Versi sebelumnya mengembalikan TUJUH ANGKA NOL yang ditulis mati, di
   * dalam `useMemo` tanpa satu pun kebergantungan, pada hook yang bahkan
   * tidak pernah memanggil endpoint pemakaian. Jadi grafiknya menggambar
   * garis datar nol untuk setiap warga, selamanya — dan garis nol di bagian
   * deteksi kebocoran adalah hal paling berbahaya yang bisa ditampilkan
   * halaman ini. Ia tidak berkata "belum diperiksa"; ia berkata "sudah
   * diperiksa, aman", tepat ketika tidak ada yang diukur.
   *
   * Dikelompokkan PER MALAM, bukan per jam. Satu titik per jam selama
   * sembilan malam menghasilkan 54 titik yang naik-turun mengikuti kebiasaan
   * tidur, dan pola kebocoran tenggelam di dalamnya. Yang menandai kebocoran
   * bukan satu jam yang tinggi, melainkan DASAR yang tidak pernah menyentuh
   * nol malam demi malam — dan itu baru terbaca kalau tiap malam diringkas
   * jadi satu angka.
   *
   * Satuannya liter per JAM, mengikuti satuan ember yang dikirim server.
   * Membaginya 60 supaya terbaca sebagai L/mnt hanya memalsukan ketelitian.
   */
  const dataDeteksiKebocoran = useMemo(() => {
    const perMalam = new Map<string, { total: number; jam: number }>();

    emberBulan.forEach((e) => {
      const t = new Date(e.waktu);
      const jam = t.getHours() + t.getMinutes() / 60;
      if (jam < JAM_MALAM_MULAI || jam > JAM_MALAM_SELESAI) return;

      const kunci = t.toDateString();
      const lama = perMalam.get(kunci) ?? { total: 0, jam: 0 };
      perMalam.set(kunci, { total: lama.total + e.volumeL, jam: lama.jam + 1 });
    });

    /* Dibatasi 14 malam terakhir: lebih dari itu label tanggalnya berdesakan
       dan sumbunya berhenti bisa dibaca. */
    const urut = Array.from(perMalam.entries())
      .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
      .slice(-14);

    const titik = urut.map(([, v]) => Math.round((v.total / v.jam) * 100) / 100);

    return {
      /* Dua malam adalah jumlah terkecil yang masih bisa menunjukkan pola.
         Satu malam hanya sebuah angka, dan satu angka tidak pernah bisa
         membedakan kebocoran dari mandi tengah malam sekali. */
      ada: titik.length >= 2,
      labels: urut.map(([k]) =>
        new Date(k).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
      ),
      deret: [{ name: "Rata-rata malam", unit: "L/jam", points: titik }],
      ambangBocor: AMBANG_BOCOR_L_JAM,
      /* Dasar terendah — angka yang sebenarnya menuduh. Malam paling sepi pun
         tetap di atas ambang berarti ada yang mengalir terus. */
      dasar: titik.length > 0 ? Math.min(...titik) : 0,
      puncak: titik.reduce((a, v) => Math.max(a, v), 0),
      jumlahMalam: titik.length,
    };
  }, [emberBulan]);

  return {
    meterAktif,
    meterDetail,
    logList,
    modalRelay,
    setModalRelay,
    alasanRelay,
    setAlasanRelay,
    memuatAksi,
    pesanAksi,
    statusAlarm,
    dataDeteksiKebocoran,
    handleEksekusiRelay,
  };
}
