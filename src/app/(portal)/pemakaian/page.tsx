"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Droplet,
  Info,
  TrendingDown,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { liter, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { GrafikGaris } from "@/components/domain/grafik";
import { GrafikAir } from "@/components/domain/grafik-air";
import { KeadaanKosong } from "@/components/ui/keadaan";


interface TitikEmber {
  waktu: string;
  volumeL: number;
}

const HARI_LABEL = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const JAM_LABEL = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

/**
 * Warna sel peta panas menurut volume per jam.
 *
 * `null` (belum ada rekaman) dibedakan dari `0` (terukur, memang tidak ada
 * air mengalir) lewat garis putus-putus — bukan lewat warna yang lebih
 * muda. Keduanya artinya sangat berbeda: yang satu "kami tidak tahu", yang
 * satu "kami tahu, jawabannya nol".
 */
function warnaSelPetaPanas(vol: number | null): string {
  if (vol === null) return "bg-soft/40 border-dashed border-line/50";
  if (vol === 0) return "bg-surface border-line/40";
  if (vol < 5) return "bg-brand-500/15 border-brand-500/20";
  if (vol < 15) return "bg-brand-500/35 border-brand-500/40";
  if (vol < 30) return "bg-brand-500/65 border-brand-500/70 text-white";
  return "bg-brand-600 border-brand-600 text-white font-bold";
}

/**
 * Saldo saat firmware mulai membunyikan buzzer tiap 10 detik.
 *
 * Angka ini milik firmware, bukan pilihan tampilan — lihat kartu "Alarm
 * meter" di halaman `/meter`. Dipakai di sini untuk menandai KAPAN alarm
 * itu akan berbunyi menurut proyeksi.
 */
const AMBANG_ALARM_L = 5;

/**
 * Rata-rata pemakaian harian rumah tangga sezona, liter per hari.
 *
 * Nilai tetap: tidak ada endpoint yang mengirim agregat zona. Ditarik ke
 * konstanta supaya angka yang DITAMPILKAN dan angka yang DIPAKAI MENGHITUNG
 * selalu sama — sebelumnya "48,2" ditulis langsung di JSX sementara
 * persentasenya dipatok terpisah, dan keduanya bebas saling bertentangan
 * tanpa ada yang menyadarinya.
 */
const RATA_ZONA_L_HARI = 48.2;

/**
 * Jendela terjauh yang bisa dikembalikan server, dalam hari.
 *
 * Bukan tebakan: `GET /api/meter/:id/pemakaian` menyaring
 * `jam >= Date.now() - 30 hari` pada rentang terpanjangnya, dan tidak ada
 * rentang lain yang lebih jauh (`MIA-JERNIH-BE/src/rute/meter.ts`).
 * Dibuktikan ke server produksi: meter P0001 mengembalikan 216 ember yang
 * seluruhnya jatuh pada 21–30 Oktober — sepuluh hari, satu bulan.
 *
 * Angka ini dipakai untuk MENOLAK menggambar apa pun di luar jangkauannya,
 * alih-alih mengisi bulan kosong dengan angka buatan.
 */
const JANGKAUAN_HARI = 30;

function KontenPemakaian() {
  const { meterAktif } = useAuth();
  /*
   * Tiga rentang: bulan, tahun, dan pilihan sendiri.
   *
   * Pilihan "6 bulan" yang lama DIHAPUS karena datanya tidak pernah ada —
   * versi sebelumnya menambalnya dengan enam angka yang ditulis mati di
   * berkas ini ("Mei 4.200 L, Jun 3.900 L, …"), sama untuk setiap warga,
   * tergambar rapi tanpa satu pun berasal dari meternya.
   *
   * Penggantinya tetap dibatasi oleh apa yang benar-benar dikirim server:
   * `GET /api/meter/:id/pemakaian` menyaring `jam >= sekarang - 30 hari`
   * pada rentang terpanjangnya (`src/rute/meter.ts`). Jadi "Tahun" di sini
   * BUKAN janji satu tahun data — ia hanya mengelompokkan ulang jendela 30
   * hari itu per bulan, dan mengatakannya terus terang. Lihat `JANGKAUAN`.
   */
  const [modeGrafik, setModeGrafik] = useState<"bulan" | "tahun" | "pilih">(
    "bulan",
  );
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

  // Agregasi KPI
  const { hariIniL, mingguIniL, bulanIniL, rataRataHarianL } = useMemo(() => {
    if (dataEmber.length === 0) {
      return {
        hariIniL: 0,
        mingguIniL: 0,
        bulanIniL: 0,
        rataRataHarianL: 0,
      };
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
    const mIni = tujuhTerakhir.reduce(
      (a, k) => a + (perTanggal.get(k) ?? 0),
      0,
    );

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
  const lebihBoros = rataRataHarianL > RATA_ZONA_L_HARI;
  const selisihZonaPersen = Math.round(
    (Math.abs(rataRataHarianL - RATA_ZONA_L_HARI) / RATA_ZONA_L_HARI) * 100,
  );

  // Proyeksi sisa hari saldo habis
  const sisaHariProyeksi = useMemo(() => {
    const saldoSekarang = meterAktif?.saldoLiter ?? 0;
    if (saldoSekarang <= 0 || rataRataHarianL <= 0) return null;
    return Math.max(1, Math.round(saldoSekarang / rataRataHarianL));
  }, [meterAktif?.saldoLiter, rataRataHarianL]);

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
  const jamPalingBoros = useMemo(() => {
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
  const proyeksiSaldo = useMemo(() => {
    const saldo = meterAktif?.saldoLiter ?? 0;
    if (saldo <= 0 || rataRataHarianL <= 0) return null;

    const hariPenuh = Math.ceil(saldo / rataRataHarianL);
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
      nilai.push(Math.max(0, Math.round(saldo - rataRataHarianL * hari)));
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
  }, [meterAktif?.saldoLiter, rataRataHarianL]);

  // Transformasi Peta Panas 7 Baris x 24 Kolom
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
      const barisHari = hariJs === 0 ? 6 : hariJs - 1; // Sesuaikan agar Sen = 0, Min = 6
      const kolomJam = t.getHours();

      const nilaiLama = grid[barisHari]?.[kolomJam] ?? 0;
      if (grid[barisHari]) {
        grid[barisHari][kolomJam] = Math.round((nilaiLama + item.volumeL) * 10) / 10;
      }
    });

    return grid;
  }, [dataEmber]);

  /* Sel terpenuh di seluruh peta — dipakai legenda untuk menyebutkan batas
     atas skalanya. Tanpa angka itu, tinggi air hanya bisa dibandingkan
     antarsel dan tidak pernah bisa dibaca sebagai liter. */
  /**
   * Rentang tanggal yang BENAR-BENAR tersedia, diturunkan dari datanya.
   *
   * Dipakai untuk membatasi kolom tanggal (`min`/`max`) dan untuk
   * mengatakan dengan jujur sampai mana riwayatnya menjangkau. Tanpa batas
   * ini warga bisa memilih Januari dan mendapat grafik kosong tanpa
   * penjelasan — kosong yang terbaca seperti kerusakan, bukan seperti
   * "memang tidak ada".
   */
  const jangkauanData = useMemo(() => {
    if (dataEmber.length === 0) return null;
    const waktu = dataEmber.map((d) => Date.parse(d.waktu)).sort((a, b) => a - b);
    const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    return {
      mulai: iso(waktu[0]!),
      akhir: iso(waktu[waktu.length - 1]!),
    };
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
  const dataGrafik = useMemo(() => {
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

  if (!meterAktif) {
    return (
      <div className="px-4 py-16 text-center">
        <KeadaanKosong
          judul="Meter Belum Terhubung"
          pesan="Sambungkan meter fisik Anda terlebih dahulu untuk melihat catatan konsumsi air."
          aksi={
            <Link href="/hubungkan-meter">
              <Button varian="utama">Hubungkan Meter Sekarang</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Analisis Konsumsi
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Pemakaian & Peta Panas
          </h1>
          <p className="mt-1 text-xs text-muted text-balance">
            Jawaban transparan untuk satu pertanyaan penting: ke mana saja air Anda digunakan?
          </p>
        </div>

        {/*
          `shrink-0` pada tiap tombol dan `whitespace-nowrap` pada labelnya.

          Tanpa keduanya, "Isi Saldo" dan "Kontrol Meter" adalah bagian
          paling lentur di baris ini: begitu judul halaman memakan lebar,
          merekalah yang mengalah, dan labelnya pecah menjadi "Isi" / "Saldo"
          dua baris di dalam tombol setinggi satu baris. Tombol yang teksnya
          terbelah terbaca rusak, bukan sempit.

          Pada ponsel keduanya melebar penuh dan berbagi baris rata — lebih
          mudah disentuh daripada dua tombol kecil yang berdempetan di tepi.
        */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/beli" className="flex-1 sm:flex-none">
            <Button varian="utama" ukuran="sm" className="w-full whitespace-nowrap">
              <Droplet size={14} />
              Isi Saldo
            </Button>
          </Link>
          <Link href="/meter" className="flex-1 sm:flex-none">
            <Button
              varian="sekunder"
              ukuran="sm"
              className="w-full whitespace-nowrap"
            >
              Kontrol Meter
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 4 KPI Utama ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="permukaan p-4">
          <div className="flex items-center justify-between text-muted">
            <span className="eyebrow">Hari Ini</span>
            <Clock size={14} />
          </div>
          <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
            {liter(hariIniL, 1)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Biaya: <strong className="font-mono text-ink">{rupiah(hariIniL * 7.5)}</strong>
          </p>
        </div>

        <div className="permukaan p-4">
          <div className="flex items-center justify-between text-muted">
            <span className="eyebrow">7 Hari Terakhir</span>
            <Calendar size={14} />
          </div>
          <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
            {liter(mingguIniL, 0)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Akumulasi 1 minggu
          </p>
        </div>

        <div className="permukaan p-4">
          <div className="flex items-center justify-between text-muted">
            <span className="eyebrow">Bulan Berjalan</span>
            <TrendingUp size={14} />
          </div>
          <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
            {liter(bulanIniL, 0)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Terjumlah bulan ini
          </p>
        </div>

        <div className="permukaan p-4">
          <div className="flex items-center justify-between text-muted">
            <span className="eyebrow">Rata-rata Harian</span>
            <TrendingDown size={14} />
          </div>
          <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
            {liter(rataRataHarianL, 1)}
          </p>
          {/*
            Dibandingkan dengan rata-rata ZONA, bukan "baku mutu 50 L/hari".
            Angka 50 itu tidak berasal dari mana pun — bukan dari server,
            bukan dari standar yang dirujuk — dan ia muncul tepat di sebelah
            rata-rata asli warga yang 130 L. Membaca keduanya berdampingan,
            satu-satunya kesimpulan yang bisa ditarik adalah "saya melanggar
            baku mutu", padahal tidak ada baku mutu yang sedang diukur.
          */}
          <p className="mt-1 text-[11px] text-muted">
            Rata-rata zona: {liter(RATA_ZONA_L_HARI, 1)} / hari
          </p>
        </div>
      </div>

      {/* ── Pita Proyeksi Saldo & Komparasi Zona ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Kartu Proyeksi Saldo */}
        <div className="permukaan p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-[8px] bg-brand-500/10 text-brand-600 dark:text-accent">
              <Clock size={16} />
            </span>
            <h2 className="text-sm font-bold text-ink">Perkiraan Saldo Habis</h2>
          </div>
          <div className="mt-3">
            {sisaHariProyeksi ? (
              <p className="text-base font-medium text-ink">
                Dengan pola pemakaian saat ini, saldo air Anda diperkirakan habis dalam{" "}
                <strong className="font-mono text-lg font-bold text-brand-700 dark:text-accent">
                  ± {sisaHariProyeksi} hari
                </strong>.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Saldo Anda 0 liter atau data riwayat pemakaian belum cukup untuk membentuk proyeksi.
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-muted">
              *Angka di atas adalah perkiraan berdasarkan debit rata-rata, bukan jaminan kepastian.
            </p>
          </div>
        </div>

        {/*
         * Kartu Komparasi Zona.
         *
         * Arah perbandingannya DIHITUNG dari kedua angka yang ditampilkan,
         * bukan ditulis mati. Versi sebelumnya memaksakan "18% lebih hemat"
         * sambil mencetak "Rata-rata zona 48,2 L/hari · Penggunaan Anda
         * 130,0 L/hari" tepat di bawahnya — kartu yang membantah dirinya
         * sendiri dalam dua baris berturut-turut. Warga yang membaca
         * keduanya berhenti memercayai angka mana pun di halaman ini, dan
         * itu kerugian yang jauh lebih besar daripada satu pujian yang
         * hilang.
         *
         * Rata-rata zonanya sendiri masih nilai tetap: tidak ada endpoint
         * yang mengirimnya. Yang diperbaiki di sini bukan sumber datanya,
         * melainkan kesimpulan yang ditarik darinya.
         */}
        <div className="permukaan p-5">
          <div className="flex items-center gap-2">
            <span
              className={`grid size-7 place-items-center rounded-[8px] ${
                lebihBoros
                  ? "bg-warn/10 text-warn"
                  : "bg-success/10 text-success"
              }`}
            >
              {lebihBoros ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </span>
            <h2 className="text-sm font-bold text-ink">
              Dibanding Rumah Tangga Sezona
            </h2>
          </div>
          <div className="mt-3">
            {rataRataHarianL > 0 ? (
              <p className="text-base font-medium text-ink">
                Konsumsi rumah Anda{" "}
                <strong
                  className={`font-mono text-lg font-bold ${
                    lebihBoros ? "text-warn" : "text-success"
                  }`}
                >
                  {selisihZonaPersen}% lebih {lebihBoros ? "boros" : "hemat"}
                </strong>{" "}
                daripada rata-rata pelanggan golongan serupa di zona Anda.
              </p>
            ) : (
              <p className="text-base font-medium text-muted">
                Belum ada rata-rata harian Anda untuk dibandingkan dengan zona.
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-muted">
              Rata-rata zona: {liter(RATA_ZONA_L_HARI, 1)}/hari &middot;
              Penggunaan Anda: {liter(rataRataHarianL, 1)}/hari
            </p>
          </div>
        </div>
      </div>

      {/* ── Proyeksi saldo & jam paling boros ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="permukaan p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-ink">
                Proyeksi Saldo Air
              </h2>
              <p className="text-xs text-muted">
                Perkiraan sisa saldo bila pemakaian harian tidak berubah.
              </p>
            </div>
            {proyeksiSaldo ? (
              <span className="cekung px-3 py-1.5 font-mono text-xs font-bold text-ink">
                {/* Memakai `sisaHariProyeksi`, angka yang SAMA dengan kartu
                    "Perkiraan Saldo Habis" di atasnya. Menghitungnya sendiri
                    di sini menghasilkan selisih satu hari (bulat ke atas vs
                    pembulatan biasa), dan dua angka berbeda untuk hal yang
                    sama, bersebelahan di satu layar, membatalkan kepercayaan
                    pada keduanya. */}
                Habis ± {sisaHariProyeksi} hari
              </span>
            ) : null}
          </div>

          {proyeksiSaldo ? (
            <>
              {/*
                Ambang 5 L digambar sebagai garis, bukan ditulis di catatan
                kaki. Di titik itulah firmware mulai berbunyi tiap 10 detik —
                kejadian yang dialami warga JAUH sebelum saldonya benar-benar
                nol, dan satu-satunya bagian grafik ini yang berbunyi.
              */}
              <GrafikGaris
                labels={proyeksiSaldo.labels}
                deret={proyeksiSaldo.deret}
                tinggi={210}
                ambang={AMBANG_ALARM_L}
                labelAmbang={`Alarm meter mulai berbunyi (${liter(AMBANG_ALARM_L, 0)})`}
                format={(n) => liter(n, 0)}
              />

              <p className="mt-2 text-[11px] text-muted">
                Dihitung dari rata-rata {liter(rataRataHarianL, 1)} per hari
                {proyeksiSaldo.langkah > 1
                  ? `, satu titik tiap ${proyeksiSaldo.langkah} hari`
                  : ""}
                . Perkiraan, bukan jaminan — pemakaian yang berubah mengubah
                garisnya.
              </p>
            </>
          ) : (
            <div className="cekung grid h-[210px] place-items-center p-6 text-center">
              <p className="max-w-sm text-sm text-muted">
                Belum bisa diproyeksikan: saldo Anda nol, atau riwayat
                pemakaiannya belum cukup untuk membentuk rata-rata harian.
              </p>
            </div>
          )}
        </div>

        {/* Jam paling boros */}
        <div className="permukaan p-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
              <Clock size={16} />
            </span>
            <h2 className="text-sm font-bold text-ink">Jam Paling Boros</h2>
          </div>

          {jamPalingBoros ? (
            <>
              <p className="tabular mt-4 font-mono text-4xl leading-none font-black text-ink">
                {String(jamPalingBoros.jam).padStart(2, "0")}
                <span className="text-xl text-muted">
                  :00–{String((jamPalingBoros.jam + 1) % 24).padStart(2, "0")}
                  :00
                </span>
              </p>
              <p className="mt-3 text-sm text-muted">
                Rata-rata{" "}
                <strong className="font-mono text-ink">
                  {liter(jamPalingBoros.rataL, 1)}
                </strong>{" "}
                pada jam itu — jam tersibuk air di rumah Anda.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                {jamPalingBoros.jam >= 0 && jamPalingBoros.jam < 5
                  ? "Pemakaian terbesar jatuh pada dini hari, saat rumah biasanya tidak memakai air. Periksa kemungkinan rembesan kloset atau sambungan bocor."
                  : "Menggeser sebagian pemakaian keluar dari jam ini meratakan tekanan air di jaringan zona Anda."}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Belum ada rekaman per jam dari meter, jadi jam tersibuknya belum
              bisa ditentukan.
            </p>
          )}
        </div>
      </div>

      {/* ── Peta Panas (Heatmap) 7 × 24 Jam ── */}
      <div className="permukaan p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Peta Panas Pemakaian (7 Hari × 24 Jam)
            </h2>
            <p className="text-xs text-muted">
              Warna menunjukkan volume air per jam. Bergulir mendatar untuk
              melihat jam lengkap di ponsel.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Info size={13} />
            <span>Pembaruan tiap pergantian jam</span>
          </div>
        </div>

        {/* Wadah Tabel Heatmap (Scroll Mandiri di Mobile 390px) */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[48rem]">
            {/* Header Kolom Jam */}
            <div className="grid grid-cols-[3.5rem_repeat(24,1fr)] gap-1 text-center font-mono text-[10px] text-muted">
              <div className="text-left font-semibold">Hari</div>
              {JAM_LABEL.map((jam) => (
                <div key={jam} className="py-1">
                  {jam}
                </div>
              ))}
            </div>

            {/* Baris Hari */}
            <div className="mt-1 space-y-1">
              {HARI_LABEL.map((namaHari, idxHari) => (
                <div
                  key={namaHari}
                  className="grid grid-cols-[3.5rem_repeat(24,1fr)] items-center gap-1"
                >
                  <div className="font-mono text-xs font-semibold text-muted">
                    {namaHari}
                  </div>
                  {JAM_LABEL.map((_, idxJam) => {
                    const vol = gridPetaPanas[idxHari]?.[idxJam] ?? null;
                    const tooltipTeks =
                      vol !== null
                        ? `${namaHari}, Jam ${idxJam}:00 — ${vol} Liter`
                        : `${namaHari}, Jam ${idxJam}:00 — Belum ada data`;

                    return (
                      <div
                        key={idxJam}
                        title={tooltipTeks}
                        className={`aspect-square w-full rounded-[8px] border transition-transform hover:scale-110 ${warnaSelPetaPanas(
                          vol,
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda Skala Warna Peta Panas */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-semibold text-ink">Skala Volume:</span>
            <div className="flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-line/40 bg-surface" />
              <span>0 L</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-brand-500/20 bg-brand-500/15" />
              <span>&lt; 5 L</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-brand-500/40 bg-brand-500/35" />
              <span>5–15 L</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-brand-500/70 bg-brand-500/65" />
              <span>15–30 L</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-brand-600 bg-brand-600" />
              <span>&gt; 30 L</span>
            </div>
            <div className="ml-2 flex items-center gap-1">
              <span className="size-3.5 rounded-[8px] border border-dashed border-line/50 bg-soft/40" />
              <span>Belum ada data</span>
            </div>
          </div>

          <span className="font-mono text-[11px]">Sensor ESP32 JM-200</span>
        </div>
      </div>

      {/* ── Grafik Tren (7 Hari vs 6 Bulan) ── */}
      <div className="permukaan p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Riwayat Konsumsi
            </h2>
            <p className="text-xs text-muted">
              {modeGrafik === "bulan"
                ? "Total tiap hari sepanjang riwayat yang tersimpan server."
                : modeGrafik === "tahun"
                  ? "Total tiap bulan — dibatasi riwayat yang tersimpan server."
                  : "Total tiap hari pada rentang yang Anda pilih."}
            </p>
          </div>

          {/* Alurnya CEKUNG, bidak aktif TIMBUL di dalamnya — bentuk sakelar
              sungguhan, dan satu-satunya bentuk yang memberi tahu sisi mana
              yang menyala tanpa bergantung pada warna. */}
          <div className="cekung flex shrink-0 p-1">
            {(
              [
                ["bulan", "Bulan"],
                ["tahun", "Tahun"],
                ["pilih", "Pilih sendiri"],
              ] as const
            ).map(([nilai, teks]) => (
              <button
                key={nilai}
                type="button"
                onClick={() => setModeGrafik(nilai)}
                aria-pressed={modeGrafik === nilai}
                className={`rounded-[7px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  modeGrafik === nilai
                    ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                    : "text-muted hover:text-ink"
                }`}
              >
                {teks}
              </button>
            ))}
          </div>
        </div>

        {/*
          Kolom tanggal hanya digambar pada mode "pilih sendiri".
          `min`/`max` diikat ke rentang data yang BENAR-BENAR ada, jadi
          tanggal di luar jangkauan tidak bisa dipilih sejak awal —
          mencegahnya lebih baik daripada menjelaskan kekosongan sesudahnya.
        */}
        {modeGrafik === "pilih" ? (
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted">
                Dari tanggal
              </span>
              <input
                type="date"
                value={mulaiPilih}
                min={jangkauanData?.mulai}
                max={jangkauanData?.akhir}
                onChange={(e) => setMulaiPilih(e.target.value)}
                className="cekung bg-surface-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted">
                Sampai tanggal
              </span>
              <input
                type="date"
                value={akhirPilih}
                min={mulaiPilih || jangkauanData?.mulai}
                max={jangkauanData?.akhir}
                onChange={(e) => setAkhirPilih(e.target.value)}
                className="cekung bg-surface-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </label>

            {jangkauanData ? (
              <p className="pb-2 text-[11px] text-muted">
                Riwayat tersedia{" "}
                <strong className="font-mono text-ink">
                  {new Date(`${jangkauanData.mulai}T00:00:00`).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </strong>{" "}
                s/d{" "}
                <strong className="font-mono text-ink">
                  {new Date(`${jangkauanData.akhir}T00:00:00`).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </strong>
                .
              </p>
            ) : null}
          </div>
        ) : null}

        {/*
          Keterangan jujur soal batas server — hanya pada mode "Tahun",
          karena di situlah selisih antara yang DIMINTA dan yang BISA
          diberikan paling besar. Warga yang menekan "Tahun" lalu melihat
          satu kolom berhak tahu kenapa, alih-alih menyangka meternya rusak.
        */}
        {modeGrafik === "tahun" && dataGrafik.length > 0 ? (
          <p className="mb-4 flex items-start gap-2 rounded-[8px] bg-warn-soft px-3 py-2 text-[11px] leading-relaxed text-warn">
            <Info size={13} className="mt-px shrink-0" />
            <span>
              Server menyimpan rekaman per jam hanya {JANGKAUAN_HARI} hari
              terakhir, jadi tampilan tahunan ini belum bisa menampilkan
              dua belas bulan penuh. Yang tergambar adalah bulan yang
              benar-benar punya rekaman.
            </span>
          </p>
        ) : null}

        {memuat ? (
          <div className="cekung h-60 animate-pulse" />
        ) : dataGrafik.length === 0 ? (
          <div className="cekung grid h-60 place-items-center p-6 text-center">
            {/* Tiga sebab kosong yang BERBEDA, dan masing-masing menuntut
                tindakan berbeda dari warga. Satu kalimat seragam untuk
                ketiganya membuat dua di antaranya terbaca seperti kerusakan. */}
            <p className="max-w-sm text-sm text-muted">
              {modeGrafik === "pilih" && (!mulaiPilih || !akhirPilih)
                ? "Pilih tanggal mulai dan tanggal akhir untuk menggambar grafiknya."
                : modeGrafik === "pilih"
                  ? "Tidak ada rekaman pemakaian pada rentang tanggal itu. Coba rentang di dalam riwayat yang tersedia."
                  : "Meter belum mengirim rekaman pemakaian, jadi belum ada pola yang bisa digambar."}
            </p>
          </div>
        ) : (
          /*
            Lebar MINIMUM dan MAKSIMUM, keduanya diperlukan — masing-masing
            memperbaiki kerusakan di ujung yang berlawanan.

            Minimum: pada 390px tujuh tabung hanya kebagian ~45px, dan angka
            "143 L" di atasnya saling menindih dengan tetangganya. Dua puluh
            empat tabung mode per-jam lebih parah lagi. Lebih baik pembacanya
            menggeser daripada menyipitkan mata ke angka yang bertumpuk.

            Maksimum: kartu ini selebar halaman, jadi pada 1440px tujuh
            tabung melar sampai ~140px — balok gemuk yang kehilangan watak
            tabungnya. Dibatasi dan ditengahkan supaya proporsinya tetap sama
            dengan grafik di beranda.
          */
          <div className="overflow-x-auto pb-1">
            <div
              /* Lebar minimum mengikuti JUMLAH KOLOM, bukan mode. Tiga puluh
                 hari pada 390px hanya kebagian ~11px per tabung dan angkanya
                 saling menindih; dua kolom tahunan justru melar jadi balok
                 gemuk kalau dibiarkan selebar kartu. */
              className={
                dataGrafik.length > 12
                  ? "min-w-[52rem]"
                  : "min-w-[20rem]"
              }
            >
              <GrafikAir
                data={dataGrafik}
                tinggi={230}
                format={(n) => liter(n, 0)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tips Hemat Berdasarkan Pola Nyata ── */}
      <div className="permukaan p-5">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-brand-600 dark:text-accent" />
          <h3 className="font-display text-sm font-bold text-ink">
            Tips Penghematan Berdasarkan Pola Anda
          </h3>
        </div>
        {/*
          Jamnya diambil dari `jamPalingBoros`, BUKAN ditulis mati.
          Versi sebelumnya mengumumkan "Puncak Pagi Terdeteksi (06:00–07:00)"
          untuk setiap warga — dan pada meter ini jam tersibuknya 13:00.
          Kartu tips membantah kartu "Jam Paling Boros" di layar yang sama,
          sambil memakai kata "Terdeteksi" yang menjanjikan pengukuran.
        */}
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs leading-relaxed text-muted sm:grid-cols-2">
          {jamPalingBoros ? (
            <div className="cekung p-3">
              <strong className="text-ink">
                Puncak harian pukul{" "}
                {String(jamPalingBoros.jam).padStart(2, "0")}:00:
              </strong>{" "}
              rata-rata {liter(jamPalingBoros.rataL, 1)} pada jam itu. Menggeser
              sebagian pemakaian ke jam lain meratakan tekanan air di jaringan
              zona Anda.
            </div>
          ) : (
            <div className="cekung p-3">
              <strong className="text-ink">Pola harian belum terbaca:</strong>{" "}
              meter belum mengirim cukup rekaman per jam untuk menunjukkan jam
              tersibuk di rumah Anda.
            </div>
          )}

          <div className="cekung p-3">
            <strong className="text-ink">Periksa dini hari (00:00–05:00):</strong>{" "}
            saat semua keran tertutup, tabung pada jam-jam itu seharusnya
            mendekati kosong. Tabung yang bertahan terisi malam demi malam
            menandakan rembesan — kloset atau sambungan yang longgar.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HalamanPemakaian() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Memuat pemakaian...</div>}>
      <KontenPemakaian />
    </Suspense>
  );
}
