import { Calendar, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { liter, rupiah } from "@/lib/format";
import type { RingkasanKpi } from "../_tipe";

export function KpiPemakaian({ kpi }: { kpi: RingkasanKpi }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-[4px] border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Hari Ini</span>
          <Clock size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.hariIniL, 1)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Biaya:{" "}
          <strong className="font-mono text-ink">
            {rupiah(kpi.hariIniL * 7.5)}
          </strong>
        </p>
      </div>

      <div className="rounded-[4px] border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">7 Hari Terakhir</span>
          <Calendar size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.mingguIniL, 0)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Akumulasi 1 minggu</p>
      </div>

      <div className="rounded-[4px] border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Bulan Berjalan</span>
          <TrendingUp size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.bulanIniL, 0)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Proyeksi 30 hari</p>
      </div>

      <div className="rounded-[4px] border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Rata-rata Harian</span>
          <TrendingDown size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.rataRataHarianL, 1)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Baku mutu: 50 L / hari</p>
      </div>
    </div>
  );
}
