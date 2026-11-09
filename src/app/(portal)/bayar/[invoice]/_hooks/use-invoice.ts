"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { TransaksiInvoice } from "../_tipe";

export function useInvoice(invoiceId: string) {
  // Baca cache awal dari sessionStorage jika baru saja diarahkan dari halaman beli
  const awalDariBeli = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const mentah = sessionStorage.getItem(`jernih_tx_${invoiceId}`);
        if (mentah) return JSON.parse(mentah) as TransaksiInvoice;
      } catch {
        // Abaikan
      }
    }
    return null;
  }, [invoiceId]);

  const [transaksi, setTransaksi] = useState<TransaksiInvoice | null>(awalDariBeli);
  const [sudahSalin, setSudahSalin] = useState(false);
  const [memuat, setMemuat] = useState(!awalDariBeli);

  // Ambil token dari sessionStorage secara murni memoized
  const kodeToken = useMemo(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`jernih_token_${invoiceId}`);
    }
    return null;
  }, [invoiceId]);

  const ambilStatusTagihan = useCallback(async () => {
    try {
      const data = await api<TransaksiInvoice>(`/api/pembayaran/${invoiceId}`);
      setTransaksi(data);
    } catch {
      // Abaikan bila belum siap
    } finally {
      setMemuat(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const data = await api<TransaksiInvoice>(`/api/pembayaran/${invoiceId}`);
        if (aktif) setTransaksi(data);
      } catch {
        // Abaikan
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    const interval = setInterval(() => {
      ambilStatusTagihan();
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [invoiceId, ambilStatusTagihan]);

  const handleSalinKode = () => {
    if (!kodeToken) return;
    navigator.clipboard.writeText(kodeToken.replace(/\s/g, ""));
    setSudahSalin(true);
    setTimeout(() => setSudahSalin(false), 2000);
  };

  const isLunas = transaksi?.status === "LUNAS" || Boolean(kodeToken);

  return {
    invoiceId,
    transaksi,
    sudahSalin,
    memuat,
    kodeToken,
    isLunas,
    handleSalinKode,
  };
}
