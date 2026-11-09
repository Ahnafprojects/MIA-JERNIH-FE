"use client";

/**
 * Pembungkus peta titik gangguan: pemuatan tertunda + jaring pengaman.
 *
 * 1. `next/dynamic` dengan `ssr: false`. MapLibre berukuran ratusan kilobyte
 *    dan menyentuh `window` saat dimuat; tanpa ini ia ikut ke paket awal
 *    halaman dan meledak saat render server.
 * 2. Batas galat. `<Map>` melempar saat WebGL tidak tersedia — mesin kantor
 *    tanpa akselerasi grafis, peramban dengan WebGL dimatikan, atau GPU yang
 *    masuk daftar blokir. Tanpa batas ini satu kegagalan itu memutihkan
 *    SELURUH halaman bantuan, termasuk formulir pengaduan yang sebenarnya
 *    masih bisa dikirim. Peta boleh gagal; laporannya tidak.
 *
 * Mengikuti pola yang sudah dipakai peta konsol dan peta zona publik, supaya
 * ketiga peta di produk ini gagal dengan cara yang sama.
 */

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { PesanPetaGagal } from "@/components/peta/pesan-gagal";
import type { PetaTitikProps } from "./peta-titik";

const Peta = dynamic(() => import("./peta-titik"), {
  ssr: false,
  loading: () => (
    <div className="grid h-64 place-items-center rounded-card border border-line shadow-[var(--cekung-dalam)] sm:h-72">
      <p className="text-[13px] text-muted">Memuat peta…</p>
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

export function PetaTitikDinamis(props: PetaTitikProps) {
  return (
    <BatasGalat
      cadangan={
        <div className="grid h-64 place-items-center rounded-card border border-line p-4 shadow-[var(--cekung-dalam)] sm:h-72">
          <PesanPetaGagal sisa="koordinat dan tombol lokasi di bawah peta" />
        </div>
      }
    >
      <Peta {...props} />
    </BatasGalat>
  );
}
