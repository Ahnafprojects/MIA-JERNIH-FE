import { literAtauKosong } from "@/lib/format";
import type { MeterSingkat } from "@/lib/auth-tipe";

export function PemilihMeter({
  meter,
  pilihMeter,
  meterAktifId,
}: {
  meter: MeterSingkat[];
  pilihMeter: (id: string) => void;
  meterAktifId?: string;
}) {
  if (meter.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[3px] border border-line bg-surface p-3">
      <span className="text-xs font-semibold text-ink">Pilih Meter Tujuan:</span>
      <div className="flex flex-wrap gap-2">
        {meter.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => pilihMeter(m.id)}
            className={`rounded-[2px] px-3 py-1 font-mono text-xs font-bold transition-colors ${
              m.id === meterAktifId
                ? "bg-brand-600 text-white"
                : "border border-line bg-soft text-muted hover:text-ink"
            }`}
          >
            {m.nomorSeri} ({literAtauKosong(m.saldoLiter, 0)})
          </button>
        ))}
      </div>
    </div>
  );
}
