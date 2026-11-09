"use client";

import React, { useEffect, useState } from "react";
import { Copy, Download } from "lucide-react";
import { api } from "@/lib/api";
import { liter, tanggal } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TokenRow {
  id: string;
  kodeBertopeng: string;
  nilaiL: number;
  status: string;
  meterId: string | null;
  kedaluwarsaPada: string;
  dibuatPada: string;
}
export default function HalamanTokenKonsol() {
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [kpi, setKpi] = useState<Record<string, number>>({});
  const [nilaiL, setNilaiL] = useState(1000);
  const [jumlah, setJumlah] = useState(1);
  const [meterId, setMeterId] = useState("");
  const [alasan, setAlasan] = useState("");
  const [hasil, setHasil] = useState<{ kode: string; nilaiL: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const load = async () => {
    const r = await api<{
      kpi: { key: string; value: number }[];
      rows: TokenRow[];
    }>(`/api/admin/token?perPage=30${filter ? `&status=${filter}` : ""}`);
    setRows(r.rows);
    setKpi(Object.fromEntries(r.kpi.map((x) => [x.key, x.value])));
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [filter]);
  const generate = async () => {
    setLoading(true);
    try {
      const r = await api<{ tokens: { kode: string; nilaiL: number }[] }>(
        "/api/admin/token",
        {
          method: "POST",
          body: JSON.stringify({
            nilaiL,
            jumlah,
            meterId: meterId || undefined,
            alasan,
          }),
        },
      );
      setHasil(r.tokens);
      await load();
    } finally {
      setLoading(false);
    }
  };
  const csv = () => {
    const body = hasil.map((x) => `${x.kode},${x.nilaiL}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([`kode,nilaiL\n${body}`], { type: "text/csv" }),
    );
    a.download = "token-jernih.csv";
    a.click();
  };
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Token Operasional</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["aktif", "Aktif"],
          ["used", "Terpakai"],
          ["expired", "Kedaluwarsa"],
          ["revoked", "Dibatalkan"],
          ["literBelumDipakai", "Liter Belum Dipakai"],
        ].map(([k, l]) => (
          <div className="border border-line bg-surface p-4" key={k}>
            <span className="eyebrow text-muted">{l}</span>
            <p className="mt-2 font-mono text-2xl font-bold">
              {kpi[k] ?? "—"}
              {k === "literBelumDipakai" && " L"}
            </p>
          </div>
        ))}
      </div>
      <section className="border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-bold">Penerbit Token</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            className="h-10 border border-line bg-canvas px-3 text-sm"
            type="number"
            value={nilaiL}
            onChange={(e) => setNilaiL(Number(e.target.value))}
            placeholder="Liter"
          />
          <input
            className="h-10 border border-line bg-canvas px-3 text-sm"
            type="number"
            min="1"
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            placeholder="Jumlah"
          />
          <input
            className="h-10 border border-line bg-canvas px-3 text-sm"
            value={meterId}
            onChange={(e) => setMeterId(e.target.value)}
            placeholder="ID meter opsional"
          />
          <input
            className="h-10 border border-line bg-canvas px-3 text-sm"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan penerbitan"
          />
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            if (
              jumlah > 1 &&
              !confirm(
                `Buat ${jumlah} token senilai ${nilaiL.toLocaleString("id-ID")} L?`,
              )
            )
              return;
            generate();
          }}
          disabled={loading || alasan.length < 3}
        >
          Terbitkan Token
        </Button>
      </section>
      {hasil.length > 0 && (
        <section className="border border-success/40 bg-success/5 p-5">
          <h2 className="font-display text-xl font-bold">
            Kode diterbitkan sekali
          </h2>
          <div className="mt-3 divide-y divide-line">
            {hasil.map((x) => (
              <div
                className="flex justify-between py-2 font-mono text-sm"
                key={x.kode}
              >
                <span>
                  {x.kode} · {liter(x.nilaiL, 0)}
                </span>
                <button onClick={() => navigator.clipboard.writeText(x.kode)}>
                  <Copy size={15} />
                </button>
              </div>
            ))}
          </div>
          <Button className="mt-3" varian="sekunder" onClick={csv}>
            <Download size={14} /> Unduh CSV
          </Button>
        </section>
      )}
      <section className="border border-line bg-surface">
        <div className="flex justify-between p-5">
          <h2 className="font-display text-xl font-bold">Riwayat Token</h2>
          <select
            className="border border-line bg-canvas px-2 text-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="AKTIF">Aktif</option>
            <option value="TERPAKAI">Terpakai</option>
            <option value="KEDALUWARSA">Kedaluwarsa</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-line text-muted">
                <th className="p-3">Kode</th>
                <th>Liter</th>
                <th>Status</th>
                <th>Meter</th>
                <th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-b border-line" key={r.id}>
                  <td className="p-3 font-mono">{r.kodeBertopeng}</td>
                  <td>{liter(r.nilaiL, 0)}</td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                  <td className="font-mono">{r.meterId || "—"}</td>
                  <td>{tanggal(r.dibuatPada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
