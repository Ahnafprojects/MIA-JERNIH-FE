import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GrafikAir, type KolomAir } from "@/components/domain/grafik-air";
import { liter } from "@/lib/format";

export function GrafikPemakaian({
  memuat,
  data,
  targetHarianL,
}: {
  memuat: boolean;
  data: KolomAir[];
  targetHarianL: number;
}) {
  return (
    <div className="permukaan p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Grafik Pemakaian 7 Hari Terakhir
          </h2>
          <p className="text-xs text-muted">
            Liter per hari &middot; garis putus = rata-rata Anda sendiri.
          </p>
        </div>
        <Link
          href="/pemakaian"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold whitespace-nowrap text-brand-700 hover:underline dark:text-accent"
        >
          <span>Analisis Penuh</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {memuat ? (
        <div className="cekung h-48 animate-pulse" />
      ) : (
        <GrafikAir
          data={data}
          tinggi={210}
          target={targetHarianL}
          labelTarget={`Rata-rata ${liter(targetHarianL, 0)}`}
          format={(n) => liter(n, 0)}
        />
      )}
    </div>
  );
}
