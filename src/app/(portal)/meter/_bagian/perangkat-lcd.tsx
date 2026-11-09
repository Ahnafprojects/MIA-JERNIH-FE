import { MeterDevice } from "@/components/domain/meter-device";

export function PerangkatLcd({
  saldo,
  saklarOn,
  debitLpm,
  volumeTotalL,
  relayAktif,
}: {
  saldo: number;
  saklarOn: boolean;
  debitLpm: number;
  volumeTotalL: number;
  relayAktif: boolean;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Layar Firmware Perangkat ESP32
      </h2>
      <p className="mt-1 text-xs text-muted">
        Cermin status sensor fisik real-time langsung dari lokasi meter air rumah Anda.
      </p>

      <div className="my-6 flex justify-center">
        <MeterDevice
          baris1={`S=${saldo.toFixed(2)}L  ${saklarOn ? "ON" : "OFF"}`}
          baris2={`D=${debitLpm.toFixed(1)}   V=${volumeTotalL.toFixed(1)}`}
          relayAktif={relayAktif}
          buzzer={saldo <= 2 ? "crit" : saldo <= 5 ? "warn" : "off"}
        />
      </div>
    </div>
  );
}
