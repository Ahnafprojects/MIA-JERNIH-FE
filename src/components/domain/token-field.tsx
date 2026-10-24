"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

const MAKS = 10;

/**
 * Masukan token.
 *
 * Token adalah ANGKA saja, 4–10 digit. Huruf ditolak di tingkat masukan,
 * tidak menunggu jawaban server — pengguna yang mengetik huruf langsung tahu
 * tanpa harus menunggu bolak-balik jaringan.
 *
 * Hasil tempel dibersihkan dari spasi: kode di email ditulis per lima digit
 * (`48217 73015`), dan menempelkannya apa adanya akan ditolak server kalau
 * spasinya ikut terkirim.
 */
export function TokenField({
  nilai,
  onChange,
  onKirim,
  nonaktif,
  galat,
}: {
  nilai: string;
  onChange: (v: string) => void;
  onKirim?: () => void;
  nonaktif?: boolean;
  galat?: string | null;
}) {
  const id = useId();
  const bersih = (v: string) => v.replace(/\D/g, "").slice(0, MAKS);
  const tampil = nilai.replace(/(\d{5})(?=\d)/g, "$1 ");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
        Kode token
      </label>
      <input
        id={id}
        value={tampil}
        inputMode="numeric"
        autoComplete="off"
        placeholder="48217 73015"
        disabled={nonaktif}
        aria-invalid={galat ? true : undefined}
        onChange={(e) => onChange(bersih(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && nilai.length >= 4) onKirim?.();
        }}
        className={cn(
          "tabular w-full rounded-input border bg-surface px-4 font-mono",
          "h-14 text-center text-2xl tracking-[0.2em] outline-none",
          "focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60",
          galat ? "border-danger" : "border-line-strong",
        )}
      />
      <p className={cn("mt-1.5 text-[12.5px]", galat ? "text-danger" : "text-muted")}>
        {galat ?? `Angka saja, 4–10 digit. ${nilai.length}/${MAKS}`}
      </p>
    </div>
  );
}
