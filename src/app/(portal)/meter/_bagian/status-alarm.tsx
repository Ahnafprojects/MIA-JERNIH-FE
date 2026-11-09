import { Badge } from "@/components/ui/badge";

export function StatusAlarm({
  statusAlarm,
}: {
  statusAlarm: { level: string; nada: "bahaya" | "peringatan" | "sukses"; keterangan: string };
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-ink">Status Alarm Suara Meter</h3>
        <Badge nada={statusAlarm.nada} titik>
          {statusAlarm.level}
        </Badge>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Pola bunyi buzzer: <strong className="text-ink">{statusAlarm.keterangan}</strong>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-[10px] text-muted text-center">
        <div className="rounded-[2px] bg-soft p-1.5">
          <span className="block font-bold text-warn">&le; 5 L</span>
          Bip / 10s
        </div>
        <div className="rounded-[2px] bg-soft p-1.5">
          <span className="block font-bold text-danger">&le; 2 L</span>
          Bip / 2s
        </div>
        <div className="rounded-[2px] bg-soft p-1.5">
          <span className="block font-bold text-danger">0 L</span>
          Bunyi Terus
        </div>
      </div>
    </div>
  );
}
