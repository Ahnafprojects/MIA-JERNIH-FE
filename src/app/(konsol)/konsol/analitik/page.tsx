"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { meterKubik, rupiah } from "@/lib/format";
import { GrafikGaris, GrafikBatang } from "@/components/domain/grafik";

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-brand-700 dark:text-accent">
            Data Operasional
          </span>
          <h1 className="font-display text-3xl font-bold">
            Analitik & Laporan
          </h1>
        </div>
        <div className="flex gap-2">
          <select
            className="h-9 border border-line bg-surface px-2 text-xs"
            value={rentang}
            onChange={(e) => setRentang(Number(e.target.value))}
          >
            <option value={7}>7 hari</option>
            <option value={30}>30 hari</option>
            <option value={90}>90 hari</option>
            <option value={365}>365 hari</option>
          </select>
          <select
            className="h-9 border border-line bg-surface px-2 text-xs"
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
            className="inline-flex items-center gap-1 border border-line px-3 text-xs"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {data?.kpi.map((k) => (
          <div className="border border-line bg-surface p-4" key={k.key}>
            <span className="eyebrow text-muted">{k.label}</span>
            <p className="mt-2 font-mono text-xl font-bold">
              {k.value}
              {k.unit && ` ${k.unit}`}
            </p>
          </div>
        )) || (
          <div className="col-span-full p-8 text-xs text-muted">
            Memuat analitik...
          </div>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-surface p-5">
          <h2 className="font-display font-bold">Pendapatan & Volume</h2>
          {data && (
            <GrafikGaris
              labels={data.labels}
              deret={series}
              tinggi={250}
              format={(n) => rupiah(n)}
            />
          )}
        </section>
        <section className="border border-line bg-surface p-5">
          <h2 className="font-display font-bold">Konsumsi per Periode</h2>
          {data && (
            <GrafikBatang
              labels={data.labels}
              deret={series.filter((s) => s.name !== "Pendapatan")}
              tinggi={250}
              format={(n) => meterKubik(n)}
            />
          )}
        </section>
      </div>
      <section className="border border-line bg-surface p-5">
        <h2 className="font-display font-bold">NRW dan Efisiensi Jaringan</h2>
        {data && (
          <GrafikGaris
            labels={data.labels}
            deret={series.filter((s) => s.name.includes("Air"))}
            tinggi={240}
            format={(n) => meterKubik(n)}
          />
        )}
      </section>
    </main>
  );
}
