import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Insiden } from "../_tipe";

export function DaftarInsiden({
  rows,
  selectedId,
  onPilih,
}: {
  rows: Insiden[];
  selectedId: string | null;
  onPilih: (i: Insiden) => void;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-muted">Tidak ada insiden pada status ini.</p>;
  }

  return (
    <div className="berjenjang divide-y divide-line">
      {rows.map((i) => {
        const aktif = selectedId === i.id;
        return (
          <button
            key={i.id}
            type="button"
            onClick={() => onPilih(i)}
            aria-current={aktif ? "true" : undefined}
            className={cn(
              "w-full border-l-2 p-4 text-left transition-colors",
              aktif
                ? "border-accent bg-brand-500/10"
                : "border-transparent hover:bg-soft",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <b className="text-sm text-ink">{i.judul}</b>
              <Badge>{i.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {i.tipe} · {i.keparahan} · {i.zona || "—"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
