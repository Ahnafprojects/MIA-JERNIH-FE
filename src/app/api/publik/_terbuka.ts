/**
 * SEMENTARA — ikut terhapus bersama `src/app/api/publik`. Lihat
 * `./_sementara/data.ts`.
 *
 * Kepala jawaban untuk endpoint yang memang dibuka untuk siapa pun.
 *
 * Halaman statistik mengumumkan alamat endpointnya supaya orang lain bisa
 * memakai datanya sendiri. Janji itu kosong tanpa `Access-Control-Allow-Origin`:
 * siapa pun yang mencoba memanggilnya dari halaman web miliknya akan ditolak
 * peramban sebelum satu byte pun sampai, dan pesan galatnya tidak menyebut
 * sebabnya. Data terbuka berarti terbuka juga untuk mesin yang bukan milik
 * kita.
 *
 * Hanya metode baca yang dibuka. Tidak ada endpoint publik yang menulis.
 */

export const KEPALA_TERBUKA: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
  /*
   * Agregat harian disusun ulang sekali sehari, jadi menyimpannya lima menit
   * di tepi jaringan tidak pernah menampilkan angka yang sudah berganti.
   * `stale-while-revalidate` membuat pengunjung berikutnya tetap mendapat
   * jawaban seketika sementara salinannya disegarkan di belakang.
   */
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
};

/** Jawaban pra-terbang CORS. Tanpa ini pemanggilan lintas-asal gagal diam-diam. */
export function OPTIONS_TERBUKA(): Response {
  return new Response(null, { status: 204, headers: KEPALA_TERBUKA });
}
