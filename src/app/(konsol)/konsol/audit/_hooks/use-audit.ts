"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { BarisAudit } from "../_tipe";

export function useAudit() {
  const [rows, setRows] = useState<BarisAudit[]>([]);
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
          const r = await api<{ rows: BarisAudit[] }>(`/api/admin/audit?${q}`);
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

  return { rows, tipe, setTipe, user, setUser };
}
