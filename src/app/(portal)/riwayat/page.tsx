"use client";

import { Suspense } from "react";
import { useRiwayat } from "./_hooks/use-riwayat";
import { KepalaRiwayat } from "./_bagian/kepala-riwayat";
import { IsiRiwayat } from "./_bagian/isi-riwayat";

function KontenRiwayat() {
  const riwayat = useRiwayat();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <KepalaRiwayat />
      <IsiRiwayat riwayat={riwayat} />
    </div>
  );
}

export default function HalamanRiwayat() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">Memuat riwayat...</div>
      }
    >
      <KontenRiwayat />
    </Suspense>
  );
}
