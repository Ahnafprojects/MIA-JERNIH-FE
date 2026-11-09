"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeadaanKosong } from "@/components/ui/keadaan";
import { usePemakaian } from "./_hooks/use-pemakaian";
import { KepalaPemakaian } from "./_bagian/kepala-pemakaian";
import { KpiPemakaian } from "./_bagian/kpi-pemakaian";
import { KartuProyeksi } from "./_bagian/kartu-proyeksi";
import { KartuKomparasi } from "./_bagian/kartu-komparasi";
import { PetaPanas } from "./_bagian/peta-panas";
import { LegendaPanas } from "./_bagian/legenda-panas";
import { GrafikKonsumsi } from "./_bagian/grafik-konsumsi";
import { TipsHemat } from "./_bagian/tips-hemat";

function KontenPemakaian() {
  const pemakaian = usePemakaian();

  if (!pemakaian.meterAktif) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <KeadaanKosong
          judul="Meter Belum Terhubung"
          pesan="Sambungkan meter fisik Anda terlebih dahulu untuk melihat catatan konsumsi air."
          aksi={
            <Link href="/hubungkan-meter">
              <Button varian="utama">Hubungkan Meter Sekarang</Button>
            </Link>
          }
        />
      </div>
    );
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

      <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Peta Panas Pemakaian (7 Hari × 24 Jam)
            </h2>
            <p className="text-xs text-muted">
              Warna menunjukkan volume air per jam. Bergulir mendatar untuk
              melihat jam lengkap di ponsel.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Info size={13} />
            <span>Pembaruan tiap pergantian jam</span>
          </div>
        </div>

        <PetaPanas gridPetaPanas={pemakaian.gridPetaPanas} />

        <LegendaPanas />
      </div>

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
