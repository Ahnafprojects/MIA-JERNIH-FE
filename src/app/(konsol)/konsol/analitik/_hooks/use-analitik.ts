"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Analitik } from "../_tipe";

export function useAnalitik() {
  const [rentang, setRentang] = useState(30);
  const [zona, setZona] = useState("");
  const [data, setData] = useState<Analitik | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const r = await api<Analitik>(
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

  const unduh = (format: string) => {
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

  return { rentang, setRentang, zona, setZona, data, unduh };
}
