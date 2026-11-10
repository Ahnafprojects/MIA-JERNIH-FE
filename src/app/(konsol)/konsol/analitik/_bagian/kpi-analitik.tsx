import { Card } from "@/components/ui/card";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import type { Analitik } from "../_tipe";

export function KpiAnalitik({ kpi }: { kpi: Analitik["kpi"] | undefined }) {
  return (
    <div className="berjenjang grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-5">
      {kpi?.map((k) => (
        <Card className="rounded-none border-0 px-4 py-3.5" key={k.key}>
          <span className="eyebrow truncate text-muted">{k.label}</span>
          <p className="tabular mt-2 flex items-baseline gap-1.5 font-mono text-[clamp(1.25rem,1.7vw,1.6rem)] leading-none font-bold">
            <AngkaBergerak nilai={Number.isFinite(k.value) ? k.value : null} />
            {k.unit ? (
              <span className="font-mono text-[12.5px] font-semibold text-muted">{k.unit}</span>
            ) : null}
          </p>
        </Card>
      )) || (
        <div className="col-span-full bg-surface p-8 text-xs text-muted">
          Memuat analitik...
        </div>
      )}
    </div>
  );
}
