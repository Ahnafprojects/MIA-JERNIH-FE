/**
 * Konstanta produk.
 *
 * Nilai di sini hanya untuk halaman publik yang belum butuh server (landing).
 * Di halaman pembelian, tarif WAJIB diambil dari API karena berbeda per
 * golongan pelanggan — memakai angka ini di sana akan menampilkan harga yang
 * salah untuk golongan niaga.
 */
export const TARIF_PER_LITER = 7.5;

export interface Paket {
  literL: number;
  kira: string;
  tag?: string;
}

export const PAKET: Paket[] = [
  { literL: 1000, kira: "± 4 hari untuk keluarga kecil" },
  { literL: 2500, kira: "± 10 hari", tag: "Paling dipilih" },
  { literL: 5000, kira: "± 20 hari" },
  { literL: 10000, kira: "± 40 hari" },
];
