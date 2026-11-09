/**
 * Saldo saat firmware mulai membunyikan buzzer tiap 10 detik.
 *
 * Angka ini milik firmware, bukan pilihan tampilan — lihat kartu "Alarm
 * meter" di halaman `/meter`. Dipakai di sini untuk menandai KAPAN alarm
 * itu akan berbunyi menurut proyeksi.
 */
export const AMBANG_ALARM_L = 5;

/**
 * Rata-rata pemakaian harian rumah tangga sezona, liter per hari.
 *
 * Nilai tetap: tidak ada endpoint yang mengirim agregat zona. Ditarik ke
 * konstanta supaya angka yang DITAMPILKAN dan angka yang DIPAKAI MENGHITUNG
 * selalu sama — sebelumnya "48,2" ditulis langsung di JSX sementara
 * persentasenya dipatok terpisah, dan keduanya bebas saling bertentangan
 * tanpa ada yang menyadarinya.
 */
export const RATA_ZONA_L_HARI = 48.2;

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
export const JANGKAUAN_HARI = 30;

/**
 * Tarif golongan rumah tangga, rupiah per liter.
 *
 * Halaman ini hanya MEMPERKIRAKAN biaya dan tidak pernah menagih — nilai
 * yang mengikat selalu datang dari server lewat `/api/paket` pada saat
 * transaksi dibuat.
 */
export const TARIF_PER_LITER = 7.5;
