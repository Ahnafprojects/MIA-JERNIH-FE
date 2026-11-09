import { Badge } from "@/components/ui/badge";
import type { PerluPerhatian as BarisPerhatian } from "../_tipe";

export function PerluPerhatian({ perhatian }: { perhatian: BarisPerhatian[] }) {
  if (perhatian.length === 0) return null;

  return (
    <div className="rounded-card border border-warn/30 bg-warn/10 p-4">
      <div className="flex items-center gap-2">
        <Badge nada="peringatan" titik>
          Perlu Perhatian
        </Badge>
        <span className="tabular font-mono text-xs font-bold text-warn">
          {perhatian.length}
        </span>
      </div>
      <ul className="mt-2 divide-y divide-warn/20 text-xs">
        {perhatian.map((x) => (
          <li key={x.meterId} className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="font-mono text-ink">{x.serial}</span>
            <span className="text-muted">{x.masalah}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
