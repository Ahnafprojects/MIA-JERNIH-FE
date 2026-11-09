"use client";

import { Suspense } from "react";
import { useBeranda } from "./_hooks/use-beranda";
import { IsiBeranda } from "./_bagian/isi-beranda";
import { KerangkaBeranda } from "./_bagian/kerangka-beranda";
import LoadingBeranda from "./loading";

function KontenBeranda() {
  const beranda = useBeranda();

  if (beranda.memuat || !beranda.meterAktif) {
    return <KerangkaBeranda />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <IsiBeranda beranda={beranda} />
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
