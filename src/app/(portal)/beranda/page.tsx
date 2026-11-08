"use client";

import { Suspense } from "react";
import { useBeranda } from "./_hooks/use-beranda";
import { BannerSaldo } from "./_bagian/banner-saldo";
import { KepalaBeranda } from "./_bagian/kepala-beranda";
import { KartuSaldo } from "./_bagian/kartu-saldo";
import { KartuPemakaian } from "./_bagian/kartu-pemakaian";
import { GrafikPemakaian } from "./_bagian/grafik-pemakaian";
import { LcdLive } from "./_bagian/lcd-live";
import { TokenCepat } from "./_bagian/token-cepat";
import { StatusTelemetri } from "./_bagian/status-telemetri";
import LoadingBeranda from "./loading";

function KontenBeranda() {
  const beranda = useBeranda();

  if (beranda.memuat || !beranda.meterAktif) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-[3px] bg-soft" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-[3px] bg-soft lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-[3px] bg-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {beranda.saldoMenipis ? (
        <BannerSaldo saldo={beranda.saldoSekarang} />
      ) : null}

      <KepalaBeranda
        nama={beranda.pengguna?.nama}
        nomorSeri={beranda.meterAktif.nomorSeri}
        zona={beranda.pengguna?.zonaId}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <KartuSaldo
            saldo={beranda.saldoSekarang}
            debitLpm={beranda.debitSekarang}
          />

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
    </div>
  );
}

export default function HalamanBeranda() {
  return (
    <Suspense fallback={<LoadingBeranda />}>
      <KontenBeranda />
    </Suspense>
  );
}
