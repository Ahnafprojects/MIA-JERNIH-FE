/**
 * Tabung saldo — batang pembanding sebaris untuk tabel pelanggan.
 *
 * SENGAJA tidak memakai `BarMini` dari `grafik.tsx`. Batang itu berujung
 * bulat penuh dan terbaca sebagai bilah kemajuan aplikasi; yang dibutuhkan
 * di sini adalah sesuatu yang terbaca sebagai TABUNG UKUR: persegi, bergaris
 * takar, dan terisi dari kiri. Motifnya sama dengan kolom air di halaman
 * depan dan garis takar pada lencana — satu benda, bukan tiga gaya.
 *
 * Skalanya DIUMUMKAN di kepala kolom, bukan disembunyikan. Batang tanpa
 * skala yang disebutkan hanya memberi perasaan, dan perasaan tidak bisa
 * diperiksa: pada skala 0–5.000 L, saldo 4 L dan 90 L sama-sama terlihat
 * kosong. Itu memang benar — keduanya nyaris habis — dan angkanya tetap
 * berdiri di sebelahnya untuk yang butuh tepatnya.
 */

import { cn } from "@/lib/cn";
import { AMBANG } from "./tipe";

/** Puncak skala batang, dalam liter. Disebut di kepala kolom tabel. */
export const SKALA_TABUNG = 5000;

const ISI = {
  bahaya: "bg-danger",
  peringatan: "bg-warn",
  normal: "bg-brand-500",
} as const;

export function TabungSaldo({
  saldoL,
  className,
}: {
  saldoL: number;
  className?: string;
}) {
  const persen = Math.min(100, Math.max(0, (saldoL / SKALA_TABUNG) * 100));
  const nada =
    saldoL <= AMBANG.berat
      ? "bahaya"
      : saldoL <= AMBANG.ringan
        ? "peringatan"
        : "normal";

  return (
    // `aria-hidden`: angkanya selalu ada di sebelahnya. Pembaca layar tidak
    // perlu mendengar hal yang sama dua kali.
    <span
      aria-hidden
      className={cn(
        "relative block h-2 w-full overflow-hidden rounded-[2px] border border-line bg-soft",
        className,
      )}
    >
      {/* Saldo yang benar-benar nol tetap menyisakan sehelai garis merah:
          batang kosong sama persis dengan batang yang gagal dimuat. */}
      <span
        className={cn(
          "motion-aware absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
          ISI[nada],
        )}
        style={{ width: persen === 0 ? "2px" : `${persen}%` }}
      />
      <span className="takar absolute inset-0 opacity-80" />
    </span>
  );
}
