"use client";

/**
 * Strip 30 hari — satu petak per hari, diwarnai menurut status hari itu.
 *
 * Inilah bentuk paling padat dari "melacak": empat angka ringkasan
 * memberitahu BERAPA, strip memberitahu KAPAN. Dua gangguan yang tersebar
 * sepanjang bulan dan dua gangguan yang menumpuk di akhir pekan yang sama
 * menghasilkan keandalan yang sama persis, padahal artinya jauh berbeda —
 * dan hanya strip yang memperlihatkan bedanya tanpa satu kalimat pun.
 *
 * Tiga hal yang dijaga:
 *
 * - **Warna tidak pernah sendirian.** Seluruh strip adalah satu `role="img"`
 *   dengan ringkasan kalimat; petaknya sendiri `aria-hidden`. Membiarkan 30
 *   petak terbaca satu per satu membuat pembaca layar menghabiskan setengah
 *   menit untuk sebuah hiasan. Rincian per hari tetap tersedia utuh sebagai
 *   teks di seksi Riwayat gangguan di bawahnya.
 * - **Petaknya tidak pernah lebih sempit dari 4px.** Di 390px, 30 petak
 *   berjarak 2px menyisakan ±9px per petak; di bawah itu warnanya berhenti
 *   terbaca dan stripnya jadi garis.
 * - **Tanpa animasi.** Ia dibaca sebagai catatan, bukan sebagai grafik yang
 *   sedang mengisi dirinya.
 */

import { STATUS } from "@/components/peta/status-zona";
import { angka, tanggal } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { StatusZona } from "@/types/publik";
import type { HariStatus } from "./tipe";

function ringkasan(harian: HariStatus[]): string {
  const hitung: Record<StatusZona, number> = {
    normal: 0,
    gangguan: 0,
    perbaikan: 0,
  };
  for (const h of harian) hitung[h.status] += 1;

  const bagian = (["gangguan", "perbaikan", "normal"] as StatusZona[])
    .filter((s) => hitung[s] > 0)
    .map((s) => `${angka(hitung[s])} hari ${STATUS[s].label.toLowerCase()}`);

  return `Strip ${angka(harian.length)} hari terakhir: ${bagian.join(", ")}.`;
}

export function StripHarian({
  harian,
  className,
}: {
  harian: HariStatus[];
  className?: string;
}) {
  if (harian.length === 0) {
    return (
      <p className={cn("text-[12.5px] text-muted", className)}>
        Riwayat harian belum tersedia
      </p>
    );
  }

  const awal = harian[0];
  const akhir = harian[harian.length - 1];

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={ringkasan(harian)}
        className="flex gap-[2px]"
      >
        {harian.map((h) => (
          <span
            key={h.tanggal}
            aria-hidden
            // `title` untuk penunjuk sungguhan. Ia bukan pengganti teks —
            // yang menggantikan adalah daftar riwayat di bawah strip.
            title={`${tanggal(h.tanggal)} — ${STATUS[h.status].label}`}
            className={cn(
              "h-7 min-w-[4px] flex-1 rounded-[2px]",
              STATUS[h.status].titik,
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        <span className="tabular font-mono">{tanggal(awal.tanggal)}</span>
        <span className="tabular font-mono">
          {tanggal(akhir.tanggal)} · hari ini
        </span>
      </div>
    </div>
  );
}

/**
 * Legenda strip. Dipasang SEKALI untuk seluruh daftar, bukan di tiap baris —
 * arti warnanya sama di semua zona, dan mengulanginya empat kali hanya
 * menambah tinggi halaman.
 */
export function LegendaStrip({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {(["normal", "perbaikan", "gangguan"] as StatusZona[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5 text-[12px] text-muted">
          <span
            aria-hidden
            className={cn("size-2.5 rounded-[2px]", STATUS[s].titik)}
          />
          {STATUS[s].label}
        </li>
      ))}
    </ul>
  );
}
