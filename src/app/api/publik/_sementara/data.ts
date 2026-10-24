/**
 * SUMBER DATA SEMENTARA — HAPUS SETELAH BACKEND SIAP.
 *
 * Backend Jernih (MIA-JERNIH-BE) masih dikerjakan. Supaya halaman publik bisa
 * dibangun dan ditinjau lebih dulu, rute di `src/app/api/publik/*` menyajikan
 * bentuk jawaban yang SAMA PERSIS dengan kontrak di issue BE#2.
 *
 * Cara mematikannya nanti: arahkan `NEXT_PUBLIC_API_URL` ke alamat backend
 * sungguhan, lalu hapus seluruh folder `src/app/api/publik`. Tidak ada
 * perubahan lain yang diperlukan — halaman tidak tahu dari mana datanya
 * datang, dan memang harus begitu.
 *
 * Angkanya sengaja TIDAK sempurna: ketepatan SLA 92,9% dan NRW 19,5% adalah
 * angka yang masuk akal untuk PDAM. Angka bulat seperti 100% justru terbaca
 * sebagai karangan.
 */

import type { Titik, ZonaStatus } from "@/types/publik";

const SEKARANG = () => new Date();

const jamLalu = (j: number) =>
  new Date(SEKARANG().getTime() - j * 3600_000).toISOString();

/**
 * Batas wilayah layanan, URUTAN [bujur, lintang] — bukan sebaliknya.
 *
 * Sementara sampai BE#10 mengirim GeoJSON sungguhan dari basis data wilayah.
 * Bentuknya disederhanakan tapi letaknya benar: keempatnya duduk di cekungan
 * Bandung, dan zona yang bertetangga memang berbagi sisi (Bandung Timur
 * menempel ke Cileunyi) supaya petanya terbaca sebagai pembagian wilayah,
 * bukan empat kotak yang mengambang.
 */
const BATAS: Record<string, Titik[]> = {
  // Bandung Timur — Arcamanik, Ujungberung, Gedebage, Cibiru.
  z1: [
    [107.638, -6.892],
    [107.696, -6.883],
    [107.734, -6.909],
    [107.738, -6.953],
    [107.694, -6.976],
    [107.647, -6.964],
    [107.626, -6.926],
  ],
  // Cileunyi — menempel di sisi timur Bandung Timur. Dua titik terakhirnya
  // SAMA PERSIS dengan sisi timur z1; kalau salah satunya diubah, yang lain
  // ikut diubah, atau akan muncul celah putih di antara dua zona.
  z2: [
    [107.734, -6.909],
    [107.78, -6.891],
    [107.826, -6.912],
    [107.83, -6.956],
    [107.786, -6.982],
    [107.742, -6.97],
    [107.738, -6.953],
  ],
  // Cimahi — terpisah di barat cekungan.
  z3: [
    [107.486, -6.838],
    [107.546, -6.828],
    [107.58, -6.858],
    [107.576, -6.906],
    [107.53, -6.93],
    [107.488, -6.908],
    [107.474, -6.872],
  ],
  // Sumedang — paling luas, di timur laut.
  z4: [
    [107.858, -6.772],
    [107.948, -6.752],
    [108.016, -6.808],
    [108.006, -6.886],
    [107.932, -6.922],
    [107.862, -6.88],
    [107.846, -6.822],
  ],
};

/** Cincin GeoJSON wajib tertutup: titik terakhir harus sama dengan yang pertama. */
const tutup = (cincin: Titik[]): Titik[] => [...cincin, cincin[0]];

export const ZONA: ZonaStatus[] = [
  {
    id: "z1",
    nama: "Bandung Timur",
    status: "gangguan",
    pelangganTerdampak: 312,
    sejak: jamLalu(5),
    perkiraanPulih: new Date(SEKARANG().getTime() + 3 * 3600_000).toISOString(),
    keterangan: "Perbaikan pipa induk di Jl. Soekarno-Hatta.",
    batas: tutup(BATAS.z1),
  },
  {
    id: "z2",
    nama: "Cileunyi",
    status: "normal",
    pelangganTerdampak: 0,
    sejak: null,
    perkiraanPulih: null,
    keterangan: null,
    batas: tutup(BATAS.z2),
  },
  {
    id: "z3",
    nama: "Cimahi",
    status: "perbaikan",
    pelangganTerdampak: 74,
    sejak: jamLalu(22),
    perkiraanPulih: new Date(SEKARANG().getTime() + 9 * 3600_000).toISOString(),
    keterangan: "Penggantian meter induk, aliran bergilir.",
    batas: tutup(BATAS.z3),
  },
  {
    id: "z4",
    nama: "Sumedang",
    status: "normal",
    pelangganTerdampak: 0,
    sejak: null,
    perkiraanPulih: null,
    keterangan: null,
    batas: tutup(BATAS.z4),
  },
];

export const TIKET = [
  {
    nomor: "LP-2026-10-0384",
    kategori: "Kebocoran pipa",
    status: "DIPROSES" as const,
    zona: "Cimahi",
    dibuatPada: jamLalu(6),
    slaJatuhTempo: new Date(
      SEKARANG().getTime() + 1.6 * 3600_000,
    ).toISOString(),
    slaTerlampaui: false,
    kronologi: [
      { waktu: jamLalu(6), judul: "Laporan diterima" },
      {
        waktu: jamLalu(5),
        judul: "Diverifikasi petugas",
        catatan: "Foto dan titik lokasi sesuai.",
      },
      { waktu: jamLalu(2), judul: "Ditugaskan ke teknisi lapangan" },
    ],
  },
  {
    nomor: "LP-2026-10-0379",
    kategori: "Air keruh / berbau",
    status: "SELESAI" as const,
    zona: "Bandung Timur",
    dibuatPada: jamLalu(54),
    slaJatuhTempo: jamLalu(50),
    slaTerlampaui: true,
    kronologi: [
      { waktu: jamLalu(54), judul: "Laporan diterima" },
      { waktu: jamLalu(47), judul: "Ditugaskan ke teknisi lapangan" },
      {
        waktu: jamLalu(41),
        judul: "Selesai ditangani",
        catatan: "Pembilasan jaringan, air kembali jernih.",
      },
    ],
  },
];

const hariLabel = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(SEKARANG().getTime() - (n - 1 - i) * 86400_000);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

/** Deret yang bergoyang wajar, bukan garis lurus yang terbaca sebagai karangan. */
const goyang = (n: number, dasar: number, amplitudo: number) =>
  Array.from({ length: n }, (_, i) =>
    Math.round(dasar + Math.sin(i / 2.1) * amplitudo + ((i * 37) % 11) - 5),
  );

/**
 * Angka KPI DITURUNKAN dari deret trennya, bukan ditulis sebagai konstanta.
 *
 * Versi pertama memakai nilai tetap, sehingga mengganti 7 → 30 → 90 hari
 * menampilkan 92,9% yang sama persis setiap kali. Di mata pembaca itu
 * terbaca sebagai tombol yang rusak — dan memang tidak ada rentang waktu
 * yang menghasilkan rata-rata yang sama sampai satu angka di belakang koma.
 *
 * Dengan menurunkannya dari deret, angka ringkasan dan grafiknya SELALU
 * konsisten satu sama lain: itu yang akan dicocokkan orang.
 */
export function kinerja(hari: number) {
  const labels = hariLabel(hari);
  const tren = goyang(hari, 92, 4);
  const rata = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  const ketepatan = Math.round(rata(tren) * 10) / 10;
  // Beban pengaduan tumbuh dengan periode, tapi tidak linear sempurna —
  // periode panjang mencakup hari sepi dan hari ramai.
  const masuk = Math.round(hari * 6.1 + (hari % 7) * 3);
  const selesai = Math.round(masuk * (ketepatan / 100) * 1.004);
  const tanggap = Math.round(74 + (92 - ketepatan) * 6);

  /** Porsi tiap kategori tetap; jumlahnya ikut beban periode. */
  const KATEGORI: [string, number, number][] = [
    ["Kebocoran pipa", 0.33, 95.1],
    ["Air tidak mengalir", 0.24, 90.9],
    ["Air keruh / berbau", 0.18, 93.9],
    ["Tekanan lemah", 0.15, 85.7],
    ["Meter / keypad rusak", 0.1, 88.9],
  ];

  return {
    periode: {
      mulai: new Date(SEKARANG().getTime() - hari * 86400_000).toISOString(),
      selesai: SEKARANG().toISOString(),
      hari,
    },
    kpi: [
      { key: "tiketMasuk", label: "Pengaduan masuk", value: masuk },
      { key: "tiketSelesai", label: "Selesai ditangani", value: selesai },
      {
        key: "ketepatanSlaPct",
        label: "Tepat waktu",
        value: ketepatan,
        unit: "%",
        tone: ketepatan >= 90 ? ("success" as const) : ("warn" as const),
      },
      {
        key: "rataTanggapMenit",
        label: "Rata-rata waktu tanggap",
        value: tanggap,
        unit: "menit",
      },
    ],
    perKategori: KATEGORI.map(([kategori, porsi, ketepatanPct]) => {
      const m = Math.round(masuk * porsi);
      return {
        kategori,
        masuk: m,
        selesai: Math.round(m * (ketepatanPct / 100)),
        ketepatanPct,
      };
    }),
    tren: {
      labels,
      series: [{ name: "Ketepatan SLA", unit: "%", points: tren }],
    },
  };
}

/**
 * Membagi satu bilangan bulat menurut porsi, TANPA menghilangkan sisa.
 *
 * Membulatkan tiap bagian sendiri-sendiri hampir selalu meleset satu-dua dari
 * totalnya, dan di halaman ini selisih itu langsung terlihat: jumlah kolom
 * tabel per zona tidak sama dengan angka besar di atasnya, dan berkas CSV
 * yang diunduh orang tidak berjumlah sama dengan yang di layar. Metode sisa
 * terbesar memberikan satuan sisa kepada bagian dengan pecahan terbesar,
 * sehingga jumlahnya PERSIS sama.
 */
function bagiBulat(total: number, porsi: number[]): number[] {
  const mentah = porsi.map((p) => total * p);
  const hasil = mentah.map(Math.floor);
  const sisa = total - hasil.reduce((a, b) => a + b, 0);
  const urut = mentah
    .map((m, i) => ({ i, pecahan: m - Math.floor(m) }))
    .sort((a, b) => b.pecahan - a.pecahan);
  for (let k = 0; k < sisa; k++) hasil[urut[k % urut.length].i] += 1;
  return hasil;
}

/**
 * Zona: jumlah pelanggan tetap, porsi volume dan kehilangan RELATIF.
 *
 * Jumlah pelanggannya dijumlahkan persis 8.219 — angka yang sama dengan
 * `pelangganTerlayani`. Porsi volumenya sengaja TIDAK sama persis dengan
 * porsi pelanggannya: zona memang berbeda pola pakainya. Tapi selisihnya
 * dijaga kecil, karena 1.179 pelanggan yang memakai air sebanyak 3.140
 * pelanggan adalah angka yang tidak terjadi.
 *
 * `relatifNrw` adalah kehilangan zona itu dibanding rata-rata jaringan:
 * di bawah 1 lebih baik daripada rata-rata, di atas 1 lebih buruk.
 */
const ZONA_BAGI = [
  { nama: "Bandung Timur", pelanggan: 3140, porsiVolume: 0.371, relatifNrw: 0.74 },
  { nama: "Cileunyi", pelanggan: 2016, porsiVolume: 0.249, relatifNrw: 1.14 },
  { nama: "Cimahi", pelanggan: 1884, porsiVolume: 0.236, relatifNrw: 1.28 },
  { nama: "Sumedang", pelanggan: 1179, porsiVolume: 0.144, relatifNrw: 0.95 },
];

export function statistik(hari: number) {
  const labels = hariLabel(hari);

  /*
   * Volume harian DIIKAT ke jumlah pelanggannya, bukan dipilih karena
   * grafiknya terlihat bagus.
   *
   * Nilai sebelumnya 1.180 m³/hari untuk 8.219 sambungan — sekitar 144 liter
   * per sambungan per hari, atau 30 liter per orang per hari. Itu DI BAWAH
   * ambang kebutuhan dasar WHO (60 l/orang/hari), dan artinya PDAM yang
   * sedang kita tampilkan sebenarnya gagal melayani warganya. Angka itu
   * membantah sendiri cerita ketepatan layanan 92% di halaman Rapor Kinerja —
   * dan penilai dari sektor air akan melihatnya lebih dulu daripada
   * desainnya.
   *
   * 4.930 m³/hari ≈ 600 liter per sambungan per hari ≈ 18 m³ per bulan,
   * yang memang kisaran rumah tangga PDAM di Indonesia.
   */
  const disalurkan = goyang(hari, 4930, 380);

  /*
   * Rasio tercatat BERUBAH dari hari ke hari, tidak dipatok satu angka.
   *
   * Dengan rasio tetap, NRW keluar 19,5% untuk 7, 30, maupun 90 hari — dan
   * kehilangan air yang sama persis di tiga periode berbeda adalah hal yang
   * tidak terjadi di jaringan mana pun. Pembaca yang mengganti rentang lalu
   * melihat angka yang sama akan menyimpulkan datanya tidak sungguhan.
   */
  const tercatat = disalurkan.map((v, i) =>
    Math.round(v * (0.805 + Math.sin(i / 3.7) * 0.035)),
  );
  const totalDisalurkan = disalurkan.reduce((a, b) => a + b, 0);
  const totalTercatat = tercatat.reduce((a, b) => a + b, 0);

  /*
   * Rincian per zona DITURUNKAN dari totalnya, bukan ditulis sebagai angka
   * tetap.
   *
   * Versi sebelumnya memakai empat baris hafalan yang sama untuk 7, 30, dan
   * 90 hari. Dua akibatnya, dan keduanya ketahuan oleh orang yang menjumlah:
   * tabelnya diam saat seluruh halaman di sekitarnya berubah rentang, dan
   * jumlah volumenya 32.550 m³ sementara angka besar di atasnya 35.562 m³ —
   * selisih 3.012 m³ yang tidak bisa dijelaskan.
   *
   * Sekarang volume dan kehilangan dibagi dengan metode sisa terbesar,
   * sehingga keduanya berjumlah PERSIS sama dengan totalnya di rentang mana
   * pun, dan NRW tiap zona dihitung dari hasil bagi itu — bukan sebaliknya.
   */
  const volumeZona = bagiBulat(
    totalDisalurkan,
    ZONA_BAGI.map((z) => z.porsiVolume),
  );
  const bobotHilang = ZONA_BAGI.map((z) => z.porsiVolume * z.relatifNrw);
  const jumlahBobot = bobotHilang.reduce((a, b) => a + b, 0);
  const hilangZona = bagiBulat(
    totalDisalurkan - totalTercatat,
    bobotHilang.map((b) => b / jumlahBobot),
  );

  return {
    pelangganTerlayani: 8219,
    volumeDisalurkanM3: totalDisalurkan,
    volumeTercatatM3: totalTercatat,
    nrwPct:
      Math.round(((totalDisalurkan - totalTercatat) / totalDisalurkan) * 1000) /
      10,
    jumlahZona: ZONA.length,
    labels,
    series: [
      { name: "Air disalurkan", unit: "m³", points: disalurkan },
      { name: "Air tercatat", unit: "m³", points: tercatat },
    ],
    perZona: ZONA_BAGI.map((z, i) => ({
      nama: z.nama,
      pelanggan: z.pelanggan,
      volumeM3: volumeZona[i],
      nrwPct: Math.round((hilangZona[i] / volumeZona[i]) * 1000) / 10,
    })),
  };
}
