import { Calendar, Droplet, TrendingDown } from "lucide-react";
import { liter, rupiah } from "@/lib/format";

export function KartuPemakaian({ totalHariIniL }: { totalHariIniL: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-[3px] border border-line bg-surface p-4">
        <div className="flex items-center gap-1.5 text-muted">
          <TrendingDown size={14} />
          <span className="eyebrow">Pemakaian Hari Ini</span>
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
          {liter(totalHariIniL, 1)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Target harian: 50,0 L</p>
      </div>

      <div className="rounded-[3px] border border-line bg-surface p-4">
        <div className="flex items-center gap-1.5 text-muted">
          <Calendar size={14} />
          <span className="eyebrow">Bulan Berjalan</span>
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
          {liter(totalHariIniL * 24, 0)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Estimasi akumulasi</p>
      </div>

      <div className="rounded-[3px] border border-line bg-surface p-4">
        <div className="flex items-center gap-1.5 text-muted">
          <Droplet size={14} />
          <span className="eyebrow">Estimasi Tarif</span>
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
          {rupiah(totalHariIniL * 7.5)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Rp 7,5 / liter (Gol. Rumah)
        </p>
      </div>
    </div>
  );
}
