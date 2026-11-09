"use client";

import React from "react";
import { Panel } from "@/components/ui/card";
import { Muncul } from "@/components/ui/muncul";
import { useInsiden } from "./_hooks/use-insiden";
import { PenyaringInsiden } from "./_bagian/penyaring-insiden";
import { DaftarInsiden } from "./_bagian/daftar-insiden";
import { PanelDetailInsiden } from "./_bagian/panel-detail-insiden";

export default function HalamanInsiden() {
  const ins = useInsiden();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Gangguan &amp; alarm</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Insiden &amp; Alarm
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Pantau laporan gangguan dan ubah statusnya. Setiap perubahan status
          tercatat di audit log.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <Muncul>
          <Panel isiClassName="p-0" className="self-start">
            <PenyaringInsiden status={ins.status} setStatus={ins.setStatus} />
            <DaftarInsiden
              rows={ins.rows}
              selectedId={ins.selected?.id ?? null}
              onPilih={ins.setSelected}
            />
          </Panel>
        </Muncul>

        <Muncul>
          <Panel isiClassName="p-0">
            <PanelDetailInsiden selected={ins.selected} update={ins.update} />
          </Panel>
        </Muncul>
      </div>
    </main>
  );
}
