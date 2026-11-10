import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import type { AnggotaTim } from "../_tipe";

export function PanelTim({ members }: { members: AnggotaTim[] }) {
  return (
    <Panel isiClassName="p-0">
      <div className="divide-y divide-line">
        {members.map((m) => (
          <div className="flex items-center justify-between p-4 text-sm" key={m.id}>
            <span className="text-ink">
              {m.nama}
              <small className="ml-2 font-mono text-muted">{m.email}</small>
            </span>
            <Badge>{m.peran}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}
