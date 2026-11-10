"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useKabarMeter, type KabarMeter } from "@/lib/use-kabar-meter";
import { liter } from "@/lib/format";
import type {
  DataLiveMeter,
  DeretPemakaian,
  JawabanMeter,
  MeterDetail,
  NotifRingkas,
  PesanTukar,
  TransaksiRingkas,
} from "../_tipe";

/*
 * Acuan penuh bola saldo bagi warga yang belum punya riwayat.
 *
 * Begitu ada riwayat, acuannya diganti pemakaian warga SENDIRI selama
 * sebulan (lihat `acuanBolaL`). Seribu liter hanya dipakai sampai angka itu
 * tersedia — tanpa riwayat, tidak ada acuan lain yang lebih baik.
 */
const ACUAN_BACA_L = 1000;

/**
 * Tarif golongan rumah tangga, rupiah per liter.
 *
 * Beranda hanya MEMPERKIRAKAN biaya dan tidak pernah menagih — nilai yang
 * mengikat selalu datang dari server pada saat transaksi dibuat, lewat
 * `/api/paket`. Angka di sini tidak boleh dipakai untuk apa pun yang
 * menghasilkan tagihan.
 */
const TARIF_PER_LITER = 7.5;

/**
 * Mengembalikan teks hanya bila benar-benar ada isinya.
 *
 * `??` tidak cukup: `label` pada meter demo berisi STRING KOSONG, bukan null,
 * dan string kosong lolos dari `??` lalu tergambar sebagai judul kosong di
 * kepala halaman. Yang dinilai di sini keberadaan isi, bukan keberadaan
 * nilai.
 */
function isi(teks: string | null | undefined): string | null {
  const t = teks?.trim();
  return t ? t : null;
}

/**
 * Sapaan menurut jam setempat.
 *
 * Batasnya mengikuti kebiasaan Indonesia, bukan pembagian 6 jam yang rapi:
 * "siang" membentang sampai pukul 15, dan "sore" baru menyerah pada pukul
 * 18. Membagi hari menjadi empat bagian yang sama panjang menghasilkan
 * sapaan yang terasa salah bagi orang yang membaca — "selamat malam" pada
 * pukul 18.00 terbaca seperti jam dinding yang tidak dicocokkan.
 */
function sapaan(jam: number): string {
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Menjumlahkan ember jam-jaman menjadi total per tanggal kalender. */
function perTanggal(deret: DeretPemakaian[]): Map<string, number> {
  const hari = new Map<string, number>();
  deret.forEach((d) => {
    const k = new Date(d.waktu).toDateString();
    hari.set(k, (hari.get(k) ?? 0) + d.volumeL);
  });
  return hari;
}

export function useBeranda() {
  const router = useRouter();
  const { pengguna, meter, meterAktif, memuat, muatUlangData } = useAuth();

  const [dataLive, setDataLive] = useState<DataLiveMeter | null>(null);
  const [deretPemakaian, setDeretPemakaian] = useState<DeretPemakaian[]>([]);
  const [deretBulan, setDeretBulan] = useState<DeretPemakaian[]>([]);
  const [transaksi, setTransaksi] = useState<TransaksiRingkas[]>([]);
  const [notifikasi, setNotifikasi] = useState<NotifRingkas[]>([]);
  const [detailMeter, setDetailMeter] = useState<MeterDetail | null>(null);
  const [memuatPemakaian, setMemuatPemakaian] = useState(false);

  const [tokenInput, setTokenInput] = useState("");
  const [memuatTukar, setMemuatTukar] = useState(false);
  const [pesanTukar, setPesanTukar] = useState<PesanTukar | null>(null);

  useEffect(() => {
    if (!memuat && pengguna && meter.length === 0) {
      router.replace("/hubungkan-meter");
    }
  }, [memuat, meter, pengguna, router]);

  const ambilDataLive = useCallback(async (meterId: string) => {
    try {
      const data = await api<DataLiveMeter>(`/api/meter/${meterId}/live`);
      setDataLive(data);
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuatPemakaian(true);
      try {
        const live = await api<DataLiveMeter>(
          `/api/meter/${meterAktif.id}/live`,
        );
        if (aktif) setDataLive(live);
      } catch {
        void 0;
      }

      try {
        const p = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        if (aktif) setDeretPemakaian(p.deret || []);
      } catch {
        void 0;
      } finally {
        if (aktif) setMemuatPemakaian(false);
      }

      /*
       * Pemakaian bulan berjalan diambil TERPISAH, bukan dijumlahkan dari
       * deret mingguan. Tujuh hari terakhir hampir tidak pernah berimpit
       * dengan satu bulan kalender — menjumlahkannya akan memberi angka
       * "bulan ini" yang sebenarnya memotong bulan lalu.
       */
      try {
        const b = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=bulan`,
        );
        if (aktif) setDeretBulan(b.deret || []);
      } catch {
        void 0;
      }

      /* Aktivitas terakhir dan pengumuman: keduanya hiasan konteks, jadi
         kegagalannya tidak boleh menghentikan apa pun di halaman ini. */
      try {
        const t = await api<{ rows: TransaksiRingkas[] }>(
          "/api/transaksi?page=1&perPage=4",
        );
        if (aktif) setTransaksi(t.rows ?? []);
      } catch {
        void 0;
      }

      /* Kuncinya `notifikasi`, bukan `rows` (BE src/rute/notifikasi.ts).
         Membaca `rows` membuat kartu pengumuman di beranda selalu kosong
         tanpa satu galat pun, karena `?? []` menelan selisihnya. */
      try {
        const n = await api<{ notifikasi: NotifRingkas[] }>("/api/notifikasi");
        if (aktif) setNotifikasi((n.notifikasi ?? []).slice(0, 2));
      } catch {
        void 0;
      }

      try {
        const d = await api<JawabanMeter>(`/api/meter/${meterAktif.id}`);
        if (aktif) setDetailMeter(d.meter ?? null);
      } catch {
        void 0;
      }
    })();

    const interval = setInterval(() => {
      ambilDataLive(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDataLive]);

  /*
   * Saldo dan relay diperbarui SEKETIKA saat server mengabarkannya, lalu
   * dibaca ulang dari `/live` supaya angka di layar tetap angka server.
   * Polling lima detik di atas tetap berjalan; lihat `use-kabar-meter.ts`.
   */
  const saatKabar = useCallback(
    (k: KabarMeter) => {
      if (!meterAktif) return;
      if (k.event === "meter:saldo") {
        setDataLive((d) => (d ? { ...d, saldoL: k.data.saldoBaruL } : d));
      } else if (k.event === "meter:relay") {
        setDataLive((d) => (d ? { ...d, relay: k.data.relay } : d));
      }
      void ambilDataLive(meterAktif.id);
    },
    [meterAktif, ambilDataLive],
  );
  useKabarMeter(meterAktif?.id, saatKabar);

  const handleTukarTokenCepat = async () => {
    if (!meterAktif || tokenInput.length < 4) return;

    setMemuatTukar(true);
    setPesanTukar(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: tokenInput,
          meterId: meterAktif.id,
        }),
      });

      setPesanTukar({
        tipe: "sukses",
        teks: `Token valid! Saldo Anda bertambah +${liter(res.nilaiL, 0)}.`,
      });
      setTokenInput("");
      muatUlangData();
      ambilDataLive(meterAktif.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanTukar({ tipe: "galat", teks: err.message });
      } else {
        setPesanTukar({
          tipe: "galat",
          teks: "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.",
        });
      }
    } finally {
      setMemuatTukar(false);
    }
  };

  /*
   * Pemakaian hari ini, dijumlahkan dari ember jam-jaman.
   *
   * Nilai cadangan 18,5 yang dulu ada di sini DIHAPUS. Angka itu muncul
   * persis ketika servernya tidak punya data, yaitu satu-satunya saat
   * halaman ini seharusnya mengatakan "belum ada" — dan 18,5 L terbaca
   * sebagai pengukuran, bukan sebagai ketiadaan. Nol yang benar lebih baik
   * daripada angka yang meyakinkan tetapi tidak berasal dari mana pun.
   *
   * Deret bulanan dipakai sebagai sumber cadangan karena `rentang=minggu`
   * memang bisa menjawab kosong sementara `rentang=bulan` berisi.
   */
  const totalHariIniL = useMemo(() => {
    const sumber = deretPemakaian.length > 0 ? deretPemakaian : deretBulan;
    const kiniHari = new Date().toDateString();
    return sumber
      .filter((d) => new Date(d.waktu).toDateString() === kiniHari)
      .reduce((acc, curr) => acc + curr.volumeL, 0);
  }, [deretPemakaian, deretBulan]);

  const totalBulanL = useMemo(
    () => deretBulan.reduce((a, d) => a + d.volumeL, 0),
    [deretBulan],
  );

  /*
   * Target harian = rata-rata tujuh hari terakhir, dibulatkan.
   *
   * SENGAJA diturunkan dari data warga sendiri, bukan angka tetap. Target
   * yang dipatok di kode berlaku sama untuk rumah berisi dua orang dan
   * rumah berisi delapan — salah satunya pasti melanggarnya tiap hari, dan
   * garis yang selalu dilanggar berhenti dibaca sebagai target.
   *
   * Deret mingguan dulu, deret BULANAN sebagai cadangan. Bukan kerapian:
   * `rentang=minggu` benar-benar menjawab `deret: []` pada meter yang
   * riwayat embernya lebih tua dari tujuh hari, sementara `rentang=bulan`
   * tetap berisi. Versi pertama hanya membaca deret mingguan, dan hasilnya
   * halaman menulis "belum ada rata-rata" tepat di bawah grafik tujuh hari
   * yang penuh kolom — dua pernyataan yang saling membantah di satu layar.
   *
   * Nol dikembalikan bila belum ada data; grafik tidak menggambar garisnya
   * sama sekali pada nilai itu, dan itu benar — belum ada yang bisa
   * dijadikan acuan.
   */
  const targetHarianL = useMemo(() => {
    const hari = perTanggal(
      deretPemakaian.length > 0 ? deretPemakaian : deretBulan,
    );
    if (hari.size === 0) return 0;
    const total = Array.from(hari.values()).reduce((a, b) => a + b, 0);
    return Math.round(total / hari.size);
  }, [deretPemakaian, deretBulan]);

  /*
   * Tujuh hari terakhir.
   *
   * Dua hal diperbaiki dari versi sebelumnya:
   *
   * 1. Deret bulanan dipakai sebagai cadangan, bukan tujuh angka yang
   *    ditulis mati. Angka mati itu tergambar sebagai grafik yang rapi dan
   *    meyakinkan tepat ketika servernya tidak punya data sama sekali —
   *    dan tidak ada apa pun di layar yang memberi tahu bedanya.
   *
   * 2. Pengelompokannya memakai TANGGAL, bukan nama hari. Nama hari
   *    berulang tiap tujuh hari: pada rentang bulanan, empat hari Senin
   *    yang berbeda dijumlahkan menjadi satu kolom, dan grafiknya
   *    diam-diam menampilkan angka berlipat empat dengan label yang benar.
   */
  const grafik7Hari = useMemo(() => {
    const hari = perTanggal(
      deretPemakaian.length > 0 ? deretPemakaian : deretBulan,
    );

    return Array.from(hari.entries())
      .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
      .slice(-7)
      .map(([k, v]) => ({
        label: new Date(k).toLocaleDateString("id-ID", { weekday: "short" }),
        nilai: Math.round(v),
      }));
  }, [deretPemakaian, deretBulan]);

  const saldoSekarang = dataLive?.saldoL ?? meterAktif?.saldoLiter ?? 0;
  const debitSekarang = dataLive?.debitLpm ?? 0;
  const saldoMenipis = saldoSekarang <= 5.0;

  const sekarang = new Date();

  /*
   * Luring ditentukan oleh bendera `daring` dari server, dan HANYA bila
   * servernya memang menjawab. `dataLive` yang masih null berarti
   * permintaannya belum selesai — bukan berarti meternya mati. Menyamakan
   * keduanya membuat halaman berkedip "Luring" tiap kali dimuat ulang.
   */
  const luring = dataLive !== null && dataLive.daring === false;

  /*
   * Target sebulan = rata-rata harian × jumlah hari di bulan INI, bukan 30.
   * Februari dan Juli bukan bulan yang sama panjangnya, dan memakai 30 untuk
   * keduanya membuat persentasenya meleset sampai sepuluh persen di bulan
   * terpendek — tepat pada angka yang dipakai orang untuk menilai dirinya.
   */
  const hariDalamBulan = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth() + 1,
    0,
  ).getDate();
  const targetBulanL = targetHarianL * hariDalamBulan;

  /*
   * Bola penuh = pemakaian warga sendiri selama sebulan, bukan seribu liter.
   *
   * Angka tetap tidak bisa ditafsirkan siapa pun: 1.877 L di atas acuan
   * 1.000 L menggambar bola penuh dan berhenti di situ, jadi saldo dua kali
   * lipat dan saldo pas-pasan terlihat sama persis. Diukur terhadap
   * pemakaian sendiri, tinggi airnya langsung berarti "berapa bulan lagi" —
   * satu-satunya pertanyaan yang benar-benar ditanyakan orang di sini.
   */
  const acuanBolaL = targetBulanL > 0 ? targetBulanL : ACUAN_BACA_L;

  return {
    pengguna,
    meterAktif,
    memuat,
    dataLive,
    memuatPemakaian,
    transaksi,
    notifikasi,

    tokenInput,
    setTokenInput,
    memuatTukar,
    pesanTukar,
    handleTukarTokenCepat,

    totalHariIniL,
    totalBulanL,
    targetHarianL,
    targetBulanL,
    melebihiTarget: targetBulanL > 0 && totalBulanL > targetBulanL,
    biayaBulanRp: totalBulanL * TARIF_PER_LITER,
    grafik7Hari,

    saldoSekarang,
    debitSekarang,
    saldoMenipis,
    acuanBolaL,
    luring,

    /*
     * Keterangan meter sudah DISARING di sini, bukan di komponen. Dua
     * komponen membutuhkan nilai yang sama (kepala halaman dan panel meter),
     * dan string kosong harus ditangani di satu tempat saja — kalau tidak,
     * salah satunya cepat atau lambat akan memakai `??` dan menggambar judul
     * kosong.
     */
    labelMeter: isi(detailMeter?.label),
    alamatMeter: isi(detailMeter?.alamat),
    zonaMeter: isi(detailMeter?.zona),
    serialMeter: isi(detailMeter?.serial) ?? meterAktif?.nomorSeri ?? "",

    sapaanSekarang: sapaan(sekarang.getHours()),
    tanggalPanjang: sekarang.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    namaBulan: sekarang.toLocaleDateString("id-ID", { month: "long" }),
  };
}
