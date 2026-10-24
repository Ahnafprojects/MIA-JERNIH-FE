/**
 * Format waktu yang dibutuhkan halaman status tetapi belum ada di
 * `src/lib/format.ts`.
 *
 * PINDAHKAN ke `src/lib/format.ts` begitu ada perubahan lain yang menyentuh
 * berkas itu — format tanggal yang berserak di dua tempat adalah cara paling
 * cepat mendapatkan dua gaya penulisan jam di satu halaman.
 *
 * Semuanya memakai locale `id-ID` yang sama dengan `format.ts`: titik sebagai
 * pemisah jam-menit (`08.00`), bukan titik dua.
 */

import { angka } from "@/lib/format";

const ID = "id-ID";

/** `08.00` */
export const jam = (iso: string | Date): string =>
  new Intl.DateTimeFormat(ID, { timeStyle: "short" }).format(new Date(iso));

/** `Sen, 27 Okt` — hari ikut ditulis karena jadwal dibaca untuk disiapkan. */
export const hariTanggal = (iso: string | Date): string =>
  new Intl.DateTimeFormat(ID, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));

/**
 * `6 jam`, `1 hari 4 jam`.
 *
 * Di atas 24 jam, "38 jam" memaksa pembacanya membagi sendiri di kepala.
 * Pecahan jam dibulatkan ke satu desimal: gangguan 2,5 jam itu angka yang
 * sah, dan membulatkannya ke "3 jam" membuat totalnya tidak lagi cocok
 * dengan penjumlahan riwayatnya.
 */
export function durasi(jamTotal: number | null): string {
  if (jamTotal === null || !Number.isFinite(jamTotal)) return "—";
  if (jamTotal < 24) return `${angka(jamTotal, jamTotal % 1 === 0 ? 0 : 1)} jam`;
  const hari = Math.floor(jamTotal / 24);
  const sisa = jamTotal - hari * 24;
  if (sisa < 0.05) return `${angka(hari)} hari`;
  return `${angka(hari)} hari ${angka(sisa, sisa % 1 === 0 ? 0 : 1)} jam`;
}

/**
 * Jarak hari menuju sebuah tanggal: `hari ini`, `besok`, `3 hari lagi`.
 *
 * Dihitung dari TENGAH MALAM ke tengah malam, bukan dari selisih jam.
 * Jadwal pukul 08.00 besok pagi berjarak 9 jam dari sekarang, dan membaginya
 * dengan 24 akan menghasilkan "hari ini" — yang salah dan membuat orang
 * tidak bersiap.
 */
export function jarakHari(iso: string | Date, acuan: Date = new Date()): string {
  const awal = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const beda = Math.round((awal(new Date(iso)) - awal(acuan)) / 86400_000);
  if (beda < 0) return `${angka(-beda)} hari lalu`;
  if (beda === 0) return "hari ini";
  if (beda === 1) return "besok";
  return `${angka(beda)} hari lagi`;
}
