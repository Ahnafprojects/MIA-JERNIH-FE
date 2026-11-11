"use client";

import { usePengaturan } from "./_hooks/use-pengaturan";
import { TabPengaturanNav } from "./_bagian/tab-pengaturan";
import { PanelTim } from "./_bagian/panel-tim";
import { PanelTarif } from "./_bagian/panel-tarif";
import { PanelSandi } from "./_bagian/panel-sandi";
import { PanelKunciNilai } from "./_bagian/panel-kunci-nilai";

export default function HalamanPengaturan() {
  const p = usePengaturan();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Preferensi konsol</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Pengaturan
        </h1>
      </header>

      <TabPengaturanNav tabs={p.tabs} tabAktif={p.tabAktif} onPilih={p.setTab} />

      {p.supervisor && p.tabAktif === "tim" && <PanelTim members={p.members} />}
      {p.supervisor && p.tabAktif === "tarif" && <PanelTarif golongan={p.golongan} />}

      {p.tabAktif === "sandi" && (
        <PanelSandi
          sandiLama={p.sandiLama}
          setSandiLama={p.setSandiLama}
          sandiBaru={p.sandiBaru}
          setSandiBaru={p.setSandiBaru}
          sandiUlang={p.sandiUlang}
          setSandiUlang={p.setSandiUlang}
          kirim={p.kirimSandi}
          hasil={p.hasilSandi}
          onSubmit={p.gantiSandi}
        />
      )}

      {p.tabAktif === "keamanan" && (
        <PanelKunciNilai
          nilai={p.security}
          setNilai={p.setSecurity}
          bisaSimpan={p.supervisor}
          onSimpan={() => p.save("/api/admin/pengaturan/keamanan", p.security)}
        />
      )}

      {p.tabAktif === "notifikasi" && (
        <PanelKunciNilai
          nilai={p.notif}
          setNilai={p.setNotif}
          bisaSimpan={p.supervisor}
          onSimpan={() => p.save("/api/admin/pengaturan/notifikasi", p.notif)}
        />
      )}
    </main>
  );
}
