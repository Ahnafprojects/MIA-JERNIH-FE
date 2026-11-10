"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { JawabanToken, TokenRow, TokenTerbit } from "../_tipe";

export function useTokenKonsol() {
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [kpi, setKpi] = useState<Record<string, number>>({});
  const [nilaiL, setNilaiL] = useState(1000);
  const [jumlah, setJumlah] = useState(1);
  const [meterId, setMeterId] = useState("");
  const [alasan, setAlasan] = useState("");
  const [hasil, setHasil] = useState<TokenTerbit[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [galat, setGalat] = useState<string | null>(null);

  /*
   * `/konsol/token?meter=<id>` mengisi kolom meter lebih dulu. Tombol
   * "Buat token" di detail pelanggan menautkan ke sini, sehingga token
   * darurat terikat ke meter pelanggan itu tanpa petugas menyalin id-nya.
   * Dibaca dari `window.location` supaya halaman tidak menuntut Suspense.
   */
  useEffect(() => {
    // Ditunda satu tik, sama seperti pemuatan di bawah: state awal harus
    // sama di server dan peramban supaya hidrasi tidak berselisih.
    const timer = window.setTimeout(() => {
      const id = new URLSearchParams(window.location.search).get("meter");
      if (id) setMeterId(id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const load = async () => {
    const r = await api<JawabanToken>(
      `/api/admin/token?perPage=30${filter ? `&status=${filter}` : ""}`,
    );
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
    setGalat(null);
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
    } catch (e) {
      /* Dulu galat dilempar tanpa ditangkap: tombol berhenti berputar dan
         tidak ada apa pun yang memberi tahu bahwa tidak satu token pun
         terbit (alasan terlalu pendek, peran Teknisi, meter tidak ada). */
      setGalat(e instanceof ApiError ? e.message : "Token gagal diterbitkan.");
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

  return {
    rows,
    kpi,
    nilaiL,
    setNilaiL,
    jumlah,
    setJumlah,
    meterId,
    setMeterId,
    galat,
    alasan,
    setAlasan,
    hasil,
    loading,
    filter,
    setFilter,
    generate,
    csv,
  };
}
