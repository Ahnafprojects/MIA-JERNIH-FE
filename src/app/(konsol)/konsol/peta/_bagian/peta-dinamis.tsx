"use client";

/**
 * Pembungkus peta: pemuatan tertunda + jaring pengaman.
 *
 * 1. `next/dynamic` dengan `ssr: false`. MapLibre berukuran ratusan kilobyte
 *    dan menyentuh `window` saat dimuat; tanpa ini ia ikut ke paket awal
 *    halaman dan meledak saat render server.
 * 2. Batas galat. `<Map>` melempar saat WebGL tidak tersedia — mesin kantor
 *    tanpa akselerasi grafis, peramban dengan WebGL dimatikan, atau GPU yang
 *    masuk daftar blokir. Tanpa batas ini satu kegagalan itu memutihkan
 *    SELURUH halaman, termasuk daftar teks yang berisi data yang sama dan
 *    sebenarnya masih bisa dibaca. Peta boleh gagal; halamannya tidak.
 */

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PetaMeterProps } from "./peta-meter";

const Peta = dynamic(() => import("./peta-meter"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <p className="text-[13px] text-muted">Memuat peta jaringan…</p>
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

export default function PetaDinamis(props: PetaMeterProps) {
  return (
    <BatasGalat
      cadangan={
        <div className="grid h-full place-items-center px-6 py-10 text-center">
          <div>
            <p className="font-display font-bold">
              Peta tidak bisa ditampilkan
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted">
              Peramban ini tidak mendukung WebGL. Seluruh isi peta tetap
              tersedia sebagai daftar meter di bawah, lengkap dengan status dan
              koordinatnya.
            </p>
          </div>
        </div>
      }
    >
      <Peta {...props} />
    </BatasGalat>
  );
}
