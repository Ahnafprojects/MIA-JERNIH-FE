/**
 * Keadaan syarat kata sandi.
 *
 * Menggantikan `KekuatanSandi` yang punya `skor`, `label`, dan `warna` untuk
 * tiga tingkat kekuatan. Tingkatan itu menilai huruf besar, angka, dan
 * simbol — tidak satu pun disyaratkan server, jadi labelnya tidak pernah
 * bisa dipercaya. Lihat `_bagian/syarat-sandi.tsx`.
 */
export interface SyaratSandi {
  /** Jumlah karakter yang sudah diketik. Dipakai menghitung kekurangannya. */
  panjang: number;
  /** Apakah sudah memenuhi satu-satunya syarat yang dipakai server menolak. */
  cukup: boolean;
}
