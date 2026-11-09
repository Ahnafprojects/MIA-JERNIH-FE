"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMeter } from "./_hooks/use-meter";
import { IsiMeter } from "./_bagian/isi-meter";

function KontenMeter() {
  const meter = useMeter();

  if (!meter.meterAktif) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-xs text-muted">Meter air belum terhubung ke akun Anda.</p>
        <Link href="/hubungkan-meter" className="mt-4 inline-block">
          <Button varian="utama">Hubungkan Meter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <IsiMeter meter={meter} />
    </div>
  );
}

export default function HalamanMeterSaya() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">Memuat status meter...</div>
      }
    >
      <KontenMeter />
    </Suspense>
  );
}
