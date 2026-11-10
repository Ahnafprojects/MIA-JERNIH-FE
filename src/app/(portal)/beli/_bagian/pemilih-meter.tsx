import { Droplets } from "lucide-react";
import { literAtauKosong } from "@/lib/format";
import type { MeterSingkat } from "@/lib/auth-tipe";

export function PemilihMeter({
  meter,
  meterAktifId,
  pilihMeter,
}: {
  meter: MeterSingkat[];
  meterAktifId?: string;
  pilihMeter: (id: string) => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <label className="text-xs font-bold text-ink">Meter Tujuan</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {meter.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => pilihMeter(m.id)}
            className={`flex items-center gap-2 rounded-[3px] border px-3 py-2 text-xs transition-colors ${
              m.id === meterAktifId
                ? "border-brand-500 bg-brand-500/10 font-bold text-brand-700 dark:text-accent"
                : "border-line bg-soft text-muted hover:text-ink"
            }`}
          >
            <Droplets size={14} />
            <span>{m.nomorSeri}</span>
            <span className="font-mono text-[11px] text-muted">
              ({literAtauKosong(m.saldoLiter, 0)})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
