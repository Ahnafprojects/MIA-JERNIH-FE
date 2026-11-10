"use client";

import { useAudit } from "./_hooks/use-audit";
import { PenyaringAudit } from "./_bagian/penyaring-audit";
import { TabelAudit } from "./_bagian/tabel-audit";

export default function HalamanAudit() {
  const audit = useAudit();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Jejak Akuntabilitas</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Audit Log
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Catatan hanya baca. Tidak ada tindakan yang disembunyikan, diubah,
          atau dihapus.
        </p>
      </header>

      <PenyaringAudit
        tipe={audit.tipe}
        setTipe={audit.setTipe}
        user={audit.user}
        setUser={audit.setUser}
      />
      <TabelAudit rows={audit.rows} />
    </main>
  );
}
