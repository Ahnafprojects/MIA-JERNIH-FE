import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { liter } from "@/lib/format";
import type { TokenTerbit } from "../_tipe";

export function HasilToken({
  hasil,
  onCsv,
}: {
  hasil: TokenTerbit[];
  onCsv: () => void;
}) {
  return (
    <div className="rounded-card border border-success/40 bg-success/5 p-5">
      <h2 className="font-display text-[15px] font-bold">Kode diterbitkan sekali</h2>
      <div className="mt-3 divide-y divide-line">
        {hasil.map((x) => (
          <div className="flex items-center justify-between py-2 font-mono text-sm" key={x.kode}>
            <span className="tabular">
              {x.kode} · {liter(x.nilaiL, 0)}
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(x.kode)}
              className="grid size-8 place-items-center rounded-input text-muted hover:bg-soft hover:text-ink"
              aria-label={`Salin kode ${x.kode}`}
            >
              <Copy size={15} />
            </button>
          </div>
        ))}
      </div>
      <Button className="mt-3" varian="sekunder" onClick={onCsv}>
        <Download size={14} /> Unduh CSV
      </Button>
    </div>
  );
}
