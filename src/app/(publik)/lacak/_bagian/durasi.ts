import { angka } from "@/lib/format";

/**
 * Lama waktu dalam kata, dari menit.
 *
 * `73` → `1 jam 13 menit`. Dipakai untuk tahapan penanganan dan lama
 * penanganan pengaduan yang sudah ditutup, supaya satuan yang sama tidak
 * ditulis dua gaya di satu halaman.
 *
 * Nilai yang bukan hasil pengukuran (`NaN`, tak hingga, negatif) menghasilkan
 * `"—"`, bukan `"0 menit"` — nol itu nilai yang sah dan tidak boleh dipakai
 * sebagai pengganti "tidak ada angkanya".
 */
export function lamaWaktu(menitMasuk: number | null): string {
  if (menitMasuk === null || !Number.isFinite(menitMasuk) || menitMasuk < 0) {
    return "—";
  }

  const menit = Math.round(menitMasuk);
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;

  if (jam === 0) return `${menit} menit`;
  if (sisa === 0) return `${angka(jam)} jam`;
  return `${angka(jam)} jam ${sisa} menit`;
}

/** `8` → `8 jam`. Satuan janji waktu SELALU jam, tidak pernah dikonversi ke
 *  hari: dua baris yang bersebelahan harus bisa dibandingkan tanpa berhitung. */
export const jamJanji = (jam: number): string => `${angka(jam)} jam`;
