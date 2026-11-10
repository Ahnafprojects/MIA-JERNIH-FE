"use client";

import { useLaporan } from "./_hooks/use-laporan";
import { PapanKanban } from "./_bagian/papan-kanban";

export default function HalamanLaporan() {
  const lap = useLaporan();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Antrean layanan</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Laporan Pelanggan
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Perubahan status di sini memengaruhi rapor layanan publik.
        </p>
      </header>

      {lap.pesanGalat ? (
        <p
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-3 text-xs font-medium text-danger"
        >
          {lap.pesanGalat}
        </p>
      ) : null}

      {lap.memuat ? (
        <p className="text-xs text-muted">Memuat antrean laporan...</p>
      ) : (
        <PapanKanban tiket={lap.tiket} aksiId={lap.aksiId} onUbahStatus={lap.ubahStatus} />
      )}
    </main>
  );
}
