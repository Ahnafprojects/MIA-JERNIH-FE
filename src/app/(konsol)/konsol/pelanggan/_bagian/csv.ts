/**
 * Ekspor CSV berlokal Indonesia — untuk Excel petugas.
 *
 * ── Kenapa berbeda dari `/api/publik/unduh` ───────────────────────────
 *
 * Unduhan publik sengaja RFC 4180: pemisah KOMA, titik desimal, tanpa BOM.
 * Pembacanya pandas, R, dan Google Sheets, dan semuanya memperlakukan itu
 * sebagai satu-satunya bentuk yang benar.
 *
 * Berkas ini pembacanya orang lain: petugas PDAM yang mengklik dua kali di
 * Excel berlokal Indonesia. Di lokal itu pemisah daftar adalah TITIK KOMA
 * dan pemisah desimal adalah KOMA. Berkas RFC 4180 yang dibuka di sana
 * masuk seluruhnya ke kolom A, dan "4820.50" terbaca sebagai teks — bukan
 * angka yang bisa dijumlah. Orang lalu menghabiskan sepuluh menit di wisaya
 * Text to Columns untuk tiap unduhan.
 *
 * Jadi keduanya BENAR, masing-masing untuk pembacanya. Yang salah adalah
 * memaksa satu bentuk melayani keduanya. Kalau format di sini diubah,
 * ubahlah karena pembacanya berganti — bukan demi keseragaman dengan rute
 * publik.
 *
 * Tiga keputusan kecil yang gampang hilang:
 *
 * 1. **BOM UTF-8 di awal berkas.** Tanpa itu Excel membaca berkas sebagai
 *    ANSI dan "Cileunyi" masih aman, tapi "m³" dan "≤" berubah jadi sampah.
 * 2. **Angka ditulis TANPA pemisah ribuan.** "4.820,50" memang tampil benar
 *    di layar, tapi di dalam sel ia bergantung pada setelan "Use system
 *    separators" yang bisa dimatikan orang. "4820,50" tidak pernah gagal.
 * 3. **Akhir baris CRLF**, sesuai yang diharapkan Excel di Windows.
 */

import { tanggalJam } from "@/lib/format";

const PEMISAH = ";";
const BARIS_BARU = "\r\n";
/** Ditulis sebagai escape, bukan karakter mentah — U+FEFF tak terlihat di editor. */
const BOM = "\uFEFF";

export type SelCsv = string | number | boolean | null;

export interface KolomCsv<T> {
  label: string;
  nilai: (baris: T) => SelCsv;
  /** Angka di belakang koma. Isi HANYA untuk kolom berisi angka. */
  desimal?: number;
}

/**
 * Nilai yang tidak dikirim server ditulis sebagai sel KOSONG, bukan "—".
 *
 * Di layar em dash itu benar — ia memberi tahu pembaca bahwa angkanya tidak
 * ada. Di dalam spreadsheet ia justru merusak: satu sel berisi "—" membuat
 * seluruh kolom berhenti dianggap angka, dan AVERAGE di bawahnya diam-diam
 * menghitung hal lain.
 */
function sel(nilai: SelCsv, desimal?: number): string {
  if (nilai === null) return "";
  if (typeof nilai === "boolean") return nilai ? "Ya" : "Tidak";
  if (typeof nilai === "number") {
    if (!Number.isFinite(nilai)) return "";
    return nilai.toFixed(desimal ?? 0).replace(".", ",");
  }
  // Kutip hanya bila perlu: berkas yang penuh tanda kutip lebih sulit dibaca
  // mata saat seseorang membukanya di editor teks untuk memeriksa cepat.
  return /[";\r\n]/.test(nilai) ? `"${nilai.replace(/"/g, '""')}"` : nilai;
}

export function susunCsv<T>(kolom: KolomCsv<T>[], baris: T[]): string {
  const kepala = kolom.map((k) => sel(k.label)).join(PEMISAH);
  const isi = baris.map((b) =>
    kolom.map((k) => sel(k.nilai(b), k.desimal)).join(PEMISAH),
  );
  return BOM + [kepala, ...isi].join(BARIS_BARU) + BARIS_BARU;
}

/** `pelanggan-2026-10-24-1532.csv` — berkas unduhan tidak boleh bertabrakan. */
export function namaBerkas(awalan: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${awalan}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.csv`;
}

export function unduhCsv<T>(
  awalan: string,
  kolom: KolomCsv<T>[],
  baris: T[],
): void {
  const blob = new Blob([susunCsv(kolom, baris)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaBerkas(awalan);
  a.click();
  // Tanpa ini blob-nya menetap di memori selama tab terbuka; petugas yang
  // mengunduh puluhan kali sehari akan merasakannya.
  URL.revokeObjectURL(url);
}

/** Stempel waktu untuk baris catatan di CSV. Satu tempat, satu bentuk. */
export const stempel = (iso: string): string => tanggalJam(iso);
