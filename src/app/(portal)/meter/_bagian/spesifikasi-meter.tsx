import { liter } from "@/lib/format";

export function SpesifikasiMeter({
  versiFirmware,
  volumeTotalL,
}: {
  versiFirmware?: string | null;
  volumeTotalL?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 font-mono text-xs text-muted">
      <div>
        <span>Versi Firmware:</span>
        <p className="font-bold text-ink">{versiFirmware ?? "2.1.4"}</p>
      </div>
      <div>
        <span>Volume Total Terukur:</span>
        <p className="font-bold text-ink">{liter(volumeTotalL ?? 8420.4, 1)}</p>
      </div>
      <div>
        <span>Kalibrasi Sensor:</span>
        <p className="font-bold text-ink">450 pulsa / Liter</p>
      </div>
      <div>
        <span>Kekuatan Sinyal:</span>
        <p className="font-bold text-success">-68 dBm (Kuat)</p>
      </div>
    </div>
  );
}
