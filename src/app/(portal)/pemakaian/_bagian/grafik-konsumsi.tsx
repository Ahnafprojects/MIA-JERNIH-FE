import { GrafikBatang } from "@/components/domain/grafik";
import { liter } from "@/lib/format";
import type { RentangGrafik } from "../_tipe";

export function GrafikKonsumsi({
  memuat,
  rentangGrafik,
  setRentangGrafik,
  dataGrafik,
}: {
  memuat: boolean;
  rentangGrafik: RentangGrafik;
  setRentangGrafik: (r: RentangGrafik) => void;
  dataGrafik: {
    labels: string[];
    deret: { name: string; unit: string; points: number[] }[];
  };
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Grafik Riwayat Konsumsi
          </h2>
          <p className="text-xs text-muted">
            Pola lonjakan pemakaian dalam rentang harian dan bulanan.
          </p>
        </div>

        <div className="flex rounded-[3px] border border-line bg-soft p-0.5">
          <button
            type="button"
            onClick={() => setRentangGrafik("7hari")}
            className={`rounded-[2px] px-3 py-1 text-xs font-semibold transition-colors ${
              rentangGrafik === "7hari"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => setRentangGrafik("6bulan")}
            className={`rounded-[2px] px-3 py-1 text-xs font-semibold transition-colors ${
              rentangGrafik === "6bulan"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            6 Bulan Terakhir
          </button>
        </div>
      </div>

      {!memuat ? (
        <GrafikBatang
          labels={dataGrafik.labels}
          deret={dataGrafik.deret}
          tinggi={240}
          format={(n) => liter(n, 0)}
        />
      ) : (
        <div className="h-56 animate-pulse rounded-[3px] bg-soft" />
      )}
    </div>
  );
}
