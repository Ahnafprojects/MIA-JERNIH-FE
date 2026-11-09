import { CheckCircle2 } from "lucide-react";

export function StatusTelemetri({ ts }: { ts: string | undefined }) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-4 text-xs text-muted">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">Koneksi Telemetri</span>
        <span className="flex items-center gap-1 font-mono text-success">
          <CheckCircle2 size={12} />
          Daring
        </span>
      </div>
      <p className="mt-1 text-[11px]">
        Laporan terakhir:{" "}
        {ts ? new Date(ts).toLocaleTimeString("id-ID") : "Baru saja"}
      </p>
    </div>
  );
}
