/**
 * Format angka Indonesia — dipakai di SELURUH aplikasi.
 *
 * Aturan dari pedoman desain: koma untuk desimal, titik untuk ribuan
 * (`4.820,50 L`, `Rp 37.500`). Layar LCD meter adalah pengecualian: ia meniru
 * firmware ESP32 yang memakai titik desimal (`S=4.20L`).
 */

const ID = "id-ID";

/** `4.820,5` */
export const angka = (n: number, desimal = 0): string =>
  new Intl.NumberFormat(ID, {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(n);

/** `4.820,50 L` — saldo, token, paket, dan pemakaian SELALU dalam liter. */
export const liter = (n: number, desimal = 2): string => `${angka(n, desimal)} L`;

/** `2,4 L/mnt` */
export const debit = (n: number): string => `${angka(n, 1)} L/mnt`;

/** `Rp 37.500` — rupiah tidak pernah pakai desimal di UI ini. */
export const rupiah = (n: number): string =>
  `Rp ${angka(Math.round(n))}`;

/** `1.840 m³` — agregat jaringan di konsol boleh m³. 1 m³ = 1.000 L. */
export const meterKubik = (literNilai: number, desimal = 0): string =>
  `${angka(literNilai / 1000, desimal)} m³`;

/**
 * `48217 73015` — token ditampilkan per lima digit, disimpan tanpa spasi.
 * Jangan pernah mengirim hasil fungsi ini kembali ke server.
 */
export const token = (kode: string): string =>
  kode.replace(/\s/g, "").replace(/(\d{5})(?=\d)/g, "$1 ");

/** `23 Okt 2026` */
export const tanggal = (iso: string | Date): string =>
  new Intl.DateTimeFormat(ID, { dateStyle: "medium" }).format(new Date(iso));

/** `23 Okt 2026, 17.20` */
export const tanggalJam = (iso: string | Date): string =>
  new Intl.DateTimeFormat(ID, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

/**
 * Dua baris layar LCD meter, meniru firmware persis.
 * `S=4820.50L  ON` / `D=2.4   V=8420.4`
 */
export const lcdUtama = (
  saldoL: number,
  saklarOn: boolean,
  debitLpm: number,
  volumeL: number,
): [string, string] => [
  `S=${saldoL.toFixed(2)}L  ${saklarOn ? "ON" : "OFF"}`,
  `D=${debitLpm.toFixed(1)}   V=${volumeL.toFixed(1)}`,
];
