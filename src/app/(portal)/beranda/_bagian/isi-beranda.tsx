import type { useBeranda } from "../_hooks/use-beranda";
import { BannerSaldo } from "./banner-saldo";
import { KepalaBeranda } from "./kepala-beranda";
import { KartuSaldo } from "./kartu-saldo";
import { KartuPemakaian } from "./kartu-pemakaian";
import { GrafikPemakaian } from "./grafik-pemakaian";
import { LcdLive } from "./lcd-live";
import { TokenCepat } from "./token-cepat";
import { StatusTelemetri } from "./status-telemetri";

export function IsiBeranda({ beranda }: { beranda: ReturnType<typeof useBeranda> }) {
  const meterAktif = beranda.meterAktif;
  if (!meterAktif) return null;

  return (
    <>
      {beranda.saldoMenipis ? <BannerSaldo saldo={beranda.saldoSekarang} /> : null}

      <KepalaBeranda
        nama={beranda.pengguna?.nama}
        nomorSeri={meterAktif.nomorSeri}
        zona={beranda.pengguna?.zonaId}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <KartuSaldo saldo={beranda.saldoSekarang} debitLpm={beranda.debitSekarang} />

          <KartuPemakaian totalHariIniL={beranda.totalHariIniL} />

          <GrafikPemakaian
            memuat={beranda.memuatPemakaian}
            labels={beranda.grafik7HariData.labels}
            deret={beranda.grafik7HariData.deret}
          />
        </div>

        <div className="space-y-6">
          <LcdLive
            saldo={beranda.saldoSekarang}
            debitLpm={beranda.debitSekarang}
            volumeTotalL={beranda.dataLive?.volumeTotalL}
            saklarOn={beranda.dataLive?.saklarOn}
          />

          <TokenCepat
            tokenInput={beranda.tokenInput}
            setTokenInput={beranda.setTokenInput}
            memuatTukar={beranda.memuatTukar}
            pesanTukar={beranda.pesanTukar}
            onTukar={beranda.handleTukarTokenCepat}
          />

          <StatusTelemetri ts={beranda.dataLive?.ts} />
        </div>
      </div>
    </>
  );
}
