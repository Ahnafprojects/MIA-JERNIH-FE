"use client";

/**
 * Kotak centang lapisan peta.
 *
 * SENGAJA kotak centang, bukan tombol mode atau sakelar.
 *
 * Batas zona adalah lapisan yang DITAMBAHKAN di atas basemap. Tombol mode
 * menjanjikan hal lain — bahwa ada tampilan "peta" dan tampilan "zona", dan
 * yang satu menggantikan yang lain. Versi sebelumnya memang begitu, dan
 * menyalakannya menukar gaya peta ke `blank`: basemap hilang, yang tersisa
 * empat poligon di atas layar putih. Bentuk kontrolnya ikut menjaga
 * maksudnya tetap benar.
 *
 * Input asli tetap ada (`sr-only`), bukan `<div role="checkbox">`: itu yang
 * membuatnya ikut dalam urutan tab, bisa ditekan Spasi, dan terbaca sebagai
 * kotak centang oleh pembaca layar tanpa satu baris ARIA pun.
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function KotakCentang({
  aktif,
  onUbah,
  label,
  keterangan,
  mati,
}: {
  aktif: boolean;
  onUbah: (nilai: boolean) => void;
  label: string;
  keterangan?: string;
  mati?: boolean;
}) {
  return (
    <label
      className={cn(
        "group inline-flex min-h-11 items-center gap-2.5 text-left",
        mati ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={aktif}
        disabled={mati}
        onChange={(e) => onUbah(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-[3px] border",
          "transition-colors motion-reduce:transition-none",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface",
          aktif
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-line-strong bg-surface group-hover:border-brand-500",
        )}
      >
        {aktif ? <Check size={12} strokeWidth={3} aria-hidden /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{label}</span>
        {keterangan ? (
          <span className="block text-[11.5px] text-muted">{keterangan}</span>
        ) : null}
      </span>
    </label>
  );
}
