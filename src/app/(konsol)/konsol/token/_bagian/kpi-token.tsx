import { Card } from "@/components/ui/card";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";

const KPI: [string, string][] = [
  ["aktif", "Aktif"],
  ["used", "Terpakai"],
  ["expired", "Kedaluwarsa"],
  ["revoked", "Dibatalkan"],
  ["literBelumDipakai", "Liter Belum Dipakai"],
];

export function KpiToken({ kpi }: { kpi: Record<string, number> }) {
  return (
    <div className="berjenjang grid gap-px overflow-hidden rounded-card border border-line bg-line grid-cols-2 lg:grid-cols-5">
      {KPI.map(([k, label]) => {
        const v = kpi[k];
        return (
          <Card key={k} className="rounded-none border-0 px-4 py-3.5">
            <span className="eyebrow truncate text-muted">{label}</span>
            <p className="tabular mt-2 flex items-baseline gap-1.5 font-mono text-[clamp(1.25rem,1.7vw,1.6rem)] leading-none font-bold">
              {typeof v === "number" && Number.isFinite(v) ? (
                <AngkaBergerak nilai={v} />
              ) : (
                "—"
              )}
              {k === "literBelumDipakai" ? (
                <span className="font-mono text-[12.5px] font-semibold text-muted">L</span>
              ) : null}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
