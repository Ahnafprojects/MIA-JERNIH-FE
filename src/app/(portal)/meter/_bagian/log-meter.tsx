import { History } from "lucide-react";
import { liter, debit } from "@/lib/format";
import type { LogMeter } from "../_tipe";

export function LogMeter({ logList }: { logList: LogMeter[] }) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <History size={16} className="text-muted" />
        <h3 className="font-display text-sm font-bold text-ink">
          Log Telemetri Terakhir
        </h3>
      </div>
      {logList.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">Belum ada riwayat log tercatat.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line text-xs font-mono">
          {logList.slice(0, 5).map((l, i) => (
            <li key={i} className="flex items-center justify-between py-2 text-muted">
              <span>{new Date(l.ts).toLocaleTimeString("id-ID")}</span>
              <span>Debit: {debit(l.debitLpm)}</span>
              <span className="font-bold text-ink">{liter(l.saldoL, 1)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
