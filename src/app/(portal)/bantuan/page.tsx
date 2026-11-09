"use client";

import { Suspense } from "react";
import { useBantuan } from "./_hooks/use-bantuan";
import { TabBantuan } from "./_bagian/tab-bantuan";
import { IsiBantuan } from "./_bagian/isi-bantuan";

function KontenBantuan() {
  const bantuan = useBantuan();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Layanan Pelanggan & Aduan
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Bantuan & Pengaduan
          </h1>
          <p className="mt-1 text-xs text-muted text-balance">
            Lapor gangguan saluran air, pantau kepatuhan SLA teknisi, dan lacak tindak lanjut secara terbuka.
          </p>
        </div>

        <TabBantuan
          tabAktif={bantuan.tabAktif}
          setTabAktif={bantuan.setTabAktif}
          jumlahTiket={bantuan.daftarTiketSaya.length}
        />
      </div>

      <IsiBantuan bantuan={bantuan} />
    </div>
  );
}

export default function HalamanBantuan() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">Memuat bantuan...</div>
      }
    >
      <KontenBantuan />
    </Suspense>
  );
}
