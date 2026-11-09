"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { TransaksiBaris } from "../_tipe";

export function useRiwayat() {
  const [daftarTransaksi, setDaftarTransaksi] = useState<TransaksiBaris[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("SEMUA");
  const [kataKunci, setKataKunci] = useState("");
  const [memuat, setMemuat] = useState(true);

  const [transaksiTerpilih, setTransaksiTerpilih] = useState<TransaksiBaris | null>(null);
  const [sheetBuka, setSheetBuka] = useState(false);
  const [pesanEmail, setPesanEmail] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setMemuat(true);
      try {
        const qFilter = filterStatus !== "SEMUA" ? `&filter=${filterStatus}` : "";
        const res = await api<{
          rows: TransaksiBaris[];
          total: number;
          page: number;
          perPage: number;
        }>(`/api/transaksi?page=${halaman}&perPage=12${qFilter}`);

        if (aktif) {
          setDaftarTransaksi(res.rows || []);
          setTotalData(res.total || 0);
          if (res.rows && res.rows.length > 0 && !transaksiTerpilih) {
            setTransaksiTerpilih(res.rows[0]);
          }
        }
      } catch {
        if (aktif) setDaftarTransaksi([]);
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, [halaman, filterStatus, transaksiTerpilih]);

  const dataTersaring = useMemo(() => {
    if (!kataKunci.trim()) return daftarTransaksi;
    const q = kataKunci.toLowerCase();
    return daftarTransaksi.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.meterId.toLowerCase().includes(q) ||
        t.metode.toLowerCase().includes(q),
    );
  }, [daftarTransaksi, kataKunci]);

  const handlePilihBaris = (item: TransaksiBaris) => {
    setTransaksiTerpilih(item);
    // Buka sheet di mobile
    if (window.innerWidth < 1024) {
      setSheetBuka(true);
    }
  };

  const handleUnduhStrukPdf = () => {
    if (!transaksiTerpilih) return;
    window.print();
  };

  const handleKirimEmailStruk = () => {
    setPesanEmail("Salinan struk telah dikirimkan ke email terdaftar Anda.");
    setTimeout(() => setPesanEmail(null), 3000);
  };

  return {
    totalData,
    halaman,
    setHalaman,
    filterStatus,
    setFilterStatus,
    kataKunci,
    setKataKunci,
    memuat,
    transaksiTerpilih,
    sheetBuka,
    setSheetBuka,
    pesanEmail,
    dataTersaring,
    handlePilihBaris,
    handleUnduhStrukPdf,
    handleKirimEmailStruk,
  };
}
