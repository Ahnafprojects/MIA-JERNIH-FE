"use client";
import React, { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LcdDisplay } from "@/components/domain/lcd";
interface M {
  id: string;
  serial: string;
  label: string;
  zona: string | null;
  pelanggan: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: string;
  saklarOn: boolean;
  daring: boolean;
  versiFirmware: string;
}
export default function HalamanPerangkat() {
  const [kpi, setKpi] = useState<
    { key: string; label: string; value: number; unit?: string }[]
  >([]);
  const [rows, setRows] = useState<M[]>([]);
  const [versi, setVersi] = useState("");
  const [perhatian, setPerhatian] = useState<
    { meterId: string; serial: string; masalah: string }[]
  >([]);
  const [ids, setIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    ambangPeringatanL: 5,
    ambangKritisL: 2,
    kalibrasi: 6.55,
    panjangToken: 10,
    alasan: "",
  });
  const load = useCallback(async () => {
    const r = await api<{
      kpi: typeof kpi;
      versiTerbaru: string;
      rows: M[];
      perluPerhatian: typeof perhatian;
    }>("/api/admin/perangkat");
    setKpi(r.kpi);
    setVersi(r.versiTerbaru);
    setRows(r.rows);
    setPerhatian(r.perluPerhatian);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const kirim = async () => {
    if (!ids.length || form.alasan.length < 3) return;
    if (!confirm(`Kirim konfigurasi ke ${ids.length} meter?`)) return;
    await api("/api/admin/konfigurasi-meter", {
      method: "POST",
      body: JSON.stringify({ ...form, meterIds: ids }),
    });
    load();
  };
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Perangkat & Meter</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((x) => (
          <div className="border border-line bg-surface p-4" key={x.key}>
            <span className="eyebrow text-muted">{x.label}</span>
            <p className="mt-2 font-mono text-2xl font-bold">
              {x.value}
              {x.unit && ` ${x.unit}`}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="border border-line bg-surface">
          <h2 className="border-b border-line p-4 font-display font-bold">
            Armada Meter
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="p-3">Node / Serial</th>
                  <th>Zona</th>
                  <th>Firmware</th>
                  <th>RSSI / Status</th>
                  <th>Pilih</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr className="border-b border-line" key={m.id}>
                    <td className="p-3 font-mono">
                      {m.id}
                      <br />
                      {m.serial}
                    </td>
                    <td>{m.zona || "—"}</td>
                    <td>{m.versiFirmware}</td>
                    <td>
                      <Badge nada={m.daring ? "sukses" : "bahaya"}>
                        {m.daring ? "Online" : "Offline"}
                      </Badge>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={ids.includes(m.id)}
                        onChange={(e) =>
                          setIds((x) =>
                            e.target.checked
                              ? [...x, m.id]
                              : x.filter((y) => y !== m.id),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="space-y-4 border border-line bg-surface p-5">
          <h2 className="font-display font-bold">Konfigurasi Meter</h2>
          <p className="text-xs text-muted">Versi terbaru: {versi}</p>
          {(
            [
              "ambangPeringatanL",
              "ambangKritisL",
              "kalibrasi",
              "panjangToken",
            ] as const
          ).map((k) => (
            <label className="block text-xs" key={k}>
              {k}
              <input
                className="mt-1 h-9 w-full border border-line bg-canvas px-2 font-mono"
                type="number"
                value={form[k]}
                onChange={(e) =>
                  setForm({ ...form, [k]: Number(e.target.value) })
                }
              />
            </label>
          ))}
          <input
            className="h-9 w-full border border-line bg-canvas px-2 text-xs"
            placeholder="Alasan perubahan"
            value={form.alasan}
            onChange={(e) => setForm({ ...form, alasan: e.target.value })}
          />
          <LcdDisplay baris1={`S=0.00L  OFF`} baris2={`D=0.0   V=0.0`} />
          <Button
            blok
            onClick={kirim}
            disabled={!ids.length || form.alasan.length < 3}
          >
            Kirim Konfigurasi
          </Button>
        </aside>
      </div>
      {perhatian.length > 0 && (
        <section className="border border-warn/30 bg-warn/10 p-4">
          <h2 className="font-bold">Perlu Perhatian</h2>
          <ul className="mt-2 text-xs">
            {perhatian.map((x) => (
              <li key={x.meterId}>
                {x.serial}: {x.masalah}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
