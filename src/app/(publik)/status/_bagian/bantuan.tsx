"use client";

/**
 * Apa yang bisa dilakukan warga saat zonanya terganggu.
 *
 * Seksi ini ada karena halaman status tanpa langkah lanjutan hanya memindahkan
 * kecemasan: orang membuka halaman ini justru pada saat airnya sedang mati,
 * dan "Gangguan — perkiraan pulih 3 jam lagi" tidak memberitahunya di mana
 * mengambil air malam ini.
 *
 * Titik air hanya ditampilkan untuk zona yang SEDANG tidak normal. Daftar
 * tangki di zona yang airnya mengalir lancar hanya memanjangkan halaman dan
 * menenggelamkan dua titik yang benar-benar dibutuhkan hari ini.
 */

import { Droplets, Mail, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Kontak, TitikAir } from "./tipe";

const IKON = {
  telepon: Phone,
  whatsapp: MessageCircle,
  surel: Mail,
} as const;

/** Nomor telepon disimpan dengan spasi dan tanda kurung; `tel:` tidak boleh. */
const tautan = (k: Kontak): string => {
  if (k.jenis === "surel") return `mailto:${k.nilai}`;
  const digit = k.nilai.replace(/[^\d+]/g, "");
  if (k.jenis === "whatsapp") {
    // WhatsApp menuntut kode negara. Nomor Indonesia yang diawali 0 diganti 62.
    const internasional = digit.startsWith("0") ? `62${digit.slice(1)}` : digit;
    return `https://wa.me/${internasional.replace(/^\+/, "")}`;
  }
  return `tel:${digit}`;
};

export function SeksiBantuan({
  titikAir,
  kontak,
  memuat,
}: {
  titikAir: TitikAir[];
  kontak: Kontak[];
  memuat: boolean;
}) {
  return (
    <section aria-labelledby="judul-bantuan" className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <h2
        id="judul-bantuan"
        className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
      >
        Saat air berhenti di zona Anda
      </h2>
      <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
        Dua hal yang bisa dilakukan sekarang juga: mengambil air di titik
        terdekat, dan melaporkan apa yang Anda alami supaya ikut tercatat di
        halaman ini.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* ── Titik air darurat ──────────────────────────────────────── */}
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h3 className="font-display text-[15px] font-bold tracking-tight">
                Titik pengambilan air
              </h3>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Bawa jeriken sendiri. Tanpa biaya.
              </p>
            </div>
            {!memuat && titikAir.length > 0 ? (
              <Badge nada="info">{angka(titikAir.length)} titik aktif</Badge>
            ) : null}
          </div>

          {memuat ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : titikAir.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13.5px] leading-relaxed text-muted">
              Tidak ada titik air darurat yang dibuka hari ini — seluruh zona
              teraliri normal. Titik akan muncul di sini begitu ada zona yang
              terganggu.
            </p>
          ) : (
            <ul>
              {titikAir.map((t) => (
                <li key={t.id} className="border-t border-line first:border-0">
                  <div className="flex gap-3.5 px-5 py-4">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40"
                    >
                      <Droplets size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <p className="font-semibold">{t.nama}</p>
                        <Badge nada="netral">{t.zonaNama}</Badge>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                        {t.alamat}
                      </p>
                      <p className="tabular mt-1.5 font-mono text-[12.5px] text-muted">
                        {t.jamLayanan} · kapasitas{" "}
                        {angka(t.kapasitasLiter)} liter
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Nomor yang bisa dihubungi ──────────────────────────────── */}
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-[15px] font-bold tracking-tight">
              Yang bisa dihubungi
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Setiap laporan masuk ke antrean yang sama dengan rapor kinerja.
            </p>
          </div>

          {memuat ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <ul>
              {kontak.map((k) => {
                const Ikon = IKON[k.jenis];
                return (
                  <li
                    key={k.nilai}
                    className="border-t border-line first:border-0"
                  >
                    <a
                      href={tautan(k)}
                      className={cn(
                        "flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-soft",
                      )}
                    >
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-soft text-muted"
                      >
                        <Ikon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] text-muted">
                          {k.label}
                        </span>
                        <span className="tabular block font-mono text-[15px] font-semibold text-brand-600">
                          {k.nilai}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-muted">
                          {k.keterangan}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
