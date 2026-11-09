"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  FormKonfigurasi,
  JawabanPerangkat,
  KpiPerangkat,
  MeterArmada,
  PerluPerhatian,
} from "../_tipe";

export function usePerangkat() {
  const [kpi, setKpi] = useState<KpiPerangkat[]>([]);
  const [rows, setRows] = useState<MeterArmada[]>([]);
  const [versi, setVersi] = useState("");
  const [perhatian, setPerhatian] = useState<PerluPerhatian[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [form, setForm] = useState<FormKonfigurasi>({
    ambangPeringatanL: 5,
    ambangKritisL: 2,
    kalibrasi: 6.55,
    panjangToken: 10,
    alasan: "",
  });

  const load = async () => {
    const r = await api<JawabanPerangkat>("/api/admin/perangkat");
    setKpi(r.kpi);
    setVersi(r.versiTerbaru);
    setRows(r.rows);
    setPerhatian(r.perluPerhatian);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const kirim = async () => {
    if (!ids.length || form.alasan.length < 3) return;
    if (!confirm(`Kirim konfigurasi ke ${ids.length} meter?`)) return;
    await api("/api/admin/konfigurasi-meter", {
      method: "POST",
      body: JSON.stringify({ ...form, meterIds: ids }),
    });
    load();
  };

  return {
    kpi,
    rows,
    versi,
    perhatian,
    ids,
    setIds,
    form,
    setForm,
    kirim,
  };
}
