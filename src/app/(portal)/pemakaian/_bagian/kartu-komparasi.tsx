import { TrendingDown } from "lucide-react";
import { liter } from "@/lib/format";

export function KartuKomparasi({
  rasioZonaPersen,
  rataRataHarianL,
}: {
  rasioZonaPersen: number;
  rataRataHarianL: number;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-[2px] bg-success/10 text-success">
          <TrendingDown size={16} />
        </span>
        <h2 className="text-sm font-bold text-ink">
          Dibanding Rumah Tangga Sezona
        </h2>
      </div>
      <div className="mt-3">
        <p className="text-base font-medium text-ink">
          Konsumsi rumah Anda{" "}
          <strong className="font-mono text-lg font-bold text-success">
            {Math.abs(rasioZonaPersen)}% lebih hemat
          </strong>{" "}
          daripada rata-rata pelanggan golongan serupa di zona Anda.
        </p>
        <p className="mt-1.5 text-[11px] text-muted">
          Rata-rata zona: 48,2 L/hari &middot; Penggunaan Anda:{" "}
          {liter(rataRataHarianL, 1)}/hari
        </p>
      </div>
    </div>
  );
}
