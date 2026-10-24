"use client";

/**
 * Sebaran status seluruh meter: normal · berbunyi · insiden · offline.
 *
 * Digambar sebagai SATU batang terbagi, bukan empat angka berjajar. Yang
 * ingin diketahui petugas bukan "berapa yang offline" melainkan "seberapa
 * besar bagiannya dibanding seluruh jaringan" — dan proporsi dibaca mata
 * jauh lebih cepat dari batang daripada dari empat bilangan yang harus
 * dijumlahkan sendiri.
 *
 * Tiap potongan tetap punya barisnya sendiri di bawah, lengkap dengan kata,
 * jumlah, dan persennya. Batangnya sendiri `aria-hidden`: pembaca layar
 * mendapat daftarnya, bukan hiasan yang sama dua kali.
 */

import { Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { angkaSah } from "./tipe";

interface Potongan {
  kunci: string;
  kata: string;
  warna: string;
  teks: string;
  jelas: string;
}

/** Urutan dari paling tenang ke paling genting — sama dengan urutan batang. */
const POTONGAN: Potongan[] = [
  {
    kunci: "normal",
    kata: "Normal",
    warna: "bg-success",
    teks: "text-success",
    jelas: "mengalir, saldo aman",
  },
  {
    kunci: "alarm",
    kata: "Berbunyi",
    warna: "bg-warn",
    teks: "text-warn",
    jelas: "saldo menipis",
  },
  {
    kunci: "insiden",
    kata: "Insiden",
    warna: "bg-danger",
    teks: "text-danger",
    jelas: "dilaporkan bermasalah",
  },
  {
    kunci: "offline",
    kata: "Offline",
    warna: "bg-line-strong",
    teks: "text-muted",
    jelas: "tidak mengirim data",
  },
];

export function StatusJaringan({
  jumlah,
  memuat,
}: {
  jumlah: Record<string, number> | undefined;
  memuat: boolean;
}) {
  if (memuat) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const baris = POTONGAN.map((p) => ({
    ...p,
    nilai: angkaSah(jumlah?.[p.kunci]),
  }));

  // Total dihitung dari yang BENAR-BENAR dikirim. Kalau satu status hilang,
  // persennya tetap jujur terhadap yang ada, bukan terhadap angka karangan.
  const total = baris.reduce((t, b) => t + (b.nilai ?? 0), 0);

  return (
    <div>
      <div
        aria-hidden
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-soft"
      >
        {total > 0
          ? baris.map((b) =>
              b.nilai && b.nilai > 0 ? (
                <span
                  key={b.kunci}
                  className={cn("h-full", b.warna)}
                  style={{ width: `${(b.nilai / total) * 100}%` }}
                />
              ) : null,
            )
          : null}
      </div>

      <dl className="mt-4 divide-y divide-line/70">
        {baris.map((b) => {
          const pct =
            b.nilai !== null && total > 0 ? (b.nilai / total) * 100 : null;
          return (
            <div
              key={b.kunci}
              className="flex items-baseline gap-3 py-2 first:pt-0 last:pb-0"
            >
              {/* Garis takar tegak, bukan titik bulat — dan kata di
                  sebelahnya memikul maknanya, bukan warnanya. */}
              <span
                aria-hidden
                className={cn("h-3 w-[3px] shrink-0 translate-y-px", b.warna)}
              />
              <dt className="min-w-0 flex-1">
                <span className="text-[13px] font-semibold">{b.kata}</span>{" "}
                <span className="text-[12px] text-muted">{b.jelas}</span>
              </dt>
              <dd
                className={cn(
                  "tabular shrink-0 font-mono text-[13px] font-bold",
                  b.nilai === null ? "text-muted" : b.teks,
                )}
              >
                {b.nilai === null ? "—" : angka(b.nilai)}
              </dd>
              <dd className="tabular w-12 shrink-0 text-right font-mono text-[12px] text-muted">
                {pct === null ? "—" : `${angka(pct, 1)}%`}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted">
        Total terpantau{" "}
        <span className="tabular font-mono font-semibold text-ink">
          {total > 0 ? angka(total) : "—"}
        </span>{" "}
        meter
      </p>
    </div>
  );
}
