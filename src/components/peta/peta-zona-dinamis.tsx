"use client";

/**
 * Pembungkus peta: pemuatan tertunda + jaring pengaman.
 *
 * Dua hal yang dikerjakan di sini, dan keduanya bukan hiasan:
 *
 * 1. `next/dynamic` dengan `ssr: false`. MapLibre berukuran ratusan kilobyte
 *    dan menyentuh `window` saat dimuat; tanpa ini ia ikut ke paket awal
 *    halaman dan meledak saat render server.
 * 2. Batas galat. `<Map>` melempar saat WebGL tidak tersedia — mesin kantor
 *    tanpa akselerasi grafis, peramban dengan WebGL dimatikan, atau GPU yang
 *    masuk daftar blokir. Tanpa batas ini satu kegagalan itu memutihkan
 *    SELURUH halaman status, termasuk daftar zona yang sebenarnya masih
 *    bisa dibaca. Peta boleh gagal; halamannya tidak.
 *
 *    Yang ditangkapnya BUKAN hanya WebGL — lemparan apa pun dari pohon peta
 *    berakhir di sini. Karena itu kalimat cadangannya tidak boleh memastikan
 *    sebabnya; `PesanPetaGagal` yang memeriksanya sendiri.
 */

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PetaZonaProps } from "./peta-zona";
import { PesanPetaGagal } from "./pesan-gagal";

const Peta = dynamic(() => import("./peta-zona"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center border-b border-line sm:h-[360px] lg:h-[440px]">
      <p className="text-[13px] text-muted">Memuat peta zona…</p>
    </div>
  ),
});

class BatasGalat extends Component<
  { children: ReactNode; cadangan: ReactNode },
  { gagal: boolean }
> {
  state = { gagal: false };

  static getDerivedStateFromError() {
    return { gagal: true };
  }

  render() {
    return this.state.gagal ? this.props.cadangan : this.props.children;
  }
}

export default function PetaZonaDinamis(props: PetaZonaProps) {
  return (
    <BatasGalat cadangan={<PesanPetaGagal />}>
      <Peta {...props} />
    </BatasGalat>
  );
}
