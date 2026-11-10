import { rupiah } from "@/lib/format";
import { Panel } from "@/components/ui/card";
import type { Golongan } from "../_tipe";

export function PanelTarif({ golongan }: { golongan: Golongan[] }) {
  return (
    <Panel>
      <div className="space-y-1">
        {golongan.map((g) => (
          <div
            className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0"
            key={g.id}
          >
            <span className="text-ink">{g.nama}</span>
            <span className="tabular font-mono text-ink">{rupiah(g.tarifPerLiter, 1)}/L</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
