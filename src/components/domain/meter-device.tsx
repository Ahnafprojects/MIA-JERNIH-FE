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
 * Sambungan pipa di kiri dan kanan badan meter.
 *
 * Satu-satunya hal yang membedakan gambar ini dari kalkulator. Tanpa
 * sambungan pipa, perangkat dengan layar dan keypad 4×4 terbaca sebagai
 * mesin EDC atau kalkulator — dan seluruh maksudnya hilang.
 *
 * Lebarnya DIHITUNG KE DALAM lebar perangkat, bukan menjorok keluar, supaya
 * tidak pernah menimbulkan gulir mendatar di layar sempit.
 */
function Sambungan({ sisi }: { sisi: "kiri" | "kanan" }) {
  const kiri = sisi === "kiri";
  return (
    <span aria-hidden className="relative flex w-[7cqw] items-center">
      {/*
        Badan pipa.
        Gradasi gelap→terang→gelap dari atas ke bawah itu yang membuat bidang
        datar terbaca sebagai silinder; tanpa pita terang di tengahnya,
        bentuknya hanya tampak seperti tab persegi yang menempel.
      */}
      <span
        className={cn(
          "h-[12cqw] w-full bg-gradient-to-b from-line-strong via-soft to-line-strong",
          kiri ? "rounded-l-[2.5cqw]" : "rounded-r-[2.5cqw]",
        )}
      />
      {/* Mur penyambung — lebih tinggi daripada pipanya, seperti aslinya. */}
      <span
        className={cn(
          "absolute h-[16cqw] w-[3.2cqw] rounded-[0.8cqw]",
          "bg-gradient-to-b from-line-strong via-line to-line-strong",
          kiri ? "right-0" : "left-0",
        )}
      />
    </span>
  );
}

/**
 * Ilustrasi meter air prabayar: badan, plat nama, LCD, keypad 4×4, dan
 * lampu relay serta buzzer.
 *
 * Dipakai di landing sebagai peraga interaktif, dan di halaman Meter Saya
 * sebagai cermin keadaan meter sungguhan. Susunan keypad mengikuti
 * perangkatnya: `*` masuk mode isi token, `A` enter, `D` hapus.
 *
 * SELURUH ukuran di dalamnya diturunkan dari lebar perangkat lewat `cqw`,
 * bukan dari ukuran tetap. Sebelumnya layar memakai `cqw` sementara tombol
 * dipatok 44px, jadi begitu layarnya melebar proporsinya pecah: huruf LCD
 * tampak raksasa di atas keypad yang tidak ikut tumbuh. Kalau menambah
 * bagian baru di sini, ukurannya ikut `cqw` juga — jangan px.
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
    <div className={cn("@container w-full max-w-[19.5rem]", className)}>
      <div className="flex items-stretch">
        <Sambungan sisi="kiri" />

        <div className="flex-1 rounded-[5cqw] border border-line bg-surface-2 p-[5cqw] shadow-sm">
          {/* ── Plat nama ───────────────────────────────────────────── */}
          <div className="flex items-baseline justify-between gap-[3cqw]">
            <span className="eyebrow text-muted">Meter Jernih</span>
            {/* Nomor tipe. Perangkat sungguhan selalu punya, dan ketiadaannya
                justru terasa — ini yang membuatnya terbaca sebagai produk. */}
            <span className="font-mono text-[3.1cqw] tracking-wider text-muted">
              JM-200
            </span>
          </div>

          <div className="mt-[2cqw] mb-[3.5cqw] flex items-center gap-[4cqw] text-[3.3cqw] text-muted">
            <span className="flex items-center gap-[1.5cqw]">
              <span
                aria-hidden
                className={cn(
                  "size-[2.4cqw] rounded-full",
                  relayAktif ? "bg-success" : "bg-line-strong",
                )}
              />
              {/* Lampu SELALU didampingi kata — warna saja tidak terbaca semua orang. */}
              {relayAktif ? "Aliran aktif" : "Aliran tertutup"}
            </span>
            <span className="flex items-center gap-[1.5cqw]">
              <span
                aria-hidden
                className={cn("size-[2.4cqw] rounded-full", nadaBuzzer)}
              />
              {buzzer === "off" ? "Senyap" : "Alarm"}
            </span>
          </div>

          <LcdDisplay baris1={baris1} baris2={baris2} />

          {/* ── Keypad ──────────────────────────────────────────────── */}
          <div className="mt-[4cqw] grid grid-cols-4 gap-[2.6cqw]">
            {TOMBOL.flat().map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTombol?.(t)}
                disabled={!onTombol}
                /*
                 * `w-full aspect-square`, BUKAN ukuran tetap.
                 *
                 * Dengan lebar tetap, tombol duduk di tepi kiri selnya dan
                 * sisa ruang kolom menumpuk di kanan — keypadnya terlihat
                 * miring ke kiri walau grid-nya sendiri sudah rata. Mengisi
                 * selnya membuat jarak antar tombol benar-benar seragam.
                 */
                className={cn(
                  "aspect-square w-full rounded-[2.4cqw] border border-line bg-surface",
                  "font-mono text-[4.4cqw] font-semibold",
                  onTombol
                    ? "transition-colors hover:bg-soft active:bg-surface-2"
                    : "cursor-default opacity-70",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Plat bawah ──────────────────────────────────────────── */}
          <div className="mt-[4cqw] flex items-center justify-between border-t border-line pt-[2.6cqw] font-mono text-[2.8cqw] tracking-wider text-muted">
            <span>SN 0048-2026</span>
            <span>DN15 · 1,5 m³/j</span>
          </div>
        </div>

        <Sambungan sisi="kanan" />
      </div>
    </div>
  );
}
