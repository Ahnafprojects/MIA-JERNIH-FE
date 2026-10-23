"use client";

import { cn } from "@/lib/cn";
import { LcdDisplay } from "./lcd";

const TOMBOL = [
  ["1", "2", "3", "A"],
  ["4", "5", "6", "B"],
  ["7", "8", "9", "C"],
  ["*", "0", "#", "D"],
];

/**
 * Ilustrasi meter air: badan, LCD, keypad 4×4, lampu relay dan buzzer.
 *
 * Dipakai di landing sebagai peraga interaktif, dan di halaman Meter Saya
 * sebagai cermin keadaan meter sungguhan. Susunan keypad mengikuti perangkat:
 * `*` masuk mode isi token, `A` enter, `D` hapus.
 */
export function MeterDevice({
  baris1,
  baris2,
  relayAktif,
  buzzer = "off",
  onTombol,
  className,
}: {
  baris1: string;
  baris2?: string;
  relayAktif: boolean;
  buzzer?: "off" | "warn" | "crit" | "on";
  onTombol?: (t: string) => void;
  className?: string;
}) {
  const nadaBuzzer = {
    off: "bg-line-strong",
    warn: "bg-warn",
    crit: "bg-danger",
    on: "bg-danger",
  }[buzzer];

  return (
    <div
      className={cn(
        "inline-block rounded-sheet border border-line bg-surface-2 p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-6">
        <span className="eyebrow text-muted">Meter Jernih</span>
        <span className="flex items-center gap-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className={cn(
                "size-2 rounded-full",
                relayAktif ? "bg-success" : "bg-line-strong",
              )}
            />
            {/* Lampu SELALU didampingi kata — warna saja tidak terbaca semua orang. */}
            {relayAktif ? "Aliran aktif" : "Aliran tertutup"}
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className={cn("size-2 rounded-full", nadaBuzzer)} />
            {buzzer === "off" ? "Senyap" : "Alarm"}
          </span>
        </span>
      </div>

      <LcdDisplay baris1={baris1} baris2={baris2} />

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {TOMBOL.flat().map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTombol?.(t)}
            disabled={!onTombol}
            // 44px: target sentuh minimal supaya keypad tetap bisa dipakai di ponsel.
            className={cn(
              "size-11 rounded-lg border border-line bg-surface font-mono text-sm font-semibold",
              onTombol
                ? "hover:bg-soft active:bg-surface-2"
                : "cursor-default opacity-70",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
