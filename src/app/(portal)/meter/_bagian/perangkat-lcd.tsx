import { MeterDevice } from "@/components/domain/meter-device";

export function PerangkatLcd({
  saldo,
  saklarOn,
  debitLpm,
  volumeTotalL,
  relayAktif,
}: {
  /** `null` = server belum mengirim nilainya. Layar menulis garis, bukan angka. */
  saldo: number | null;
  saklarOn: boolean;
  debitLpm: number | null;
  volumeTotalL: number | null;
  relayAktif: boolean;
}) {
  /*
   * Nilai yang belum diketahui ditulis sebagai garis, seperti layar meter
   * sungguhan sebelum sensornya melapor. Sebelumnya halaman ini mengisi
   * kekosongan dengan angka karangan (volume `8420.4`), yang tergambar di
   * layar tiruan seolah dibaca dari perangkat.
   */
  const s = saldo !== null ? saldo.toFixed(2) : "----";
  const dbt = debitLpm !== null ? debitLpm.toFixed(1) : "--";
  const v = volumeTotalL !== null ? volumeTotalL.toFixed(1) : "----";

  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Layar Meter Air
      </h2>
      <p className="mt-1 text-xs text-muted">
        Cermin status sensor fisik real-time langsung dari lokasi meter air rumah Anda.
      </p>

      <div className="my-6 flex justify-center">
        <MeterDevice
          baris1={`S=${s}L  ${saklarOn ? "ON" : "OFF"}`}
          baris2={`D=${dbt}   V=${v}`}
          relayAktif={relayAktif}
          buzzer={
            saldo === null ? "off" : saldo <= 2 ? "crit" : saldo <= 5 ? "warn" : "off"
          }
        />
      </div>
    </div>
  );
}
