"use client";

import { Suspense } from "react";
import { useBeranda } from "./_hooks/use-beranda";
import { BannerSaldo } from "./_bagian/banner-saldo";
import { KepalaBeranda } from "./_bagian/kepala-beranda";
import { KartuSaldo } from "./_bagian/kartu-saldo";
import { KartuPemakaian } from "./_bagian/kartu-pemakaian";
import { TargetHemat } from "./_bagian/target-hemat";
import { GrafikPemakaian } from "./_bagian/grafik-pemakaian";
import { AktivitasTerakhir } from "./_bagian/aktivitas-terakhir";
import { LcdLive } from "./_bagian/lcd-live";
import { TokenCepat } from "./_bagian/token-cepat";
import { InfoPdam } from "./_bagian/info-pdam";
import LoadingBeranda from "./loading";

/*
 * Isi halaman mengikuti tepi jendela — TIDAK dibatasi `max-w-6xl`.
 *
 * Pembatas itu menyisakan pita kosong di kiri dan kanan pada layar laptop,
 * dan kartu-kartunya terbaca mengambang di tengah bidang yang tidak dipakai.
 * Padding dinaikkan bertahap supaya isinya tetap tidak menempel di tepi.
 */
const PEMBUNGKUS = "space-y-6 px-4 py-8 sm:px-6 lg:px-8";

function KontenBeranda() {
  const beranda = useBeranda();

  if (beranda.memuat || !beranda.meterAktif) {
    return (
      <div className={PEMBUNGKUS}>
        <div className="h-8 w-48 animate-pulse rounded-card bg-soft" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-card bg-soft lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-card bg-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className={PEMBUNGKUS}>
      {beranda.saldoMenipis ? (
        <BannerSaldo saldo={beranda.saldoSekarang} />
      ) : null}

      <KepalaBeranda
        nama={beranda.pengguna?.nama}
        tanggalPanjang={beranda.tanggalPanjang}
        sapaanSekarang={beranda.sapaanSekarang}
        labelMeter={beranda.labelMeter}
        alamatMeter={beranda.alamatMeter}
        zonaMeter={beranda.zonaMeter}
      />

      <KartuSaldo
        saldo={beranda.saldoSekarang}
        debitLpm={beranda.debitSekarang}
        acuanBolaL={beranda.acuanBolaL}
        targetBulanL={beranda.targetBulanL}
        targetHarianL={beranda.targetHarianL}
        saldoMenipis={beranda.saldoMenipis}
        luring={beranda.luring}
      />

      <KartuPemakaian
        totalHariIniL={beranda.totalHariIniL}
        totalBulanL={beranda.totalBulanL}
        targetHarianL={beranda.targetHarianL}
        biayaBulanRp={beranda.biayaBulanRp}
        namaBulan={beranda.namaBulan}
      />

      {/* Tanpa rata-rata tidak ada target yang bisa diukur — kartunya tidak
          digambar sama sekali, alih-alih menampilkan 0% yang tidak berarti. */}
      {beranda.targetHarianL > 0 ? (
        <TargetHemat
          totalBulanL={beranda.totalBulanL}
          targetBulanL={beranda.targetBulanL}
          melebihiTarget={beranda.melebihiTarget}
          namaBulan={beranda.namaBulan}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GrafikPemakaian
            memuat={beranda.memuatPemakaian}
            data={beranda.grafik7Hari}
            targetHarianL={beranda.targetHarianL}
          />

          <AktivitasTerakhir transaksi={beranda.transaksi} />
        </div>

        <div className="space-y-6">
          <LcdLive
            saldo={beranda.saldoSekarang}
            debitLpm={beranda.debitSekarang}
            volumeTotalL={beranda.dataLive?.volumeTotalL}
            saklarOn={beranda.dataLive?.saklarOn}
            relay={beranda.dataLive?.relay}
            ts={beranda.dataLive?.ts}
            labelMeter={beranda.labelMeter}
            serialMeter={beranda.serialMeter}
            luring={beranda.luring}
          />

          <TokenCepat
            tokenInput={beranda.tokenInput}
            setTokenInput={beranda.setTokenInput}
            memuatTukar={beranda.memuatTukar}
            pesanTukar={beranda.pesanTukar}
            onTukar={beranda.handleTukarTokenCepat}
          />

          <InfoPdam notifikasi={beranda.notifikasi} />
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
