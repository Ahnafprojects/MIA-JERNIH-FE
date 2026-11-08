import { FlowVis, LivePill } from "@/components/domain/live";
import { debit, liter } from "@/lib/format";

export function KartuSaldo({
  saldo,
  debitLpm,
}: {
  saldo: number;
  debitLpm: number;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted">Saldo Air Tersedia</span>
        <LivePill teks="Sensor Live" />
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="tabular font-mono text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {liter(saldo, 2)}
        </span>
        <span className="font-mono text-xs text-muted">
          ({(saldo / 1000).toFixed(3)} m³)
        </span>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Debit Aliran Saat Ini</span>
          <span className="tabular font-mono font-bold text-ink">
            {debit(debitLpm)}
          </span>
        </div>
        <div className="mt-2">
          <FlowVis lpm={debitLpm} />
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {debitLpm > 0
            ? "Kran terbuka, air sedang dialirkan ke instalasi rumah Anda."
            : "Kran tertutup, tidak terdeteksi aliran air."}
        </p>
      </div>
    </div>
  );
}
