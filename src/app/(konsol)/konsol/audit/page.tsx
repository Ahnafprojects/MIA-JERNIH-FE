"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
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
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <span className="eyebrow text-brand-700 dark:text-accent">
          Jejak Akuntabilitas
        </span>
        <h1 className="font-display text-3xl font-bold">Audit Log</h1>
        <p className="mt-1 text-xs text-muted">
          Catatan hanya baca. Tidak ada tindakan yang disembunyikan, diubah,
          atau dihapus.
        </p>
      </div>
      <div className="flex gap-2">
        <select
          className="h-9 border border-line bg-surface px-2 text-xs"
          value={tipe}
          onChange={(e) => setTipe(e.target.value)}
        >
          <option value="">Semua tipe</option>
          {["RELAY", "TOKEN", "AKSES", "KONFIGURASI", "BROADCAST"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          className="h-9 border border-line bg-surface px-3 text-xs"
          placeholder="ID pengguna"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[54rem] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="p-3">Waktu</th>
              <th>Aktor</th>
              <th>Tipe</th>
              <th>Aksi</th>
              <th>Detail</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr className="border-b border-line" key={r.id}>
                <td className="p-3 font-mono">{tanggalJam(r.ts)}</td>
                <td>
                  {r.aktorNama}
                  <br />
                  <span className="text-muted">{r.aktorPeran || "—"}</span>
                </td>
                <td>
                  <Badge>{r.tipe}</Badge>
                </td>
                <td className="font-mono">{r.aksi}</td>
                <td className="max-w-md">{r.detail}</td>
                <td className="font-mono">{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
