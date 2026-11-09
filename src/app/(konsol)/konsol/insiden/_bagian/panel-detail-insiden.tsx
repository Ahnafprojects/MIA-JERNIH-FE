import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tanggalJam } from "@/lib/format";
import type { Insiden } from "../_tipe";

export function PanelDetailInsiden({
  selected,
  update,
}: {
  selected: Insiden | null;
  update: (s: string) => void;
}) {
  if (!selected) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-xs text-muted">
        Pilih insiden di kiri untuk melihat rinciannya.
      </div>
    );
  }

  return (
    <div className="p-6">
      <Badge>{selected.keparahan}</Badge>
      <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
        {selected.judul}
      </h2>
      <p className="mt-2 text-sm text-muted">{selected.detail}</p>

      <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="eyebrow text-muted">Meter</dt>
          <dd className="mt-1 font-mono text-ink">{selected.meterId || "—"}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted">Dibuka</dt>
          <dd className="mt-1 text-ink">{tanggalJam(selected.dibukaPada)}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted">Teknisi</dt>
          <dd className="mt-1 text-ink">{selected.teknisi?.nama || "Belum ditugaskan"}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted">Jenis</dt>
          <dd className="mt-1 text-ink">{selected.tipe}</dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-2">
        <Button onClick={() => update("DITUGASKAN")}>Tugaskan / Proses</Button>
        <Button varian="sekunder" onClick={() => update("SELESAI")}>
          Tandai Selesai
        </Button>
      </div>
    </div>
  );
}
