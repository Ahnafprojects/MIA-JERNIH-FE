"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KeadaanKosong } from "@/components/ui/keadaan";

const WARNA = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

const sumbu = {
  stroke: "var(--color-muted)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

/** Bentuk deret dari API: dicari lewat NAMA, bukan indeks. */
export interface Deret {
  name: string;
  unit?: string;
  points: number[];
}

function keRecharts(labels: string[], deret: Deret[]) {
  return labels.map((l, i) => {
    const baris: Record<string, string | number> = { label: l };
    for (const d of deret) baris[d.name] = d.points[i] ?? 0;
    return baris;
  });
}

export function GrafikBatang({
  labels,
  deret,
  tinggi = 240,
  format,
}: {
  labels: string[];
  deret: Deret[];
  tinggi?: number;
  format?: (n: number) => string;
}) {
  // Grafik tanpa data WAJIB punya keadaan kosong: sumbu kosong tanpa
  // penjelasan terbaca sebagai grafik yang gagal dimuat.
  if (labels.length === 0 || deret.length === 0) {
    return (
      <KeadaanKosong
        judul="Belum ada data"
        pesan="Data untuk rentang ini belum tersedia."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={tinggi}>
      <BarChart data={keRecharts(labels, deret)} margin={{ left: -18, right: 8 }}>
        <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
        <XAxis dataKey="label" {...sumbu} interval="preserveStartEnd" />
        <YAxis {...sumbu} tickFormatter={format} width={56} />
        <Tooltip
          cursor={{ fill: "var(--color-soft)" }}
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(v, n) => [
            typeof v === "number" && format ? format(v) : String(v ?? "—"),
            String(n),
          ]}
        />
        {deret.map((d, i) => (
          <Bar key={d.name} dataKey={d.name} fill={WARNA[i % 4]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GrafikGaris({
  labels,
  deret,
  tinggi = 240,
  format,
}: {
  labels: string[];
  deret: Deret[];
  tinggi?: number;
  format?: (n: number) => string;
}) {
  if (labels.length === 0 || deret.length === 0) {
    return (
      <KeadaanKosong
        judul="Belum ada data"
        pesan="Data untuk rentang ini belum tersedia."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={tinggi}>
      <LineChart data={keRecharts(labels, deret)} margin={{ left: -18, right: 8 }}>
        <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
        <XAxis dataKey="label" {...sumbu} interval="preserveStartEnd" />
        <YAxis {...sumbu} tickFormatter={format} width={56} />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(v, n) => [
            typeof v === "number" && format ? format(v) : String(v ?? "—"),
            String(n),
          ]}
        />
        {deret.map((d, i) => (
          <Line
            key={d.name}
            type="monotone"
            dataKey={d.name}
            stroke={WARNA[i % 4]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
