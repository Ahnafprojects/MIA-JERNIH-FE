import { ArrowRight, ShieldCheck } from "lucide-react";
import { liter, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function Ringkasan({
  nomorSeri,
  volumeFinalL,
  tarifPerLiter,
  metode,
  totalHargaRp,
  memuatBayar,
  tahapBayar,
  onBayar,
}: {
  nomorSeri?: string;
  volumeFinalL: number;
  tarifPerLiter: number;
  metode: string;
  totalHargaRp: number;
  memuatBayar: boolean;
  tahapBayar: string | null;
  onBayar: () => void;
}) {
  return (
    <div className="sticky top-24 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Ringkasan Pembelian
      </h2>
      <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-xs">
        <div className="flex justify-between">
          <span className="text-muted">Meter Tujuan</span>
          <span className="font-mono font-bold text-ink">{nomorSeri}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Volume Air</span>
          <span className="font-mono font-bold text-ink">{liter(volumeFinalL, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Tarif Dasar</span>
          <span className="font-mono text-muted">{rupiah(tarifPerLiter, 1)} / Liter</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Metode Bayar</span>
          <span className="font-semibold text-ink">{metode}</span>
        </div>
      </div>

      <div className="my-4 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold text-muted">Total Tagihan</span>
          <span className="tabular font-mono text-2xl font-black text-ink">
            {rupiah(totalHargaRp)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        varian="utama"
        blok
        memuat={memuatBayar}
        disabled={volumeFinalL < 500}
        onClick={onBayar}
      >
        {memuatBayar ? tahapBayar ?? "Memproses..." : `Bayar ${rupiah(totalHargaRp)}`}
        {!memuatBayar ? <ArrowRight size={16} /> : null}
      </Button>

      {memuatBayar ? (
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-muted">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-brand-500" />
          <span>{tahapBayar}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-start gap-2 rounded-[2px] bg-soft p-3 text-[11px] leading-relaxed text-muted">
        <ShieldCheck size={16} className="shrink-0 text-success" />
        <span>
          Pembelian ini menerbitkan kode token sekali pakai. Saldo fisik meter baru akan bertambah setelah token ditukarkan ke meter.
        </span>
      </div>
    </div>
  );
}
