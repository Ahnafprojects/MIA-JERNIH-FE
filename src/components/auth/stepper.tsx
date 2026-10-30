import React from "react";
import { cn } from "@/lib/cn";

interface StepperProps {
  langkahAktif: 1 | 2 | 3;
}

const DAFTAR_LANGKAH = [
  { nomor: 1, judul: "Akun" },
  { nomor: 2, judul: "Verifikasi" },
  { nomor: 3, judul: "Meter" },
];

export function StepperAuth({ langkahAktif }: StepperProps) {
  return (
    <div className="mb-8" aria-label="Langkah pendaftaran">
      <ol className="flex items-center justify-between gap-2">
        {DAFTAR_LANGKAH.map((l, i) => {
          const aktif = l.nomor === langkahAktif;
          const selesai = l.nomor < langkahAktif;

          return (
            <li key={l.nomor} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-[2px] font-mono text-xs font-bold transition-colors",
                  selesai && "bg-brand-500 text-white",
                  aktif && "border-2 border-brand-500 bg-canvas text-brand-700 dark:text-accent",
                  !aktif && !selesai && "border border-line bg-soft text-muted",
                )}
              >
                {selesai ? "✓" : l.nomor}
              </div>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  aktif ? "font-bold text-ink" : "text-muted",
                )}
              >
                {l.judul}
              </span>
              {i < DAFTAR_LANGKAH.length - 1 ? (
                <div
                  className={cn(
                    "h-[1px] flex-1",
                    selesai ? "bg-brand-500" : "bg-line",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
