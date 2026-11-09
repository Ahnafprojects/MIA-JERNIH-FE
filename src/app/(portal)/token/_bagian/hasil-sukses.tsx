import { CheckCircle2 } from "lucide-react";
import { liter } from "@/lib/format";
import { LcdDisplay } from "@/components/domain/lcd";
import type { HasilSukses as HasilSuksesData } from "../_tipe";

export function HasilSukses({
  hasilSukses,
  nomorSeri,
}: {
  hasilSukses: HasilSuksesData;
  nomorSeri?: string;
}) {
  return (
    <div className="mt-6 rounded-[3px] border border-success/40 bg-success/10 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-success">
        <CheckCircle2 size={16} />
        <span>TOKEN VALID (+{liter(hasilSukses.nilaiL, 0)})</span>
      </div>
      <p className="mt-1 text-xs text-ink">
        Saldo baru pada meter {nomorSeri}:{" "}
        <strong className="font-mono font-bold text-success">
          {liter(hasilSukses.saldoBaruL, 2)}
        </strong>
      </p>
      <div className="mt-3">
        <LcdDisplay
          baris1="TOKEN VALID"
          baris2={`+${hasilSukses.nilaiL}L  S=${hasilSukses.saldoBaruL.toFixed(1)}L`}
        />
      </div>
    </div>
  );
}
