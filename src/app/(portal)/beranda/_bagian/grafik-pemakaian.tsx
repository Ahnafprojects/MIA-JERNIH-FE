import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GrafikBatang, type Deret } from "@/components/domain/grafik";
import { liter } from "@/lib/format";

export function GrafikPemakaian({
  memuat,
  labels,
  deret,
}: {
  memuat: boolean;
  labels: string[];
  deret: Deret[];
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Grafik Pemakaian 7 Hari Terakhir
          </h2>
          <p className="text-xs text-muted">
            Volume air terpakai harian dalam satuan liter.
          </p>
        </div>
        <Link
          href="/pemakaian"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
        >
          <span>Analisis Penuh</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {!memuat ? (
        <GrafikBatang
          labels={labels}
          deret={deret}
          tinggi={200}
          format={(n) => liter(n, 0)}
        />
      ) : (
        <div className="h-48 animate-pulse rounded-[3px] bg-soft" />
      )}
    </div>
  );
}
