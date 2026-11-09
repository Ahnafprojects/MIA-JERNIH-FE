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
          {/*
            Pudar tipis di tepi atas, BUKAN kabut selebar layar.

            Versi sebelumnya menutup seluruh pita atas dengan
            `bg-canvas/75 backdrop-blur-md`. Itu masuk akal saat kapsulnya
            masih merentang penuh, tetapi begitu ia dibatasi dan
            ditengahkan, kabutnya tinggal terbaca sebagai pita padat
            selebar layar dengan kapsul tertempel di tengahnya — persis
            kebalikan dari kesan mengambang.

            Sekarang yang memburamkan adalah kacanya sendiri. Yang tersisa
            di sini hanya pudar setinggi bilah supaya baris pertama isi
            halaman tidak menabrak tepi atas layar secara tajam.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-canvas/80 to-transparent"
          />

          {/*
            Kapsulnya DIBATASI lebarnya dan ditengahkan, bukan merentang
            sampai tepi layar.

            Versi sebelumnya hanya diberi padding 12–16px, jadi pada layar
            lebar kapsulnya ikut melar penuh dan isinya terlempar ke dua
            ujung: logo menempel di pojok kiri, tombol di pojok kanan, dan
            di antaranya pita kosong selebar setengah layar. Yang terbaca
            bukan "bilah navigasi" melainkan dua kelompok tombol yang
            kebetulan berbagi satu garis.

            Lebarnya SENGAJA berbeda dari isi halaman, yang memang dibuat
            merentang penuh sampai tepi jendela. Keduanya diminta terpisah,
            dan keduanya benar untuk tujuannya masing-masing: isi halaman
            memakai seluruh layar karena tabel dan grafiknya butuh ruang,
            sementara bilah navigasi dibatasi supaya isinya tidak terpisah
            sejauh mungkin dan tetap terbaca sebagai satu benda.
          */}
          <div className="relative mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
            <div /*
               * Kaca: latar separuh tembus + `backdrop-blur` DI KAPSULNYA
               * SENDIRI, bukan di lapisan terpisah di belakangnya.
               *
               * Opasitasnya ditahan di 72%, tidak lebih rendah. Di bawah
               * bilah ini bisa lewat foto hero yang gelap, dan teks `ink`
               * di atas kaca yang terlalu bening kehilangan kontrasnya
               * tepat saat bagian gelap itu tergulir lewat — kegagalan
               * yang hanya muncul pada sebagian halaman dan karena itu
               * gampang lolos dari pemeriksaan sekali lihat.
               *
               * `backdrop-saturate` dinaikkan sedikit supaya warna yang
               * lewat di baliknya tidak terbaca kelabu; tanpa itu kacanya
               * terlihat seperti plastik buram, bukan kaca.
               */
              className="flex h-14 items-center justify-between gap-3 rounded-full border border-white/50 bg-surface/72 px-4 shadow-[var(--kilau-tepi),var(--kedalaman-3)] backdrop-blur-xl backdrop-saturate-150 sm:px-5 dark:border-white/10">
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
