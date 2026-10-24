/**
 * Bentuk jawaban `/api/publik/panduan-lacak`.
 *
 * Rumahnya nanti `src/types/publik.ts` bersama kontrak publik lainnya; untuk
 * sementara ia tinggal di sini supaya halaman `/lacak` dan rute tiruannya
 * memakai satu definisi yang sama, bukan dua yang saling menebak.
 *
 * Isinya SELURUHNYA hal yang membuat sebuah status bisa dibaca: janji
 * waktunya, tahapan yang dilalui, dan jalan lain untuk melapor. Tanpa itu
 * halaman pelacakan hanya memberi kata "Sedang ditangani" tanpa ukuran apa
 * pun untuk menilainya.
 */

/** Janji waktu satu kategori pengaduan, beserta seberapa sering ditepati. */
export interface JanjiKategori {
  kategori: string;
  /** Batas waktu yang dijanjikan, dalam JAM sejak laporan diterima. */
  janjiJam: number;
  /** Kenapa kategori ini berada di urutan itu — janji tanpa alasan tak bisa ditagih. */
  alasan: string;
  /** Laporan yang masuk pada periode acuan. */
  masuk: number;
  /** Di antaranya, yang selesai sebelum batas waktunya. */
  tepat: number;
  ketepatanPct: number;
}

/**
 * Perkiraan lama satu tahap.
 *
 * Union, bukan `menit: number | null` + teks cadangan: dua tahap terakhir
 * memang TIDAK punya durasi tetap, dan menandainya dengan `null` lalu
 * menyimpan kalimatnya di medan lain membuat dua medan yang hanya salah satu
 * yang pernah benar.
 */
export type PerkiraanTahap =
  | { jenis: "menit"; menit: number }
  | { jenis: "teks"; teks: string };

export interface TahapPenanganan {
  kunci: string;
  judul: string;
  perkiraan: PerkiraanTahap;
  keterangan: string;
}

/** Jalan lain untuk melapor, untuk orang yang belum punya nomor pengaduan. */
export interface KanalLapor {
  kunci: string;
  nama: string;
  /** Nomor atau alamat yang ditampilkan apa adanya. */
  nilai: string;
  /** `tel:` / `https://wa.me/...`, atau `null` bila tidak bisa ditautkan. */
  tautan: string | null;
  jam: string;
  catatan: string;
}

/** Nomor yang bisa langsung dicoba di kotak pencarian. */
export interface ContohNomor {
  nomor: string;
  keterangan: string;
}

/**
 * Satu pengaduan yang baru selesai — ANONIM.
 *
 * Tidak ada medan untuk nama, alamat, maupun kontak, dan memang tidak boleh
 * ada: kalau medannya tersedia, cepat atau lambat ia akan diisi.
 */
export interface AduanSelesai {
  id: string;
  kategori: string;
  zona: string;
  lamaMenit: number;
  /** Janji kategori saat itu, supaya "tepat waktu" bisa diperiksa sendiri. */
  janjiJam: number;
  selesaiPada: string;
  tepatWaktu: boolean;
}

export interface PanduanAduan {
  /** Periode acuan angka ketepatan, dalam hari. */
  rentangHari: number;
  /** Target ketepatan yang dipakai PDAM, dalam persen. */
  targetPct: number;
  /** Ketepatan keseluruhan pada periode acuan. `null` bila belum terhitung. */
  ketepatanPct: number | null;
  /** Rata-rata waktu tanggap pada periode acuan, dalam menit. */
  tanggapMenit: number | null;
  janji: JanjiKategori[];
  tahapan: TahapPenanganan[];
  kanal: KanalLapor[];
  contoh: ContohNomor[];
  selesaiTerbaru: AduanSelesai[];
}
