"use client";

import { Suspense } from "react";
import { usePemakaian } from "./_hooks/use-pemakaian";
import { KepalaPemakaian } from "./_bagian/kepala-pemakaian";
import { KpiPemakaian } from "./_bagian/kpi-pemakaian";
import { KartuProyeksi } from "./_bagian/kartu-proyeksi";
import { KartuKomparasi } from "./_bagian/kartu-komparasi";
import { PetaPanas } from "./_bagian/peta-panas";
import { GrafikKonsumsi } from "./_bagian/grafik-konsumsi";
import { TipsHemat } from "./_bagian/tips-hemat";
import { KeadaanKosong } from "./_bagian/keadaan-kosong";

function KontenPemakaian() {
  const pemakaian = usePemakaian();

  if (!pemakaian.meterAktif) {
    return <KeadaanKosong />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <KepalaPemakaian />

      <KpiPemakaian kpi={pemakaian.kpi} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <KartuProyeksi sisaHariProyeksi={pemakaian.sisaHariProyeksi} />
        <KartuKomparasi
          rasioZonaPersen={pemakaian.kpi.rasioZonaPersen}
          rataRataHarianL={pemakaian.kpi.rataRataHarianL}
        />
      </div>

      <PetaPanas gridPetaPanas={pemakaian.gridPetaPanas} />

      <GrafikKonsumsi
        memuat={pemakaian.memuat}
        rentangGrafik={pemakaian.rentangGrafik}
        setRentangGrafik={pemakaian.setRentangGrafik}
        dataGrafik={pemakaian.dataGrafik}
      />

      <TipsHemat />
    </div>
  );
}

export default function HalamanPemakaian() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">Memuat pemakaian...</div>
      }
    >
      <KontenPemakaian />
    </Suspense>
  );
}
