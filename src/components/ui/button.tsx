"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Varian = "utama" | "sekunder" | "halus" | "bahaya";
type Ukuran = "sm" | "md" | "lg";

const VARIAN: Record<Varian, string> = {
  utama:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  sekunder:
    "border border-line-strong bg-surface text-ink hover:bg-soft active:bg-surface-2",
  halus: "text-ink hover:bg-soft active:bg-surface-2",
  bahaya: "bg-danger text-white hover:brightness-110 active:brightness-95",
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
          "transition-[background-color,color,filter] duration-150",
          "disabled:cursor-not-allowed disabled:opacity-60",
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
