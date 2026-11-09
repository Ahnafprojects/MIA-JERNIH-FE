import { QrCode, Keyboard } from "lucide-react";
import type { Metode } from "../_tipe";

export function PemilihMetode({
  metode,
  onPilih,
}: {
  metode: Metode;
  onPilih: (m: Metode) => void;
}) {
  return (
    <div className="mb-6 flex rounded-[3px] border border-line bg-soft p-1">
      <button
        type="button"
        onClick={() => onPilih("ketik")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[2px] py-2 text-xs font-semibold transition-colors ${
          metode === "ketik" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        <Keyboard size={15} />
        <span>Ketik ID Pelanggan</span>
      </button>
      <button
        type="button"
        onClick={() => onPilih("pindai")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[2px] py-2 text-xs font-semibold transition-colors ${
          metode === "pindai" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        <QrCode size={15} />
        <span>Pindai QR Meter</span>
      </button>
    </div>
  );
}
