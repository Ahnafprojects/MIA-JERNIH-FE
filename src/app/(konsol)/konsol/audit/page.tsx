"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { Tabel, type Kolom } from "@/components/ui/tabel";
interface Row {
  id: string;
  aktorNama: string;
  aktorPeran: string | null;
  aksi: string;
  detail: string;
  tipe: string;
  ip: string;
  ts: string;
}
export default function HalamanAudit() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tipe, setTipe] = useState("");
  const [user, setUser] = useState("");
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      (async () => {
        const q = new URLSearchParams({ perPage: "50" });
        if (tipe) q.set("tipe", tipe);
        if (user) q.set("user", user);
        try {
          const r = await api<{ rows: Row[] }>(`/api/admin/audit?${q}`);
          if (active) setRows(r.rows);
        } catch {
          if (active) setRows([]);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [tipe, user]);

  const kolom: Kolom<Row>[] = [
    {
      kunci: "waktu",
      label: "Waktu",
      render: (r) => <span className="font-mono text-xs">{tanggalJam(r.ts)}</span>,
    },
    {
      kunci: "aktor",
      label: "Aktor",
      render: (r) => (
        <span className="text-xs">
          <span className="text-ink">{r.aktorNama}</span>
          <br />
          <span className="text-muted">{r.aktorPeran || "—"}</span>
        </span>
      ),
    },
    {
      kunci: "tipe",
      label: "Tipe",
      render: (r) => <Badge>{r.tipe}</Badge>,
    },
    {
      kunci: "aksi",
      label: "Aksi",
      render: (r) => <span className="font-mono text-xs">{r.aksi}</span>,
    },
    {
      kunci: "detail",
      label: "Detail",
      render: (r) => <span className="block max-w-md text-xs text-muted">{r.detail}</span>,
    },
    {
      kunci: "ip",
      label: "IP",
      sembunyiKecil: true,
      render: (r) => <span className="font-mono text-xs text-muted">{r.ip}</span>,
    },
  ];

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

      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-input border border-line bg-surface px-2 text-xs text-ink outline-none focus:border-brand-600"
          value={tipe}
          onChange={(e) => setTipe(e.target.value)}
        >
          <option value="">Semua tipe</option>
          {["RELAY", "TOKEN", "AKSES", "KONFIGURASI", "BROADCAST"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          className="h-9 rounded-input border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand-600"
          placeholder="ID pengguna"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </div>

      <Panel isiClassName="p-0">
        <Tabel
          kolom={kolom}
          data={rows}
          kunciBaris={(r) => r.id}
          kosong={<p className="py-10 text-center text-xs text-muted">Belum ada catatan audit.</p>}
          lebarMin="54rem"
        />
      </Panel>
    </main>
  );
}
