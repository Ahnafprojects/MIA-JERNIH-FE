"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TiketKanban } from "../_tipe";

export function useLaporan() {
  const [tiket, setTiket] = useState<TiketKanban[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [aksiId, setAksiId] = useState<string | null>(null);

  const muatTiket = useCallback(async () => {
    setMemuat(true);
    setPesanGalat(null);
    try {
      const data = await api<{ tiket: TiketKanban[] }>("/api/admin/tiket");
      setTiket(data.tiket);
    } catch {
      setPesanGalat("Daftar laporan tidak dapat dimuat.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      muatTiket();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [muatTiket]);

  const ubahStatus = async (id: string, status: string) => {
    setAksiId(id);
    setPesanGalat(null);
    try {
      await api(`/api/admin/tiket/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await muatTiket();
    } catch {
      setPesanGalat("Status laporan tidak dapat diperbarui.");
    } finally {
      setAksiId(null);
    }
  };

  return { tiket, memuat, pesanGalat, aksiId, ubahStatus };
}
