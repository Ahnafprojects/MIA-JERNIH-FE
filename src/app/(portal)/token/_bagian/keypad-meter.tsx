import { HelpCircle } from "lucide-react";
import { MeterDevice } from "@/components/domain/meter-device";

export function KeypadMeter({
  kodeToken,
  saldoLiter,
  onTombol,
}: {
  kodeToken: string;
  saldoLiter: number;
  onTombol: (tombol: string) => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Simulasi Meter Fisik
      </h2>
      <p className="mt-1 text-xs text-muted">
        Anda juga dapat mengetik langsung pada keypad meter: tekan <strong>*</strong> &rarr; masukkan kode &rarr; tekan <strong>A</strong>.
      </p>

      <div className="mt-6 flex justify-center">
        <MeterDevice
          baris1={
            kodeToken ? `INPUT: ${kodeToken}` : `S=${saldoLiter.toFixed(2)}L  ON`
          }
          baris2={kodeToken ? "TEKAN A=KIRIM" : `D=0.0   V=${saldoLiter.toFixed(1)}`}
          relayAktif={saldoLiter ? saldoLiter > 0 : false}
          onTombol={onTombol}
        />
      </div>

      <div className="mt-6 rounded-[3px] border border-line bg-soft p-3 text-xs text-muted">
        <div className="flex items-center gap-1.5 font-semibold text-ink">
          <HelpCircle size={14} />
          <span>Petunjuk Keypad Meter:</span>
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[11px]">
          <li>Tombol <strong>*</strong>: Mengosongkan isian layar.</li>
          <li>Tombol <strong>0–9</strong>: Memasukkan digit kode token.</li>
          <li>Tombol <strong>D</strong>: Menghapus satu karakter terakhir (Backspace).</li>
          <li>Tombol <strong>A</strong>: Mengonfirmasi dan mengirimkan token (Enter).</li>
        </ul>
      </div>
    </div>
  );
}
