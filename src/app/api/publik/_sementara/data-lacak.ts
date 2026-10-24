/**
 * SUMBER DATA SEMENTARA — HAPUS SETELAH BACKEND SIAP.
 *
 * Pendamping `data.ts` untuk halaman `/lacak`: janji waktu per kategori,
 * tahapan penanganan, kanal pelaporan, dan pengaduan yang baru ditutup.
 * Bentuk jawabannya mengikuti kontrak yang diusulkan untuk BE#2 (lihat
 * `src/app/(publik)/lacak/_bagian/tipe.ts`).
 *
 * Cara mematikannya nanti sama persis: arahkan `NEXT_PUBLIC_API_URL` ke
 * backend sungguhan, lalu hapus seluruh folder `src/app/api/publik`.
 *
 * ATURAN YANG DIPEGANG DI BERKAS INI
 *
 * 1. **Angka turunan, bukan angka ketik ulang.** Ketepatan per kategori dan
 *    rata-rata waktu tanggap DIAMBIL dari `kinerja()` — berkas yang sama yang
 *    menyuapi halaman Rapor Kinerja. Kalau keduanya ditulis terpisah, cepat
 *    atau lambat dua halaman menyebut angka berbeda untuk hal yang sama, dan
 *    itu persis yang akan dicocokkan orang.
 * 2. **Nomor contoh diturunkan dari `TIKET`.** Nomor yang dipajang di halaman
 *    tidak boleh bisa basi: ia selalu nomor yang memang ada di data tiruan.
 * 3. **Janji waktu terikat pada tiket contoh.** `Kebocoran pipa` 8 jam dan
 *    `Air keruh / berbau` 4 jam bukan angka bebas — keduanya cocok dengan
 *    jarak `dibuatPada` → `slaJatuhTempo` pada dua tiket di `data.ts`. Kalau
 *    tiketnya diubah, angka di sini ikut diubah.
 * 4. **Yang meleset tetap ditampilkan.** Daftar pengaduan selesai memuat satu
 *    yang melewati batas waktu, dan statusnya DIHITUNG dari lama penanganan
 *    terhadap janjinya — tidak ditulis tangan, jadi tidak bisa dipoles.
 */

import { kinerja, TIKET, ZONA } from "./data";
import type {
  AduanSelesai,
  ContohNomor,
  JanjiKategori,
  KanalLapor,
  PanduanAduan,
  TahapPenanganan,
} from "@/app/(publik)/lacak/_bagian/tipe";

const SEKARANG = () => new Date();

const jamLalu = (j: number) =>
  new Date(SEKARANG().getTime() - j * 3600_000).toISOString();

/** Periode acuan angka ketepatan — sama dengan bawaan halaman Rapor Kinerja. */
const RENTANG_HARI = 30;

/** Ambang yang dijanjikan PDAM, dipakai sama persis di `/kinerja`. */
const TARGET_PCT = 90;

/**
 * Janji waktu per kategori, dalam jam.
 *
 * Urutannya menurut RISIKO, bukan menurut sulitnya pekerjaan: air keruh
 * adalah persoalan kesehatan dan ditangani lebih dulu daripada pipa yang
 * bocor, meskipun memperbaiki pipa jelas lebih berat. Urutan seperti ini
 * harus bisa dijelaskan — karena itu tiap baris membawa alasannya.
 */
const JANJI_JAM: Record<string, { jam: number; alasan: string }> = {
  "Air keruh / berbau": {
    jam: 4,
    alasan:
      "Menyangkut air yang diminum, jadi didahulukan: jaringan dibilas lebih dulu, pemeriksaan sampel menyusul.",
  },
  "Kebocoran pipa": {
    jam: 8,
    alasan:
      "Air terus terbuang selama belum ditutup, dan badan jalan di atasnya ikut rusak kalau dibiarkan semalaman.",
  },
  "Air tidak mengalir": {
    jam: 12,
    alasan:
      "Penyebabnya bisa di mana saja antara meter induk dan sambungan rumah, jadi perlu penelusuran sebelum diperbaiki.",
  },
  "Tekanan lemah": {
    jam: 24,
    alasan:
      "Air tetap sampai ke rumah, jadi ditangani setelah gangguan yang benar-benar memutus aliran.",
  },
  "Meter / keypad rusak": {
    jam: 48,
    alasan:
      "Perlu penggantian alat dan penyesuaian saldo, bukan pekerjaan lapangan yang bisa selesai di tempat.",
  },
};

/**
 * Tahapan setelah laporan masuk.
 *
 * Tiga tahap pertama DIJUMLAHKAN tepat sebesar rata-rata waktu tanggap yang
 * dilaporkan `/kinerja` — "dari laporan masuk sampai petugas ditugaskan"
 * adalah definisi angka itu, jadi kalau jumlahnya berbeda salah satu halaman
 * berbohong. Karena itu dua tahap tengah dihitung dari `tanggap`, bukan
 * ditulis sebagai angka tetap.
 */
function tahapan(tanggapMenit: number): TahapPenanganan[] {
  const terima = 2;
  const verifikasi = Math.round((tanggapMenit - terima) * 0.42);
  const tugas = Math.max(1, tanggapMenit - terima - verifikasi);

  return [
    {
      kunci: "diterima",
      judul: "Laporan diterima",
      perkiraan: { jenis: "menit", menit: terima },
      keterangan:
        "Nomor pengaduan terbit saat itu juga dan langsung bisa dilacak di halaman ini. Simpan nomornya.",
    },
    {
      kunci: "diverifikasi",
      judul: "Diverifikasi petugas",
      perkiraan: { jenis: "menit", menit: verifikasi },
      keterangan:
        "Foto, titik lokasi, dan zona dicocokkan. Beberapa laporan untuk gangguan yang sama digabung menjadi satu pekerjaan.",
    },
    {
      kunci: "ditugaskan",
      judul: "Ditugaskan ke teknisi lapangan",
      perkiraan: { jenis: "menit", menit: tugas },
      keterangan:
        "Tim terdekat menerima penugasan. Sampai di sini dihitung sebagai waktu tanggap, dan dilaporkan terpisah dari waktu penyelesaian.",
    },
    {
      kunci: "dikerjakan",
      judul: "Dikerjakan di lapangan",
      perkiraan: { jenis: "teks", teks: "sesuai janji kategori" },
      keterangan:
        "Tahap inilah yang paling berbeda antarkategori — lamanya mengikuti janji waktu di bawah, dihitung sejak laporan diterima.",
    },
    {
      kunci: "selesai",
      judul: "Selesai ditangani",
      perkiraan: { jenis: "teks", teks: "status ditutup" },
      keterangan:
        "Catatan pekerjaan ikut tampil di kronologi. Bila keluhan berulang dalam 7 hari, laporan dibuka kembali dengan nomor yang sama.",
    },
  ];
}

/**
 * Kanal pelaporan.
 *
 * Nomor dan alamatnya CONTOH selama backend belum siap — halaman wajib
 * mengatakan itu, bukan memajangnya seolah bisa benar-benar dihubungi.
 */
const KANAL: KanalLapor[] = [
  {
    kunci: "telepon",
    nama: "Telepon pengaduan",
    nilai: "(022) 2500-119",
    tautan: "tel:+62222500119",
    jam: "24 jam, termasuk hari libur",
    catatan:
      "Jalur tercepat untuk kebocoran besar dan air mati total satu lingkungan.",
  },
  {
    kunci: "whatsapp",
    nama: "WhatsApp",
    nilai: "0811-2026-119",
    tautan: "https://wa.me/628112026119",
    jam: "07.00–21.00 WIB",
    catatan:
      "Bisa mengirim foto dan titik lokasi. Nomor pengaduan dibalas otomatis setelah laporan tercatat.",
  },
  {
    kunci: "kantor",
    nama: "Kantor pelayanan",
    nilai: "Jl. Soekarno-Hatta No. 118, Bandung",
    tautan: null,
    jam: "Sen–Jum 08.00–15.00 · Sab 08.00–12.00",
    catatan:
      "Bawa kartu identitas dan nomor sambungan pelanggan bila melapor atas nama rumah sendiri.",
  },
];

/**
 * Pengaduan yang baru ditutup — ANONIM.
 *
 * Bentuknya `[indeks zona, kategori, lama menit, selesai berapa jam lalu]`.
 * Tidak ada kolom nama, alamat, atau kontak di sini, dan tidak boleh
 * ditambahkan: daftar ini ada untuk memperlihatkan sistemnya hidup, bukan
 * untuk memperlihatkan siapa yang melapor.
 *
 * Nama zona DIAMBIL dari `ZONA` supaya tidak pernah menyebut zona yang tidak
 * ada di halaman Status Layanan.
 */
const SELESAI: [number, string, number, number][] = [
  [0, "Kebocoran pipa", 212, 3],
  [2, "Air keruh / berbau", 168, 7],
  [1, "Air tidak mengalir", 584, 11],
  [3, "Tekanan lemah", 1735, 16],
  [2, "Kebocoran pipa", 331, 21],
  [0, "Meter / keypad rusak", 2290, 27],
  [1, "Air keruh / berbau", 97, 33],
  [0, "Air tidak mengalir", 410, 38],
];

export function panduanAduan(): PanduanAduan {
  const k = kinerja(RENTANG_HARI);
  const ambil = (key: string) => {
    const kpi = k.kpi.find((x) => x.key === key);
    return kpi && Number.isFinite(kpi.value) ? kpi.value : null;
  };

  const ketepatanPct = ambil("ketepatanSlaPct");
  const tanggapMenit = ambil("rataTanggapMenit");

  const janji: JanjiKategori[] = k.perKategori
    .map((c) => {
      const j = JANJI_JAM[c.kategori];
      return {
        kategori: c.kategori,
        // Kategori tanpa janji tidak dibuang: menyembunyikannya membuat daftar
        // ini terbaca lengkap padahal tidak. 24 jam adalah janji bawaan PDAM.
        janjiJam: j?.jam ?? 24,
        alasan:
          j?.alasan ??
          "Belum punya janji khusus, jadi memakai batas bawaan 24 jam.",
        masuk: c.masuk,
        tepat: Math.round((c.masuk * c.ketepatanPct) / 100),
        ketepatanPct: c.ketepatanPct,
      };
    })
    .sort((a, b) => a.janjiJam - b.janjiJam);

  const contoh: ContohNomor[] = TIKET.map((t) => ({
    nomor: t.nomor,
    keterangan: t.slaTerlampaui
      ? "sempat melewati janji waktu"
      : t.status === "SELESAI"
        ? "sudah selesai, tepat waktu"
        : "sedang ditangani",
  }));

  const selesaiTerbaru: AduanSelesai[] = SELESAI.map(
    ([iZona, kategori, lamaMenit, jam], i) => {
      const janjiJam = JANJI_JAM[kategori]?.jam ?? 24;
      return {
        id: `AS-${i + 1}`,
        kategori,
        zona: ZONA[iZona]?.nama ?? "—",
        lamaMenit,
        janjiJam,
        selesaiPada: jamLalu(jam),
        // DIHITUNG, bukan ditulis tangan — satu-satunya cara memastikan daftar
        // ini tidak diam-diam memoles yang terlambat jadi tepat waktu.
        tepatWaktu: lamaMenit <= janjiJam * 60,
      };
    },
  );

  return {
    rentangHari: RENTANG_HARI,
    targetPct: TARGET_PCT,
    ketepatanPct,
    tanggapMenit,
    janji,
    tahapan: tahapan(tanggapMenit ?? 73),
    kanal: KANAL,
    contoh,
    selesaiTerbaru,
  };
}
