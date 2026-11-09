/**
 * Halaman fitur lengkap.
 *
 * ── Kenapa daftar ini pindah dari halaman depan ───────────────────────
 *
 * Daftarnya tumbuh dari delapan menjadi dua belas butir setelah notifikasi
 * WhatsApp dan Telegram, peta sebaran kebocoran, validasi laporan, dan
 * unduhan data terbuka benar-benar berjalan. Dua belas kartu di halaman
 * depan membuat pengunjung menggulir tiga baris penuh sebelum sampai ke
 * bagian lain halaman, dan bagian lain itu yang justru menunjukkan
 * produknya bekerja: pita statistik dari API, meter peraga yang berbunyi,
 * dan peragaan kabar masuk.
 *
 * Halaman depan sekarang menampilkan empat butir bertanda `sorot` dan
 * menautkan ke sini. Yang dipindah hanya PANJANGNYA; isinya tetap satu
 * larik di `_bagian/fitur.tsx`, jadi kedua halaman tidak mungkin menyebut
 * hal berbeda.
 *
 * Judul halaman dinaikkan ke `h1` lewat `judulUtama`. Halaman tanpa `h1`
 * membuat pembaca layar kehilangan titik masuknya, dan di halaman depan
 * seksi yang sama benar sebagai `h2` karena ia satu dari banyak seksi.
 */
import { FiturJernih } from "../_bagian/fitur";

export default function HalamanFitur() {
  return <FiturJernih judulUtama />;
}
