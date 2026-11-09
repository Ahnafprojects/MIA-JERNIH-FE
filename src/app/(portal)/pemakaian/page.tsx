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
import { GrafikProyeksi } from "./_bagian/grafik-proyeksi";
import { KartuJamBoros } from "./_bagian/jam-boros";
import { PetaPanas } from "./_bagian/peta-panas";
import { LegendaPanas } from "./_bagian/legenda-panas";
import { GrafikKonsumsi } from "./_bagian/grafik-konsumsi";
import { TipsHemat } from "./_bagian/tips-hemat";

function KontenPemakaian() {
  const pemakaian = usePemakaian();

  if (!pemakaian.meterAktif) {
    return (
      <div className="px-4 py-16 text-center">
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

  /* Isi halaman mengikuti tepi jendela — tanpa `mx-auto max-w-6xl`. Pita
     kosong di kiri-kanan pada layar lebar sudah ditolak pemilik repo. */
  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <KepalaPemakaian />

      <KpiPemakaian kpi={pemakaian.kpi} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <KartuProyeksi sisaHariProyeksi={pemakaian.sisaHariProyeksi} />
        <KartuKomparasi
          lebihBoros={pemakaian.lebihBoros}
          selisihZonaPersen={pemakaian.selisihZonaPersen}
          rataRataHarianL={pemakaian.kpi.rataRataHarianL}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GrafikProyeksi
          proyeksiSaldo={pemakaian.proyeksiSaldo}
          sisaHariProyeksi={pemakaian.sisaHariProyeksi}
          rataRataHarianL={pemakaian.kpi.rataRataHarianL}
        />
        <KartuJamBoros jamPalingBoros={pemakaian.jamPalingBoros} />
      </div>

      <div className="permukaan p-6">
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

          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
            <Info size={13} />
            <span className="whitespace-nowrap">
              Pembaruan tiap pergantian jam
            </span>
          </div>
        </div>

        <PetaPanas gridPetaPanas={pemakaian.gridPetaPanas} />

        <LegendaPanas />
      </div>

      <GrafikKonsumsi
        memuat={pemakaian.memuat}
        modeGrafik={pemakaian.modeGrafik}
        setModeGrafik={pemakaian.setModeGrafik}
        mulaiPilih={pemakaian.mulaiPilih}
        setMulaiPilih={pemakaian.setMulaiPilih}
        akhirPilih={pemakaian.akhirPilih}
        setAkhirPilih={pemakaian.setAkhirPilih}
        jangkauanData={pemakaian.jangkauanData}
        dataGrafik={pemakaian.dataGrafik}
      />

      <TipsHemat jamPalingBoros={pemakaian.jamPalingBoros} />
    </div>
  );
}

export default function HalamanPemakaian() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">
          Memuat pemakaian...
        </div>
      }
    >
      <KontenPemakaian />
    </Suspense>
  );
}
