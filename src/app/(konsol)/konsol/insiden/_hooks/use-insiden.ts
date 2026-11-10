"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Insiden, JawabanInsiden } from "../_tipe";

export function useInsiden() {
  const [rows, setRows] = useState<Insiden[]>([]);
  const [selected, setSelected] = useState<Insiden | null>(null);
  const [status, setStatus] = useState("");
  const [mendeteksi, setMendeteksi] = useState(false);
  const [hasilDeteksi, setHasilDeteksi] = useState<{
    tipe: "sukses" | "galat";
    teks: string;
  } | null>(null);

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

  /*
   * Menjalankan deteksi anomali sekarang juga, tanpa menunggu jadwalnya.
   * Endpointnya (`POST /api/admin/insiden/deteksi-manual`) sudah ada di
   * backend sejak awal, tetapi tidak ada tombol yang memanggilnya.
   */
  const deteksi = async () => {
    setMendeteksi(true);
    setHasilDeteksi(null);
    try {
      const r = await api<{ pesan: string }>("/api/admin/insiden/deteksi-manual", {
        method: "POST",
      });
      setHasilDeteksi({ tipe: "sukses", teks: r.pesan });
      await load();
    } catch (e) {
      setHasilDeteksi({
        tipe: "galat",
        teks: e instanceof ApiError ? e.message : "Deteksi gagal dijalankan.",
      });
    } finally {
      setMendeteksi(false);
    }
  };

  return {
    rows,
    selected,
    setSelected,
    status,
    setStatus,
    update,
    deteksi,
    mendeteksi,
    hasilDeteksi,
  };
}
