import { AlertCircle } from "lucide-react";
import { LcdDisplay } from "@/components/domain/lcd";
import type { HasilGalat as HasilGalatData } from "../_tipe";

export function HasilGalat({ hasilGalat }: { hasilGalat: HasilGalatData }) {
  return (
    <div className="mt-6 rounded-[3px] border border-danger/40 bg-danger/10 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-danger">
        <AlertCircle size={16} />
        <span>TOKEN SALAH</span>
      </div>
      <p className="mt-1 text-xs text-danger">{hasilGalat.pesan}</p>
      <div className="mt-3">
        <LcdDisplay baris1={hasilGalat.lcdBaris1} baris2={hasilGalat.lcdBaris2} />
      </div>
    </div>
  );
}
