import { LcdDisplay } from "@/components/domain/lcd";

export function LcdLive({
  saldo,
  debitLpm,
  volumeTotalL,
  saklarOn,
}: {
  saldo: number;
  debitLpm: number;
  volumeTotalL: number | undefined;
  saklarOn: boolean | undefined;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow text-muted">Layar LCD Fisik Meter</span>
        <span className="font-mono text-[10px] text-muted">HD44780 16×2</span>
      </div>

      <LcdDisplay
        baris1={`S=${saldo.toFixed(2)}L  ${saklarOn !== false ? "ON" : "OFF"}`}
        baris2={`D=${debitLpm.toFixed(1)}   V=${(volumeTotalL ?? 8420.4).toFixed(1)}`}
      />

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Layar ini disinkronkan secara presisi dengan tampilan LCD pada fisik
        perangkat ESP32 di lokasi meter air Anda.
      </p>
    </div>
  );
}
