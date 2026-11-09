"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Varian = "utama" | "sekunder" | "halus" | "bahaya";
type Ukuran = "sm" | "md" | "lg";

/*
 * Tiap varian membawa DUA hal: warnanya, dan cincin fokus yang cocok
 * dengan warna itu.
 *
 * Varian berisi warna pekat (`utama`, `bahaya`) memakai cincin terang —
 * cincin `brand-600` yang terbaca jelas di atas halaman putih justru
 * tenggelam begitu ia digambar menempel pada isian `brand-600` milik
 * tombolnya sendiri. Varian berlatar terang memakai cincin gelap dengan
 * alasan yang persis terbalik. Lihat catatan ukur di `globals.css`.
 */
const VARIAN: Record<Varian, string> = {
  utama:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 cincin-fokus-gelap",
  sekunder:
    "border border-line-strong bg-surface text-ink hover:border-brand-500/60 hover:bg-soft active:bg-surface-2 cincin-fokus",
  halus: "text-ink hover:bg-soft active:bg-surface-2 cincin-fokus",
  bahaya:
    "bg-danger text-white hover:brightness-110 active:brightness-95 cincin-fokus-gelap",
};

const UKURAN: Record<Ukuran, string> = {
  // Tinggi minimal 44px di md dan lg — target sentuh yang nyaman di ponsel.
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: Varian;
  ukuran?: Ukuran;
  /** Melebar penuh — dipakai di form dan tampilan ponsel. */
  blok?: boolean;
  /** Menampilkan pemintal dan mengunci tombol, mencegah kiriman ganda. */
  memuat?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      varian = "utama",
      ukuran = "md",
      blok,
      memuat,
      disabled,
      className,
      children,
      ...sisa
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        // Tombol yang sedang memuat harus benar-benar terkunci, bukan sekadar
        // terlihat sibuk: klik ganda pada form pembelian membuat dua tagihan.
        disabled={disabled || memuat}
        aria-busy={memuat || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-input font-semibold",
          "transition-[background-color,color,filter,box-shadow] duration-150",
          "disabled:cursor-not-allowed disabled:opacity-60",
          /*
           * Hover menumbuhkan BAYANGAN, bukan cuma menggelapkan latar.
           *
           * Diukur sebelum diperbaiki: satu-satunya yang berubah saat hover
           * adalah `background-color`, dari `rgb(10,107,133)` ke
           * `rgb(11,74,94)` — dua nada biru tua yang nyaris kembar. Pada
           * tombol yang sedang tidak dilihat langsung, perubahan sehalus itu
           * praktis tidak terbaca.
           *
           * Bayangan bekerja berbeda: ia mengubah SILUET, bukan isian, jadi
           * terbaca dari sudut mata. `.angkat` tidak dipakai di sini karena
           * ia juga menggeser elemen 2px — pada tombol `blok` selebar form,
           * geseran itu terbaca sebagai halaman yang bergoyang.
           *
           * `enabled:` wajib. Tanpa itu tombol yang sedang `disabled` atau
           * memuat tetap menumbuhkan bayangannya saat disentuh, dan terbaca
           * seperti masih bisa ditekan.
           */
          "enabled:hover:shadow-[var(--kedalaman-2)]",
          "enabled:active:shadow-[var(--kedalaman-1)]",
          VARIAN[varian],
          UKURAN[ukuran],
          blok && "w-full",
          className,
        )}
        {...sisa}
      >
        {memuat ? (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
