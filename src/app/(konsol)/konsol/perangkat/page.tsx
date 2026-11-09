"use client";

import React from "react";
import { Panel } from "@/components/ui/card";
import { Muncul } from "@/components/ui/muncul";
import { usePerangkat } from "./_hooks/use-perangkat";
import { KpiPerangkat } from "./_bagian/kpi-perangkat";
import { TabelArmada } from "./_bagian/tabel-armada";
import { PanelKonfigurasi } from "./_bagian/panel-konfigurasi";
import { PerluPerhatian } from "./_bagian/perlu-perhatian";

export default function HalamanPerangkat() {
  const p = usePerangkat();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Armada jaringan</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Perangkat &amp; Meter
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Konfigurasi massal dan status armada meter. Perubahan konfigurasi
          wajib disertai alasan dan tercatat di audit log.
        </p>
      </header>

      <KpiPerangkat kpi={p.kpi} />

      <Muncul>
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel judul="Armada Meter" sub="Pilih meter untuk konfigurasi massal" isiClassName="p-0">
            <TabelArmada rows={p.rows} ids={p.ids} setIds={p.setIds} />
          </Panel>

          <Panel judul="Konfigurasi Meter" sub="Dikirim ke meter terpilih">
            <PanelKonfigurasi
              versi={p.versi}
              form={p.form}
              setForm={p.setForm}
              ids={p.ids}
              kirim={p.kirim}
            />
          </Panel>
        </div>
      </Muncul>

      <Muncul>
        <PerluPerhatian perhatian={p.perhatian} />
      </Muncul>
    </main>
  );
}
