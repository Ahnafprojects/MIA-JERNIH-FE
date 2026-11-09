"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Insiden, JawabanInsiden } from "../_tipe";

export function useInsiden() {
  const [rows, setRows] = useState<Insiden[]>([]);
  const [selected, setSelected] = useState<Insiden | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    const r = await api<JawabanInsiden>(
      `/api/admin/insiden${status ? `?status=${status}` : ""}`,
    );
    setRows(r.insiden);
    setSelected(
      (x) => (x && r.insiden.find((i) => i.id === x.id)) || r.insiden[0] || null,
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [status]);

  const update = async (s: string) => {
    if (!selected) return;
    await api(`/api/admin/insiden/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: s }),
    });
    load();
  };

  return { rows, selected, setSelected, status, setStatus, update };
}
