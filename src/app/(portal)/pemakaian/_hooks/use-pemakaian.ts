"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RATA_ZONA_L_HARI } from "../_konstanta";
import type {
  JamBoros,
  JangkauanData,
  ModeGrafik,
  ProyeksiSaldo,
  RingkasanKpi,
  TitikEmber,
  TitikGrafik,
} from "../_tipe";

export function usePemakaian() {
  const { meterAktif } = useAuth();
  const [modeGrafik, setModeGrafik] = useState<ModeGrafik>("bulan");
  const [mulaiPilih, setMulaiPilih] = useState("");
  const [akhirPilih, setAkhirPilih] = useState("");
  const [dataEmber, setDataEmber] = useState<TitikEmber[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuat(true);
      /*
       * Dua rentang diminta, mingguan lebih dulu lalu bulanan sebagai
       * cadangan.
       *
       * `rentang=minggu` BENAR-BENAR menjawab `deret: []` pada meter yang
       * riwayat embernya lebih tua dari tujuh hari — dibuktikan langsung ke
       * server. Versi sebelumnya hanya meminta rentang mingguan, jadi
       * seluruh halaman ini menampilkan 0 L di setiap kartu sementara meter
       * yang sama punya ribuan liter tercatat pada rentang bulanan. Bukan
       * halaman kosong yang jujur, melainkan halaman yang mengaku tahu dan
       * menjawab nol.
       */
      try {
        const res = await api<{ deret: TitikEmber[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        let deret = res.deret || [];

        if (deret.length === 0) {
          const bln = await api<{ deret: TitikEmber[] }>(
            `/api/meter/${meterAktif.id}/pemakaian?rentang=bulan`,
          );
          deret = bln.deret || [];
        }

        if (aktif) setDataEmber(deret);
      } catch {
        if (aktif) setDataEmber([]);
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, [meterAktif]);

  const kpi = useMemo<RingkasanKpi>(() => {
    if (dataEmber.length === 0) {
      return { hariIniL: 0, mingguIniL: 0, bulanIniL: 0, rataRataHarianL: 0 };
    }

    const kini = new Date();
    const kiniStr = kini.toDateString();

    /*
     * Dikelompokkan per TANGGAL lebih dulu, lalu diambil tujuh tanggal
     * terakhir YANG BENAR-BENAR ADA — bukan disaring dengan jendela "tujuh
     * hari ke belakang dari sekarang".
     *
     * Jendela waktu tetap gagal pada keadaan yang persis terjadi di sini:
     * ember terakhir meter ini berumur lebih dari seminggu, jadi seluruh
     * data jatuh di luar jendela dan keempat kartu menjawab 0 L — sementara
     * peta panas di halaman yang sama, yang tidak menyaring apa pun,
     * memperlihatkan ratusan liter. Dua bagian halaman membantah satu sama
     * lain, dan yang salah adalah yang menjawab nol.
     *
     * Pembaginya juga jumlah hari yang tercatat, bukan angka tujuh mati.
     * Membagi lima hari data dengan tujuh menghasilkan rata-rata yang
     * terlalu rendah, dan rata-rata itu dipakai lagi oleh proyeksi saldo —
     * jadi kesalahannya berlipat menjadi perkiraan "masih lama" yang salah.
     */
    const perTanggal = new Map<string, number>();
    dataEmber.forEach((d) => {
      const k = new Date(d.waktu).toDateString();
      perTanggal.set(k, (perTanggal.get(k) ?? 0) + d.volumeL);
    });

    const tanggalUrut = Array.from(perTanggal.keys()).sort(
      (a, b) => Date.parse(a) - Date.parse(b),
    );
    const tujuhTerakhir = tanggalUrut.slice(-7);

    const hIni = perTanggal.get(kiniStr) ?? 0;
    const mIni = tujuhTerakhir.reduce((a, k) => a + (perTanggal.get(k) ?? 0), 0);

    const avgHarian =
      tujuhTerakhir.length > 0
        ? Math.round((mIni / tujuhTerakhir.length) * 10) / 10
        : 0;

    /* Bulan berjalan: dijumlahkan dari tanggal yang memang jatuh di bulan
       ini, bukan rata-rata dikali 30. Perkalian itu menghasilkan angka yang
       tidak pernah cocok dengan tagihan mana pun. */
    const bIni = tanggalUrut.reduce((a, k) => {
      const t = new Date(k);
      const sebulan =
        t.getMonth() === kini.getMonth() &&
        t.getFullYear() === kini.getFullYear();
      return sebulan ? a + (perTanggal.get(k) ?? 0) : a;
    }, 0);

    return {
      hariIniL: Math.round(hIni * 10) / 10,
      mingguIniL: Math.round(mIni),
      bulanIniL: Math.round(bIni),
      rataRataHarianL: avgHarian,
    };
  }, [dataEmber]);

  /* Arah DAN besarnya selisih, keduanya diturunkan dari angka yang sama
     dengan yang tercetak di kartunya. */
  const lebihBoros = kpi.rataRataHarianL > RATA_ZONA_L_HARI;
  const selisihZonaPersen = Math.round(
    (Math.abs(kpi.rataRataHarianL - RATA_ZONA_L_HARI) / RATA_ZONA_L_HARI) * 100,
  );

  const sisaHariProyeksi = useMemo(() => {
    const saldoSekarang = meterAktif?.saldoLiter ?? 0;
    if (saldoSekarang <= 0 || kpi.rataRataHarianL <= 0) return null;
    return Math.max(1, Math.round(saldoSekarang / kpi.rataRataHarianL));
  }, [meterAktif?.saldoLiter, kpi.rataRataHarianL]);

  /**
   * Jam paling boros dalam sehari.
   *
   * Dijumlahkan PER JAM lintas semua hari, lalu diambil jam tertingginya —
   * bukan satu ember tertinggi. Satu ember tunggal menjawab "kapan lonjakan
   * terbesar pernah terjadi", yang hampir selalu satu kejadian sekali
   * seumur hidup dan tidak bisa ditindaklanjuti. Rata-rata per jam menjawab
   * pertanyaan yang sebenarnya: jam berapa rumah ini rutin paling boros.
   *
   * Peta panas di halaman ini menyimpan data yang sama, tetapi membacanya
   * menuntut mata menyapu 168 sel dan membandingkan gelap-terang. Satu
   * kalimat menyelesaikannya tanpa itu.
   */
  const jamPalingBoros = useMemo<JamBoros | null>(() => {
    if (dataEmber.length === 0) return null;

    const perJam = new Array<number>(24).fill(0);
    const hariUnik = new Array<Set<string>>(24);
    for (let i = 0; i < 24; i += 1) hariUnik[i] = new Set();

    dataEmber.forEach((d) => {
      const t = new Date(d.waktu);
      const j = t.getHours();
      perJam[j] += d.volumeL;
      hariUnik[j]!.add(t.toDateString());
    });

    let puncak = -1;
    let nilai = 0;
    perJam.forEach((v, j) => {
      /* Dibagi jumlah HARI yang punya catatan pada jam itu, bukan jumlah
         ember. Jam yang kebetulan terekam lebih sering akan tampak lebih
         boros kalau dibagi jumlah ember. */
      const n = hariUnik[j]!.size || 1;
      const rata = v / n;
      if (rata > nilai) {
        nilai = rata;
        puncak = j;
      }
    });

    if (puncak < 0 || nilai <= 0) return null;
    return { jam: puncak, rataL: nilai };
  }, [dataEmber]);

  /**
   * Proyeksi saldo: berapa lama air masih ada kalau pemakaian tidak berubah.
   *
   * Digambar sebagai garis menurun sampai menyentuh nol, bukan sebagai satu
   * angka "16 hari lagi". Angka tunggal tidak memperlihatkan KAPAN alarm
   * firmware mulai berbunyi — dan itu yang benar-benar dirasakan warga:
   * meter berbunyi tiap 10 detik di 5 L, bukan saat saldonya habis.
   *
   * Rentangnya SELALU sampai saldo menyentuh nol, berapa pun lamanya —
   * bukan dipotong pada hari ke-14. Potongan tetap itu dicoba lebih dulu dan
   * gagal total: pada saldo 22.377 L dengan pemakaian 130 L/hari, empat
   * belas hari hanya memangkas 8% dan garisnya tergambar mendatar di puncak
   * sumbu. Yang terlihat bukan proyeksi, melainkan garis lurus yang tidak
   * menyampaikan apa pun, dan ambang alarm 5 L berada begitu jauh di bawah
   * sampai tidak ikut tergambar.
   *
   * Jumlah titik yang dijaga tetap (maksimal 15), bukan jumlah harinya:
   * langkahnya direnggangkan untuk saldo besar. Jadi sumbunya tetap terbaca
   * pada 6 hari maupun 170 hari.
   */
  const proyeksiSaldo = useMemo<ProyeksiSaldo | null>(() => {
    const saldo = meterAktif?.saldoLiter ?? 0;
    if (saldo <= 0 || kpi.rataRataHarianL <= 0) return null;

    const hariPenuh = Math.ceil(saldo / kpi.rataRataHarianL);
    const MAKS_TITIK = 15;
    const langkah = Math.max(1, Math.ceil(hariPenuh / (MAKS_TITIK - 1)));

    const kini = new Date();
    const tanggal = (hari: number) =>
      new Date(kini.getTime() + hari * 86_400_000).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

    const labels: string[] = [];
    /* `number[]`, bukan `(number|null)[]`: proyeksi ini DIHITUNG, jadi tiap
       titiknya selalu ada. `null` di tipe `Deret` dipakai untuk periode yang
       tidak dikirim server — arti yang berbeda, dan tidak berlaku di sini. */
    const nilai: number[] = [];

    for (let hari = 0; hari <= hariPenuh; hari += langkah) {
      labels.push(hari === 0 ? "Kini" : tanggal(hari));
      nilai.push(Math.max(0, Math.round(saldo - kpi.rataRataHarianL * hari)));
    }

    /* Titik nol selalu digambar, walau langkahnya melewatinya. Garis yang
       berhenti di 240 L tidak pernah memperlihatkan kapan airnya habis —
       padahal itu satu-satunya hal yang ditanyakan ke grafik ini. */
    if (nilai[nilai.length - 1] !== 0) {
      labels.push(tanggal(hariPenuh));
      nilai.push(0);
    }

    return {
      labels,
      deret: [{ name: "Perkiraan saldo", unit: "L", points: nilai }],
      hariPenuh,
      langkah,
    };
  }, [meterAktif?.saldoLiter, kpi.rataRataHarianL]);

  const gridPetaPanas = useMemo(() => {
    // Array 7 hari (indeks 0 = Senin s/d 6 = Minggu) x 24 jam (0 s/d 23)
    const grid: (number | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => null),
    );

    if (dataEmber.length === 0) return grid;

    dataEmber.forEach((item) => {
      const t = new Date(item.waktu);
      // getDay() = 0 (Min), 1 (Sen), ..., 6 (Sab)
      const hariJs = t.getDay();
      const barisHari = hariJs === 0 ? 6 : hariJs - 1; // Sesuaikan agar Sen = 0
      const kolomJam = t.getHours();

      const nilaiLama = grid[barisHari]?.[kolomJam] ?? 0;
      if (grid[barisHari]) {
        grid[barisHari][kolomJam] =
          Math.round((nilaiLama + item.volumeL) * 10) / 10;
      }
    });

    return grid;
  }, [dataEmber]);

  /**
   * Rentang tanggal yang BENAR-BENAR tersedia, diturunkan dari datanya.
   *
   * Dipakai untuk membatasi kolom tanggal (`min`/`max`) dan untuk
   * mengatakan dengan jujur sampai mana riwayatnya menjangkau. Tanpa batas
   * ini warga bisa memilih Januari dan mendapat grafik kosong tanpa
   * penjelasan — kosong yang terbaca seperti kerusakan, bukan seperti
   * "memang tidak ada".
   */
  const jangkauanData = useMemo<JangkauanData | null>(() => {
    if (dataEmber.length === 0) return null;
    const waktu = dataEmber
      .map((d) => Date.parse(d.waktu))
      .sort((a, b) => a - b);
    const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    return { mulai: iso(waktu[0]!), akhir: iso(waktu[waktu.length - 1]!) };
  }, [dataEmber]);

  /**
   * Deret untuk grafik riwayat konsumsi.
   *
   * Pengelompokan harian memakai TANGGAL, bukan nama hari. Nama hari
   * berulang tiap tujuh hari: pada data rentang bulanan, empat hari Senin
   * yang berbeda dijumlahkan menjadi satu kolom, dan grafiknya diam-diam
   * menampilkan angka berlipat empat dengan label yang tetap benar — jenis
   * kesalahan yang tidak pernah terlihat salah.
   *
   * Ketiga mode MENYARING data yang sama; tidak ada satu pun yang menambah
   * periode yang tidak dikirim server. Bulan yang tidak punya ember tidak
   * digambar sama sekali — bukan digambar bernilai nol, karena nol adalah
   * hasil pengukuran dan tidak boleh dikarang.
   */
  const dataGrafik = useMemo<TitikGrafik[]>(() => {
    const perTanggal = new Map<string, number>();
    dataEmber.forEach((d) => {
      const t = new Date(d.waktu);
      const kunci = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
      perTanggal.set(kunci, (perTanggal.get(kunci) ?? 0) + d.volumeL);
    });

    const keTanggal = (kunci: string) => {
      const [th, bl, tg] = kunci.split("-").map(Number);
      return new Date(th!, bl!, tg!);
    };

    const harian = Array.from(perTanggal.entries())
      .map(([kunci, nilai]) => ({ tgl: keTanggal(kunci), nilai }))
      .sort((a, b) => a.tgl.getTime() - b.tgl.getTime());

    if (modeGrafik === "tahun") {
      /* Dikelompokkan per BULAN. Dengan jendela server 30 hari, hasilnya
         satu atau dua kolom — dan itu memang jawaban yang benar, bukan
         kekurangan yang perlu ditambal. */
      const perBulan = new Map<string, number>();
      harian.forEach(({ tgl, nilai }) => {
        const kunci = `${tgl.getFullYear()}-${String(tgl.getMonth()).padStart(2, "0")}`;
        perBulan.set(kunci, (perBulan.get(kunci) ?? 0) + nilai);
      });

      return Array.from(perBulan.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([kunci, nilai]) => {
          const [th, bl] = kunci.split("-").map(Number);
          return {
            label: new Date(th!, bl!, 1).toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            }),
            nilai: Math.round(nilai),
          };
        });
    }

    if (modeGrafik === "pilih") {
      /* Kolom tanggal kosong berarti "belum memilih", bukan "pilih semua" —
         jadi grafiknya sengaja tidak digambar sampai keduanya terisi. */
      if (!mulaiPilih || !akhirPilih) return [];
      const dari = new Date(`${mulaiPilih}T00:00:00`);
      const sampai = new Date(`${akhirPilih}T23:59:59`);
      if (dari > sampai) return [];

      return harian
        .filter(({ tgl }) => tgl >= dari && tgl <= sampai)
        .map(({ tgl, nilai }) => ({
          label: tgl.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          nilai: Math.round(nilai),
        }));
    }

    /* Bulan: seluruh jendela yang dikirim server, per hari. */
    return harian.map(({ tgl, nilai }) => ({
      label: tgl.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      nilai: Math.round(nilai),
    }));
  }, [dataEmber, modeGrafik, mulaiPilih, akhirPilih]);

  return {
    meterAktif,
    memuat,
    modeGrafik,
    setModeGrafik,
    mulaiPilih,
    setMulaiPilih,
    akhirPilih,
    setAkhirPilih,
    kpi,
    lebihBoros,
    selisihZonaPersen,
    sisaHariProyeksi,
    jamPalingBoros,
    proyeksiSaldo,
    gridPetaPanas,
    jangkauanData,
    dataGrafik,
  };
}
