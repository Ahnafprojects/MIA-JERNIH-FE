/**
 * Peran petugas yang sedang masuk — SEMENTARA.
 *
 * ──────────────────────────────────────────────────────────────────────
 * INI BUKAN KEAMANAN. Jangan pernah memperlakukannya sebagai keamanan.
 * ──────────────────────────────────────────────────────────────────────
 *
 * Belum ada autentikasi sungguhan di proyek ini; peran yang benar baru akan
 * datang bersama sesi dari BE#1. Sampai saat itu nilainya ditulis sebagai
 * SATU konstanta di SATU berkas, supaya begitu sesi tersedia hanya baris di
 * bawah ini yang diganti — bukan sepuluh tempat yang tersebar.
 *
 * Yang dilakukan konstanta ini hanya MENYEMBUNYIKAN tombol. Menyembunyikan
 * tombol bukan mengamankan apa pun: siapa pun bisa memanggil endpointnya
 * langsung, dan seluruh berkas ini dikirim ke browser apa adanya. Penolakan
 * yang sesungguhnya WAJIB terjadi di server — lihat catatan peran di issue
 * BE#1. Kalau suatu saat ada yang mengira baris ini cukup, bacalah kembali
 * paragraf ini sebelum mengandalkannya.
 *
 * Kenapa tombolnya tetap disembunyikan kalau bukan keamanan: supaya petugas
 * tidak menyiapkan aksi massal untuk 14 pelanggan, menulis alasannya,
 * menggeser konfirmasi, lalu baru ditolak server. Ini soal tidak membuang
 * waktu orang, bukan soal menjaga pintu.
 */

export type Peran = "ADMIN" | "OPERATOR" | "TEKNISI";

/** Ganti baris ini dengan peran dari sesi begitu BE#1 siap. */
export const PERAN_SEKARANG: Peran = "ADMIN";

export const LABEL_PERAN: Record<Peran, string> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  TEKNISI: "Teknisi",
};

/**
 * Teknisi mengerjakan perangkat di lapangan, bukan keputusan layanan.
 * Menutup aliran belasan rumah sekaligus adalah keputusan layanan.
 */
export const bolehTutupRelayMassal = (peran: Peran): boolean =>
  peran !== "TEKNISI";
