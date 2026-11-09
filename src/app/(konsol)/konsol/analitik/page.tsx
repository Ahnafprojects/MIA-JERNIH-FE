"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { meterKubik, rupiah } from "@/lib/format";
import { Card, Panel } from "@/components/ui/card";
import { GrafikGaris, GrafikBatang } from "@/components/domain/grafik";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";

interface Series {
  name: string;
  unit?: string;
  points: number[];
}
interface Analytics {
  kpi: { key: string; label: string; value: number; unit?: string }[];
  labels: string[];
  series: Series[];
  zonaList: { id: string; nama: string }[];
}

export default function HalamanAnalitik() {
  const [rentang, setRentang] = useState(30);
  const [zona, setZona] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const r = await api<Analytics>(
            `/api/admin/analitik?rentang=${rentang}${zona ? `&zona=${zona}` : ""}`,
          );
          if (active) setData(r);
        } catch {
          if (active) setData(null);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [rentang, zona]);
  const download = (format: string) => {
    if (!data) return;
    const content =
      format === "csv"
        ? `label,${data.series.map((s) => s.name).join(",")}\n${data.labels.map((l, i) => `${l},${data.series.map((s) => s.points[i] ?? "").join(",")}`).join("\n")}`
        : JSON.stringify(data, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([content], {
        type: format === "csv" ? "text/csv" : "application/json",
      }),
    );
    a.download = `analitik-${rentang}.${format === "csv" ? "csv" : "json"}`;
    a.click();
  };
  const series = data?.series || [];
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="eyebrow text-brand-600">Data Operasional</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Analitik &amp; Laporan
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-input border border-line bg-surface px-2 text-xs text-ink outline-none focus:border-brand-600"
            value={rentang}
            onChange={(e) => setRentang(Number(e.target.value))}
          >
            <option value={7}>7 hari</option>
            <option value={30}>30 hari</option>
            <option value={90}>90 hari</option>
            <option value={365}>365 hari</option>
          </select>
          <select
            className="h-9 rounded-input border border-line bg-surface px-2 text-xs text-ink outline-none focus:border-brand-600"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
          >
            <option value="">Semua zona</option>
            {data?.zonaList.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nama}
              </option>
            ))}
          </select>
          <button
            onClick={() => download("csv")}
            className="inline-flex items-center gap-1 rounded-input border border-line bg-surface px-3 text-xs text-ink outline-none hover:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </header>

      <div className="berjenjang grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-5">
        {data?.kpi.map((k) => (
          <Card className="rounded-none border-0 px-4 py-3.5" key={k.key}>
            <span className="eyebrow truncate text-muted">{k.label}</span>
            <p className="tabular mt-2 flex items-baseline gap-1.5 font-mono text-[clamp(1.25rem,1.7vw,1.6rem)] leading-none font-bold">
              <AngkaBergerak nilai={Number.isFinite(k.value) ? k.value : null} />
              {k.unit ? (
                <span className="font-mono text-[12.5px] font-semibold text-muted">{k.unit}</span>
              ) : null}
            </p>
          </Card>
        )) || (
          <div className="col-span-full bg-surface p-8 text-xs text-muted">
            Memuat analitik...
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel judul="Pendapatan & Volume">
          {data && (
            <GrafikGaris
              labels={data.labels}
              deret={series}
              tinggi={250}
              format={(n) => rupiah(n)}
            />
          )}
        </Panel>
        <Panel judul="Konsumsi per Periode">
          {data && (
            <GrafikBatang
              labels={data.labels}
              deret={series.filter((s) => s.name !== "Pendapatan")}
              tinggi={250}
              format={(n) => meterKubik(n)}
            />
          )}
        </Panel>
      </div>

      <Panel judul="NRW dan Efisiensi Jaringan">
        {data && (
          <GrafikGaris
            labels={data.labels}
            deret={series.filter((s) => s.name.includes("Air"))}
            tinggi={240}
            format={(n) => meterKubik(n)}
          />
        )}
      </Panel>
    </main>
  );
}
