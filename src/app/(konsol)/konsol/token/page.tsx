"use client";

import React from "react";
import { Panel } from "@/components/ui/card";
import { Muncul } from "@/components/ui/muncul";
import { useTokenKonsol } from "./_hooks/use-token-konsol";
import { KpiToken } from "./_bagian/kpi-token";
import { FormPenerbit } from "./_bagian/form-penerbit";
import { HasilToken } from "./_bagian/hasil-token";
import { TabelToken } from "./_bagian/tabel-token";

export default function HalamanTokenKonsol() {
  const t = useTokenKonsol();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Operasional token</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Token Operasional
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Terbitkan token air dan pantau peredarannya. Kode utuh hanya tampil
          sekali di sini dan wajib disalin saat itu juga.
        </p>
      </header>

      <KpiToken kpi={t.kpi} />

      <Muncul>
        <Panel judul="Penerbit Token" sub="Kode tampil sekali setelah diterbitkan">
          <FormPenerbit
            nilaiL={t.nilaiL}
            setNilaiL={t.setNilaiL}
            jumlah={t.jumlah}
            setJumlah={t.setJumlah}
            meterId={t.meterId}
            setMeterId={t.setMeterId}
            alasan={t.alasan}
            setAlasan={t.setAlasan}
            loading={t.loading}
            galat={t.galat}
            onTerbitkan={t.generate}
          />
        </Panel>
      </Muncul>

      {t.hasil.length > 0 ? <HasilToken hasil={t.hasil} onCsv={t.csv} /> : null}

      <Muncul>
        <Panel judul="Riwayat Token" sub="Terakhir terbit" isiClassName="p-0">
          <TabelToken rows={t.rows} filter={t.filter} setFilter={t.setFilter} />
        </Panel>
      </Muncul>
    </main>
  );
}
