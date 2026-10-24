import { cn } from "@/lib/cn";

/**
 * Penanda data sensor hidup. Denyut 1,8 detik seperti di pedoman.
 *
 * Bentuknya mengikuti `Badge`: persegi, bukan kapsul, dan penanda denyutnya
 * garis takar tegak, bukan titik bulat. Kapsul + titik adalah bentuk yang
 * sama persis dipakai hampir semua tampilan buatan AI; dua komponen berbeda
 * yang keduanya memakai bentuk itu membuat polanya makin kentara. Lihat
 * catatan panjang di `src/components/ui/badge.tsx`.
 */
export function LivePill({ teks = "Live" }: { teks?: string }) {
  return (
    <span className="motion-aware inline-flex items-center gap-1.5 rounded-[3px] border border-line bg-soft px-2 py-0.5 text-[11px] font-semibold text-muted">
      <span
        aria-hidden
        className="h-2.5 w-[2px] shrink-0 bg-accent"
        style={{ animation: "denyut 1.8s ease-in-out infinite" }}
      />
      {teks}
    </span>
  );
}

/**
 * Visual aliran air.
 *
 * Animasinya HANYA jalan saat `lpm > 0`. Batang yang terus bergerak padahal
 * debitnya nol adalah kebohongan kecil yang langsung terbaca saat demo:
 * penonton melihat air "mengalir" sementara angkanya 0,0.
 */
export function FlowVis({ lpm, className }: { lpm: number; className?: string }) {
  const mengalir = lpm > 0;
  return (
    <div
      className={cn(
        "motion-aware h-2 w-full overflow-hidden rounded-full bg-soft",
        className,
      )}
      role="img"
      aria-label={mengalir ? `Air mengalir ${lpm} liter per menit` : "Tidak ada aliran"}
    >
      {mengalir ? (
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--color-brand-400) 0 0.5rem, var(--color-brand-200) 0.5rem 1rem)",
            backgroundSize: "2rem 100%",
            animation: "aliran 0.9s linear infinite",
          }}
        />
      ) : null}
    </div>
  );
}
