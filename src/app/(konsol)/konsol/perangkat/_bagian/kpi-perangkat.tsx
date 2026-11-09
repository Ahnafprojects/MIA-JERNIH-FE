import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/keadaan";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import type { KpiPerangkat as KpiPerangkatData } from "../_tipe";

export function KpiPerangkat({ kpi }: { kpi: KpiPerangkatData[] }) {
  return (
    <div className="berjenjang grid gap-px overflow-hidden rounded-card border border-line bg-line grid-cols-2 lg:grid-cols-4">
      {kpi.map((x) => (
        <Card key={x.key} className="rounded-none border-0 px-4 py-3.5">
          <span className="eyebrow truncate text-muted">{x.label}</span>
          <p className="tabular mt-2 flex items-baseline gap-1.5 font-mono text-[clamp(1.25rem,1.7vw,1.6rem)] leading-none font-bold">
            <AngkaBergerak nilai={Number.isFinite(x.value) ? x.value : null} />
            {x.unit ? (
              <span className="font-mono text-[12.5px] font-semibold text-muted">
                {x.unit}
              </span>
            ) : null}
          </p>
        </Card>
      ))}
    </div>
  );
}

export function KpiPerangkatRangka() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
