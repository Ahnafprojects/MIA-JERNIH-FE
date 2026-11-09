"use client";

import Link from "next/link";
import { Suspense } from "react";
import { MerekJernih } from "@/components/layout/logo";
import { PenjagaRute } from "@/lib/penjaga-rute";
import { TransisiHalaman } from "@/components/ui/transisi-halaman";
import {
  NavPortal,
  MenuLayarPenuh,
  TombolNotifikasi,
  AvatarMenu,
} from "./_nav-portal";

export default function LayoutPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PenjagaRute peranDiizinkan={["WARGA"]}>
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        {/*
          Bilah atas MENGAMBANG: kapsul dengan jarak merata dari keempat
          sisinya, bukan pita yang menempel ke tepi layar.

          Pembungkusnya yang lengket, bukan kapsulnya. Kalau kapsulnya
          sendiri yang diberi `sticky`, jarak atasnya ikut tergulir dan
          kapsul itu akhirnya menempel persis di tepi — justru kehilangan
          sifat mengambang yang diinginkan tepat ketika halaman digulir.

          Lapisan kabut di belakangnya menutup celah antara tepi layar dan
          kapsul. Tanpa itu, isi halaman terlihat tajam menyelinap di sela
          kiri-kanan dan di bawah kapsul saat digulir — kapsulnya berhenti
          terbaca melayang di atas halaman dan mulai terbaca seperti
          potongan yang tertinggal.
        */}
        <header className="sticky top-0 z-40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-canvas/75 backdrop-blur-md"
          />

          <div className="relative px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex h-14 items-center justify-between gap-3 rounded-full border border-line bg-surface px-3 shadow-[var(--kilau-tepi),var(--kedalaman-3)] sm:px-4">
              <div className="flex min-w-0 items-center gap-5">
                <Link href="/beranda" className="flex items-center">
                  <MerekJernih sub="Portal warga" />
                </Link>

                <nav aria-label="Navigasi utama" className="hidden lg:block">
                  <Suspense fallback={null}>
                    <NavPortal />
                  </Suspense>
                </nav>
              </div>

              {/*
                Tiga kendali, masing-masing berdiri sendiri: hamburger (hanya
                layar kecil), notifikasi, dan profil. Pemilih meter sudah
                pindah ke kartu saldo di beranda, dan tombol tema masuk ke
                dalam menu profil.
              */}
              <div className="flex shrink-0 items-center gap-2">
                <Suspense fallback={null}>
                  <TombolNotifikasi />
                </Suspense>

                <Suspense fallback={null}>
                  <AvatarMenu />
                </Suspense>

                <Suspense fallback={null}>
                  <MenuLayarPenuh />
                </Suspense>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <TransisiHalaman>{children}</TransisiHalaman>
        </main>
      </div>
    </PenjagaRute>
  );
}
