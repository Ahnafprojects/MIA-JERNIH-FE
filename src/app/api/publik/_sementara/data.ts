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

const SEKARANG = () => new Date();

const jamLalu = (j: number) =>
  new Date(SEKARANG().getTime() - j * 3600_000).toISOString();

export const ZONA = [
  {
    id: "z1",
    nama: "Bandung Timur",
    status: "gangguan" as const,
    pelangganTerdampak: 312,
    sejak: jamLalu(5),
    perkiraanPulih: new Date(SEKARANG().getTime() + 3 * 3600_000).toISOString(),
    keterangan: "Perbaikan pipa induk di Jl. Soekarno-Hatta.",
  },
  {
    id: "z2",
    nama: "Cileunyi",
    status: "normal" as const,
    pelangganTerdampak: 0,
    sejak: null,
    perkiraanPulih: null,
    keterangan: null,
  },
  {
    id: "z3",
    nama: "Cimahi",
    status: "perbaikan" as const,
    pelangganTerdampak: 74,
    sejak: jamLalu(22),
    perkiraanPulih: new Date(SEKARANG().getTime() + 9 * 3600_000).toISOString(),
    keterangan: "Penggantian meter induk, aliran bergilir.",
  },
  {
    id: "z4",
    nama: "Sumedang",
    status: "normal" as const,
    pelangganTerdampak: 0,
    sejak: null,
    perkiraanPulih: null,
    keterangan: null,
  },
];

export const TIKET = [
  {
    nomor: "LP-2026-10-0384",
    kategori: "Kebocoran pipa",
    status: "DIPROSES" as const,
    zona: "Cimahi",
    dibuatPada: jamLalu(6),
    slaJatuhTempo: new Date(SEKARANG().getTime() + 1.6 * 3600_000).toISOString(),
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

export function kinerja(hari: number) {
  const labels = hariLabel(hari);
  return {
    periode: {
      mulai: new Date(SEKARANG().getTime() - hari * 86400_000).toISOString(),
      selesai: SEKARANG().toISOString(),
      hari,
    },
    kpi: [
      { key: "tiketMasuk", label: "Pengaduan masuk", value: 184 },
      { key: "tiketSelesai", label: "Selesai ditangani", value: 171 },
      {
        key: "ketepatanSlaPct",
        label: "Tepat waktu",
        value: 92.9,
        unit: "%",
        tone: "success" as const,
      },
      {
        key: "rataTanggapMenit",
        label: "Rata-rata waktu tanggap",
        value: 74,
        unit: "menit",
      },
    ],
    perKategori: [
      { kategori: "Kebocoran pipa", masuk: 61, selesai: 58, ketepatanPct: 95.1 },
      { kategori: "Air tidak mengalir", masuk: 44, selesai: 41, ketepatanPct: 90.9 },
      { kategori: "Air keruh / berbau", masuk: 33, selesai: 31, ketepatanPct: 93.9 },
      { kategori: "Tekanan lemah", masuk: 28, selesai: 25, ketepatanPct: 85.7 },
      { kategori: "Meter / keypad rusak", masuk: 18, selesai: 16, ketepatanPct: 88.9 },
    ],
    tren: {
      labels,
      series: [
        { name: "Ketepatan SLA", unit: "%", points: goyang(hari, 92, 4) },
      ],
    },
  };
}

export function statistik(hari: number) {
  const labels = hariLabel(hari);
  const disalurkan = goyang(hari, 1180, 90);
  const tercatat = disalurkan.map((v) => Math.round(v * 0.805));
  const totalDisalurkan = disalurkan.reduce((a, b) => a + b, 0);
  const totalTercatat = tercatat.reduce((a, b) => a + b, 0);

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
    perZona: [
      { nama: "Bandung Timur", pelanggan: 3140, volumeM3: 12480, nrwPct: 14.2 },
      { nama: "Cileunyi", pelanggan: 2016, volumeM3: 8120, nrwPct: 21.8 },
      { nama: "Cimahi", pelanggan: 1884, volumeM3: 7640, nrwPct: 24.5 },
      { nama: "Sumedang", pelanggan: 1179, volumeM3: 4310, nrwPct: 18.1 },
    ],
  };
}
