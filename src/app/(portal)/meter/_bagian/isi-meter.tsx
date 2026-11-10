import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { useMeter } from "../_hooks/use-meter";
import { PerangkatLcd } from "./perangkat-lcd";
import { SpesifikasiMeter } from "./spesifikasi-meter";
import { StatusAlarm } from "./status-alarm";
import { KontrolAliran } from "./kontrol-aliran";
import { DeteksiKebocoran } from "./deteksi-kebocoran";
import { LogMeter } from "./log-meter";
import { DialogRelay } from "./dialog-relay";
import { IsiOtomatis } from "./isi-otomatis";

export function IsiMeter({ meter }: { meter: ReturnType<typeof useMeter> }) {
  const meterAktif = meter.meterAktif;
  if (!meterAktif) return null;

  const saldo = meter.meterDetail?.saldoL ?? meterAktif.saldoLiter;
  const isDaring = meter.meterDetail?.daring !== false;
  const saklarOn = meter.meterDetail?.saklarOn !== false;
  const relayAktif = meter.meterDetail?.relay === "AKTIF";

  return (
    <>
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Telemetri & Kontrol Perangkat
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Meter Saya: {meter.meterDetail?.serial ?? meterAktif.nomorSeri}
          </h1>
          <p className="mt-1 text-xs text-muted">
            ID Perangkat: <strong className="font-mono text-ink">{meterAktif.id}</strong> &middot; Zona {meter.meterDetail?.zona ?? "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDaring ? (
            <Badge nada="sukses" titik>
              <Wifi size={13} className="mr-1" />
              Perangkat Daring
            </Badge>
          ) : (
            <Badge nada="bahaya" titik>
              <WifiOff size={13} className="mr-1" />
              Perangkat Terputus (Offline)
            </Badge>
          )}
        </div>
      </div>

      {meter.pesanAksi ? (
        <aside
          role="alert"
          className={`rounded-[3px] border p-3.5 text-xs font-medium ${
            meter.pesanAksi.tipe === "sukses"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {meter.pesanAksi.teks}
        </aside>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <PerangkatLcd
              saldo={saldo}
              saklarOn={saklarOn}
              debitLpm={meter.meterDetail?.debitLpm ?? null}
              volumeTotalL={meter.meterDetail?.volumeTotalL ?? null}
              relayAktif={relayAktif}
            />
            <SpesifikasiMeter volumeTotalL={meter.meterDetail?.volumeTotalL} />
          </div>

          <StatusAlarm statusAlarm={meter.statusAlarm} />
        </div>

        <div className="space-y-6">
          <KontrolAliran
            saklarOn={saklarOn}
            relayAktif={relayAktif}
            isDaring={isDaring}
            /* Saldo yang belum diketahui mengunci tombol buka, sama
               seperti saldo habis: katup tidak boleh dibuka berdasarkan
               tebakan. */
            saldo={saldo ?? 0}
            onBuka={() => {
              meter.setModalRelay("buka");
              meter.setAlasanRelay("");
            }}
            onTutup={() => {
              meter.setModalRelay("tutup");
              meter.setAlasanRelay("");
            }}
          />

          <IsiOtomatis meterId={meterAktif.id} />

          <DeteksiKebocoran dataDeteksiKebocoran={meter.dataDeteksiKebocoran} />

          <LogMeter logList={meter.logList} />
        </div>
      </div>

      <DialogRelay
        modalRelay={meter.modalRelay}
        alasanRelay={meter.alasanRelay}
        setAlasanRelay={meter.setAlasanRelay}
        memuatAksi={meter.memuatAksi}
        onTutup={() => meter.setModalRelay(null)}
        onEksekusi={meter.handleEksekusiRelay}
      />
    </>
  );
}
