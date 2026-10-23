import { cn } from "@/lib/cn";

export type Nada = "netral" | "brand" | "sukses" | "peringatan" | "bahaya" | "info";

const NADA: Record<Nada, string> = {
  netral: "bg-soft text-muted border-line",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  sukses: "bg-success-soft text-success border-success/30",
  peringatan: "bg-warn-soft text-warn border-warn/30",
  bahaya: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
};

/**
 * Lencana status.
 *
 * `anak` WAJIB berisi kata, bukan hanya warna. Pengguna dengan buta warna
 * tidak bisa membedakan hijau dan merah, dan warna saja juga hilang maknanya
 * saat halaman dicetak hitam-putih untuk lampiran proposal.
 */
export function Badge({
  nada = "netral",
  titik,
  className,
  children,
}: {
  nada?: Nada;
  /** Titik kecil di depan teks, menegaskan status tanpa menggantikan kata. */
  titik?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-semibold whitespace-nowrap",
        NADA[nada],
        className,
      )}
    >
      {titik ? (
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
