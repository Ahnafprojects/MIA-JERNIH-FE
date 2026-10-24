/**
 * SUMBER DATA SEMENTARA — HAPUS SETELAH BACKEND SIAP.
 *
 * Lapisan tambahan untuk halaman statistik: neraca air, tolok ukur, pemakaian
 * per orang, dan tren bulanan. Berkas ini melengkapi `./data.ts`, bukan
 * menggantikannya — totalnya DITURUNKAN dari `statistik()` di sana, tidak
 * ditulis ulang sebagai konstanta.
 *
 * Itu bukan pilihan gaya. Kalau rincian neraca air ditulis sebagai angka
 * tetap, jumlahnya tidak akan cocok dengan kehilangan yang sudah tampil di
 * layar begitu rentang waktunya diganti — dan ketidakcocokan sebesar itu
 * adalah hal pertama yang dicari orang pada halaman yang menjanjikan
 * transparansi. Di sini rinciannya membagi habis satu angka yang sama, sampai
 * ke meter kubik terakhir.
 *
 * Cara mematikannya nanti: arahkan `NEXT_PUBLIC_API_URL` ke backend sungguhan,
 * lalu hapus seluruh folder `src/app/api/publik`. Tipe datanya tetap hidup di
 * `src/app/(publik)/statistik/_bagian/tipe.ts`.
 */

import type {
  KelompokKunci,
  KelompokNeraca,
  KomponenNeraca,
  MetaData,
  NeracaAirPublik,
  TitikBulanan,
  TolokUkur,
} from "@/app/(publik)/statistik/_bagian/tipe";
import { angka } from "@/lib/format";
import { statistik } from "./data";

const SEKARANG = () => new Date();

/** Rentang yang dilayani. Di luar ini jatuh ke 30 hari. */
export const RENTANG_SAH = [7, 30, 90];

export const rentangSah = (n: number) => (RENTANG_SAH.includes(n) ? n : 30);

/* ── Asumsi yang diakui terbuka ─────────────────────────────────────── */

/**
 * Rata-rata jiwa per rumah tangga, acuan BPS.
 *
 * Ini ASUMSI, bukan hasil pendataan per sambungan — dan karena itu ia ikut
 * ditulis di daftar batasan yang tampil di halaman. Mengubah angka ini
 * mengubah seluruh bagian "pemakaian per orang"; jangan disetel diam-diam
 * supaya hasilnya terlihat lebih bagus.
 */
export const JIWA_PER_SAMBUNGAN = 3.9;

/** Kebutuhan pokok air minum, liter/orang/hari. Acuan WHO. */
export const KEBUTUHAN_DASAR_L = 60;

/* ── Neraca air ─────────────────────────────────────────────────────── */

const KELOMPOK: { kunci: KelompokKunci; nama: string; ringkas: string }[] = [
  {
    kunci: "fisik",
    nama: "Kehilangan fisik",
    ringkas:
      "Air yang benar-benar keluar dari jaringan sebelum sampai ke rumah mana pun. Inilah yang hilang dalam arti harfiah.",
  },
  {
    kunci: "komersial",
    nama: "Kehilangan non-fisik",
    ringkas:
      "Air yang sampai ke pemakainya, tetapi tidak pernah tercatat utuh di meter. Volumenya tidak hilang; catatannya yang hilang.",
  },
  {
    kunci: "resmi",
    nama: "Pemakaian resmi tanpa tagihan",
    ringkas:
      "Air yang memang dipakai untuk merawat jaringan dan menghadapi keadaan darurat. Tercatat sebagai kehilangan, tetapi bukan kebocoran.",
  },
];

/**
 * Porsi tiap komponen terhadap SELURUH kehilangan, dalam persen.
 *
 * Jumlah seluruh `porsi` WAJIB 100 — kalau tidak, rinciannya tidak akan
 * membagi habis kehilangan yang tampil di layar.
 *
 * Susunannya mengikuti kerangka neraca air IWA dan kisaran yang lazim pada
 * PDAM di Indonesia: kehilangan fisik mendominasi (sekitar enam dari sepuluh
 * meter kubik), kesalahan ukur meter adalah penyumbang non-fisik terbesar,
 * dan pemakaian resmi tanpa tagihan tinggal porsi kecil.
 */
const KOMPONEN: {
  kunci: string;
  kelompok: KelompokKunci;
  nama: string;
  catatan: string;
  porsi: number;
}[] = [
  {
    kunci: "bocor-distribusi",
    kelompok: "fisik",
    nama: "Kebocoran pipa distribusi",
    catatan: "Pipa induk dan pipa cabang di bawah jalan.",
    porsi: 41,
  },
  {
    kunci: "bocor-dinas",
    kelompok: "fisik",
    nama: "Kebocoran pipa dinas",
    catatan: "Ruas dari pipa cabang sampai meter pelanggan.",
    porsi: 14,
  },
  {
    kunci: "luapan-reservoir",
    kelompok: "fisik",
    nama: "Luapan dan rembesan reservoir",
    catatan: "Tangki, bak pelepas tekan, dan katup penyusunnya.",
    porsi: 7,
  },
  {
    kunci: "salah-ukur-meter",
    kelompok: "komersial",
    nama: "Kesalahan ukur meter pelanggan",
    catatan: "Meter tua membaca lebih rendah dari aliran sebenarnya.",
    porsi: 17,
  },
  {
    kunci: "sambungan-liar",
    kelompok: "komersial",
    nama: "Sambungan tidak tercatat",
    catatan: "Sambungan liar dan pipa yang melewati meter.",
    porsi: 9,
  },
  {
    kunci: "salah-catat",
    kelompok: "komersial",
    nama: "Kesalahan baca dan catat",
    catatan: "Pembacaan yang gagal terkirim atau salah masuk ke tagihan.",
    porsi: 4,
  },
  {
    kunci: "pembilasan",
    kelompok: "resmi",
    nama: "Pembilasan jaringan dan uji mutu",
    catatan: "Air dibuang untuk membersihkan pipa dan mengambil sampel.",
    porsi: 5,
  },
  {
    kunci: "hidran",
    kelompok: "resmi",
    nama: "Hidran dan kebutuhan darurat",
    catatan: "Pemadaman kebakaran dan penyaluran saat gangguan.",
    porsi: 3,
  },
];

/**
 * Membagi `total` menurut `porsi` sehingga hasilnya BULAT dan jumlahnya
 * kembali persis `total`.
 *
 * Pembulatan biasa pada delapan baris sekaligus meleset sampai beberapa meter
 * kubik, dan baris "jumlah" di halaman akan berbeda dari angka besar di
 * atasnya. Metode sisa terbesar membagikan selisihnya kepada baris yang
 * pecahannya paling besar, jadi tidak ada satu meter kubik pun yang menguap
 * atau muncul dari ketiadaan.
 */
function bagiTepat(total: number, porsi: number[]): number[] {
  const jumlahPorsi = porsi.reduce((a, b) => a + b, 0);
  if (jumlahPorsi <= 0 || total <= 0) return porsi.map(() => 0);

  const mentah = porsi.map((p) => (total * p) / jumlahPorsi);
  const hasil = mentah.map((v) => Math.floor(v));
  let sisa = total - hasil.reduce((a, b) => a + b, 0);

  const urutPecahan = mentah
    .map((v, i) => ({ i, pecahan: v - Math.floor(v) }))
    .sort((a, b) => b.pecahan - a.pecahan);

  for (let k = 0; sisa > 0 && k < urutPecahan.length; k += 1) {
    hasil[urutPecahan[k].i] += 1;
    sisa -= 1;
  }
  return hasil;
}

const persen1 = (bagian: number, dari: number) =>
  dari > 0 ? Math.round((bagian / dari) * 1000) / 10 : 0;

function kelompokNeraca(totalKehilangan: number): KelompokNeraca[] {
  const volume = bagiTepat(
    totalKehilangan,
    KOMPONEN.map((k) => k.porsi),
  );

  const komponen: KomponenNeraca[] = KOMPONEN.map((k, i) => ({
    kunci: k.kunci,
    kelompok: k.kelompok,
    nama: k.nama,
    catatan: k.catatan,
    volumeM3: volume[i],
    // Porsi DIHITUNG ULANG dari volume yang sudah dibulatkan, bukan disalin
    // dari `k.porsi`. Dengan begitu persen di layar selalu cocok dengan meter
    // kubik di sebelahnya.
    porsiPct: persen1(volume[i], totalKehilangan),
  }));

  return KELOMPOK.map((g) => {
    const isi = komponen.filter((k) => k.kelompok === g.kunci);
    const volumeM3 = isi.reduce((a, k) => a + k.volumeM3, 0);
    return {
      kunci: g.kunci,
      nama: g.nama,
      ringkas: g.ringkas,
      volumeM3,
      porsiPct: persen1(volumeM3, totalKehilangan),
      komponen: isi,
    };
  });
}

/* ── Tolok ukur ─────────────────────────────────────────────────────── */

/**
 * Pembanding untuk angka NRW. Tanpa ini "19%" tidak berarti apa-apa bagi
 * pembaca yang belum pernah mengurus jaringan air.
 */
const TOLOK_UKUR: TolokUkur[] = [
  {
    kunci: "terbaik",
    nama: "Praktik terbaik internasional",
    nilaiPct: 15,
    sumber: "Kerangka neraca air IWA",
  },
  {
    kunci: "target",
    nama: "Target pemerintah",
    nilaiPct: 20,
    sumber: "Sasaran penyelenggaraan SPAM nasional",
  },
  {
    kunci: "nasional",
    nama: "Rata-rata PDAM nasional",
    nilaiPct: 25,
    sumber: "Titik tengah kisaran 20–30% yang lazim dilaporkan",
  },
];

/* ── Tren bulanan ───────────────────────────────────────────────────── */

const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Dua belas bulan terakhir, bulan berjalan di ujung kanan.
 *
 * Rentang 7/30/90 hari menjawab "sekarang di posisi mana"; hanya deret
 * sepanjang ini yang menjawab "arahnya ke mana". Sengaja TIDAK bergantung
 * pada rentang yang dipilih pembaca: arah setahun bukan sesuatu yang berubah
 * karena seseorang menekan tombol 7 hari.
 *
 * Bentuknya: menurun pelan dari sekitar 23,6% ke sekitar 19,4%, bergoyang,
 * dan baru melewati garis target 20% pada dua bulan terakhir. Garis lurus
 * menurun akan terbaca sebagai karangan, dan deret yang selalu di bawah
 * target menghapus satu-satunya hal menarik dari grafik tren.
 */
export function trenBulanan(): TitikBulanan[] {
  const kini = SEKARANG();
  const hasil: TitikBulanan[] = [];

  for (let i = 0; i < 12; i += 1) {
    const d = new Date(kini.getFullYear(), kini.getMonth() - (11 - i), 1);
    const hariDalamBulan = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
    ).getDate();

    const perHari = 1180 + Math.sin(i / 1.9) * 55;
    const disalurkanM3 = Math.round(perHari * hariDalamBulan);
    const nrwArah = 23.6 - i * 0.36 + Math.sin(i * 1.1) * 0.55;
    const tercatatM3 = Math.round(disalurkanM3 * (1 - nrwArah / 100));
    const kehilanganM3 = disalurkanM3 - tercatatM3;

    const bulan = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    hasil.push({
      bulan,
      // Januari membawa tahunnya: tanpa itu deret 12 bulan yang melintasi
      // pergantian tahun terbaca seolah semuanya di tahun yang sama.
      label:
        d.getMonth() === 0
          ? `${NAMA_BULAN[0]} ${String(d.getFullYear()).slice(2)}`
          : NAMA_BULAN[d.getMonth()],
      disalurkanM3,
      tercatatM3,
      kehilanganM3,
      // Diturunkan dari volume yang SUDAH dibulatkan, supaya grafik dan berkas
      // unduhan tidak pernah berbeda di angka di belakang koma.
      nrwPct: persen1(kehilanganM3, disalurkanM3),
    });
  }

  return hasil;
}

/* ── Meta ───────────────────────────────────────────────────────────── */

/**
 * Keterangan yang ikut terbawa ke berkas JSON yang diunduh.
 *
 * Batasannya ditulis di sini, bukan hanya di halaman, supaya orang yang
 * memakai datanya lewat API tetap membacanya. Data terbuka tanpa daftar
 * batasan adalah undangan untuk salah kutip.
 */
export const META: MetaData = {
  sumber:
    "Meter induk tiap zona dan meter pelanggan pada jaringan Jernih. Porsi komponen neraca air berasal dari audit neraca air triwulanan.",
  pembaruan:
    "Agregat harian disusun ulang setiap hari pukul 02.00 WIB. Komponen neraca air diperbarui tiap triwulan.",
  lisensi:
    "Bebas dipakai ulang, termasuk untuk tujuan komersial, dengan menyebut Jernih sebagai sumber (CC BY 4.0).",
  catatan: [
    "Meter pelanggan dibaca harian sedangkan meter induk tiap 15 menit; selisih waktu baca membuat angka satu hari bisa bergeser sekitar 1,5 poin. Yang stabil adalah rata-rata mingguan ke atas.",
    "Porsi komponen neraca air berasal dari audit triwulanan, bukan pengukuran harian. Yang berubah mengikuti rentang yang dipilih adalah volumenya, bukan porsinya.",
    // `angka()`, bukan interpolasi langsung: `${3.9}` menulis "3.9" dengan
    // titik desimal, dan satu angka berformat Inggris di tengah halaman
    // berbahasa Indonesia langsung terlihat sebagai teks yang lolos.
    `Jumlah jiwa terlayani adalah perkiraan dari ${angka(JIWA_PER_SAMBUNGAN, 1)} jiwa per sambungan (rata-rata rumah tangga nasional), bukan hasil pendataan per rumah.`,
    "Pemakaian per orang hanya menghitung air PDAM yang tercatat di meter. Sumur, mata air, dan air kemasan tidak masuk hitungan.",
    "Zona yang meter induknya sedang diperbaiki dihitung memakai estimasi, dan NRW zona tersebut punya ketidakpastian lebih lebar.",
    "Angka pada halaman ini belum diaudit pihak ketiga.",
  ],
};

/* ── Rakitan ────────────────────────────────────────────────────────── */

/** Daftar tanggal ISO yang URUTANNYA sama persis dengan `labels` di `statistik()`. */
export function tanggalHarian(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(SEKARANG().getTime() - (n - 1 - i) * 86400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  });
}

export function neracaAir(hariMasuk: number): NeracaAirPublik {
  const hari = rentangSah(hariMasuk);
  const dasar = statistik(hari);

  const totalDisalurkanM3 = dasar.volumeDisalurkanM3;
  const totalTercatatM3 = dasar.volumeTercatatM3;
  const totalKehilanganM3 = totalDisalurkanM3 - totalTercatatM3;

  const jiwaTerlayani = Math.round(
    dasar.pelangganTerlayani * JIWA_PER_SAMBUNGAN,
  );
  const perOrangHari = (volumeM3: number) =>
    jiwaTerlayani > 0 && hari > 0
      ? Math.round(((volumeM3 * 1000) / jiwaTerlayani / hari) * 10) / 10
      : 0;

  const tercatatLOrangHari = perOrangHari(totalTercatatM3);

  return {
    rentangHari: hari,
    totalDisalurkanM3,
    totalTercatatM3,
    totalKehilanganM3,
    nrwPct: persen1(totalKehilanganM3, totalDisalurkanM3),
    kelompok: kelompokNeraca(totalKehilanganM3),
    perOrang: {
      jiwaTerlayani,
      jiwaPerSambungan: JIWA_PER_SAMBUNGAN,
      disalurkanLOrangHari: perOrangHari(totalDisalurkanM3),
      tercatatLOrangHari,
      kebutuhanDasarLOrangHari: KEBUTUHAN_DASAR_L,
      pemenuhanPct: persen1(tercatatLOrangHari, KEBUTUHAN_DASAR_L),
    },
    tolokUkur: TOLOK_UKUR,
    bulanan: trenBulanan(),
    meta: META,
  };
}
