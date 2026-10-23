import { cn } from "@/lib/cn";
import { Card } from "./card";

/**
 * Kartu KPI.
 *
 * `nilai` sengaja bertipe `string | null`. `null` berarti server TIDAK
 * mengirim angka itu, dan kartunya menampilkan "—". Itu bukan kerewelan:
 * menukar nilai yang hilang dengan 0 membuat "0 pelanggan terhubung" terbaca
 * sebagai hasil pengukuran, padahal artinya datanya belum ada.
 */
export function StatTile({
  label,
  nilai,
  satuan,
  kaki,
  nada = "netral",
  className,
}: {
  label: string;
  nilai: string | null;
  satuan?: string;
  kaki?: React.ReactNode;
  nada?: "netral" | "brand" | "sukses" | "peringatan" | "bahaya";
  className?: string;
}) {
  const warna = {
    netral: "text-ink",
    brand: "text-brand-600",
    sukses: "text-success",
    peringatan: "text-warn",
    bahaya: "text-danger",
  }[nada];

  return (
    <Card className={cn("p-4", className)}>
      <p className="eyebrow text-muted">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "tabular font-mono text-[26px] leading-none font-bold",
            nilai === null ? "text-muted" : warna,
          )}
        >
          {nilai ?? "—"}
        </span>
        {satuan && nilai !== null ? (
          <span className="text-[13px] font-medium text-muted">{satuan}</span>
        ) : null}
      </p>
      {kaki ? <p className="mt-1.5 text-[12.5px] text-muted">{kaki}</p> : null}
    </Card>
  );
}
