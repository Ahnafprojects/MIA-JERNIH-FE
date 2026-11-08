"use client";
import React, { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
interface I {
  id: string;
  tipe: string;
  keparahan: string;
  judul: string;
  detail: string;
  status: string;
  meterId: string | null;
  zona: string | null;
  teknisi: { nama: string } | null;
  dibukaPada: string;
  ditutupPada: string | null;
}
export default function HalamanInsiden() {
  const [rows, setRows] = useState<I[]>([]);
  const [selected, setSelected] = useState<I | null>(null);
  const [status, setStatus] = useState("");
  const load = useCallback(async () => {
    const r = await api<{ insiden: I[] }>(
      `/api/admin/insiden${status ? `?status=${status}` : ""}`,
    );
    setRows(r.insiden);
    setSelected(
      (x) =>
        (x && r.insiden.find((i) => i.id === x.id)) || r.insiden[0] || null,
    );
  }, [status]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const update = async (s: string) => {
    if (!selected) return;
    await api(`/api/admin/insiden/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: s }),
    });
    load();
  };
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Insiden & Alarm</h1>
      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <section className="border border-line bg-surface">
          <div className="flex gap-1 border-b border-line p-3">
            <select
              className="border border-line bg-canvas px-2 py-1 text-xs"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua status</option>
              <option value="BARU">Baru</option>
              <option value="DITUGASKAN">Ditugaskan</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
          <div className="divide-y divide-line">
            {rows.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(i)}
                className={`w-full p-4 text-left ${selected?.id === i.id ? "bg-brand-500/10" : ""}`}
              >
                <div className="flex justify-between">
                  <b className="text-sm">{i.judul}</b>
                  <Badge>{i.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {i.tipe} · {i.keparahan} · {i.zona || "—"}
                </p>
              </button>
            ))}
          </div>
        </section>
        {selected && (
          <section className="border border-line bg-surface p-6">
            <Badge>{selected.keparahan}</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold">
              {selected.judul}
            </h2>
            <p className="mt-2 text-sm text-muted">{selected.detail}</p>
            <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted">Meter</dt>
                <dd className="font-mono">{selected.meterId || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Dibuka</dt>
                <dd>{tanggalJam(selected.dibukaPada)}</dd>
              </div>
              <div>
                <dt className="text-muted">Teknisi</dt>
                <dd>{selected.teknisi?.nama || "Belum ditugaskan"}</dd>
              </div>
              <div>
                <dt className="text-muted">Jenis</dt>
                <dd>{selected.tipe}</dd>
              </div>
            </dl>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => update("DITUGASKAN")}>
                Tugaskan / Proses
              </Button>
              <Button varian="sekunder" onClick={() => update("SELESAI")}>
                Tandai Selesai
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
