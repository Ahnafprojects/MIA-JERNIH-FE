import { Download } from "lucide-react";
import { PILIHAN_RENTANG } from "../_tipe";
import type { Analitik } from "../_tipe";

interface Props {
  rentang: number;
  setRentang: (v: number) => void;
  zona: string;
  setZona: (v: string) => void;
  zonaList: Analitik["zonaList"] | undefined;
  onUnduh: (format: string) => void;
}

const kelasPilihan =
  "h-9 rounded-input border border-line bg-surface px-2 text-xs text-ink outline-none focus:border-brand-600";

export function KepalaAnalitik({ rentang, setRentang, zona, setZona, zonaList, onUnduh }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <p className="eyebrow text-brand-600">Data Operasional</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Analitik &amp; Laporan
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className={kelasPilihan}
          value={rentang}
          onChange={(e) => setRentang(Number(e.target.value))}
        >
          {PILIHAN_RENTANG.map((n) => (
            <option key={n} value={n}>
              {n} hari
            </option>
          ))}
        </select>
        <select className={kelasPilihan} value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Semua zona</option>
          {zonaList?.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nama}
            </option>
          ))}
        </select>
        <button
          onClick={() => onUnduh("csv")}
          className="inline-flex items-center gap-1 rounded-input border border-line bg-surface px-3 text-xs text-ink outline-none hover:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <Download size={14} /> CSV
        </button>
      </div>
    </header>
  );
}
