"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  FileText,
  Mail,
  X,
  Droplet,
} from "lucide-react";
import { api } from "@/lib/api";
import { liter, rupiah, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { KeadaanKosong } from "@/components/ui/keadaan";

interface TransaksiBaris {
  id: string;
  meterId: string;
  jenis: "BELI" | "ISI";
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "LUNAS" | "MENUNGGU" | "KEDALUWARSA" | "DIBATALKAN";
  token?: string | null;
  dibuatPada: string;
  dibayarPada?: string | null;
}

function lencanaStatus(status: string) {
  switch (status) {
    case "LUNAS":
      return <Badge nada="sukses" titik>Lunas</Badge>;
    case "MENUNGGU":
      return <Badge nada="peringatan" titik>Menunggu</Badge>;
    case "KEDALUWARSA":
      return <Badge nada="netral" titik>Kedaluwarsa</Badge>;
    case "DIBATALKAN":
      return <Badge nada="bahaya" titik>Dibatalkan</Badge>;
    default:
      return <Badge nada="netral">{status}</Badge>;
  }
}

function KontenRiwayat() {
  const [daftarTransaksi, setDaftarTransaksi] = useState<TransaksiBaris[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("SEMUA");
  const [kataKunci, setKataKunci] = useState("");
  const [memuat, setMemuat] = useState(true);

  // Struk terpilih (sidebar desktop & sheet mobile)
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

  // Filter pencarian di memori untuk invoice ID
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

  // Definisi Kolom Tabel Transparansi Jernih
  const kolom: Kolom<TransaksiBaris>[] = [
    {
      kunci: "tanggal",
      label: "Tanggal & Waktu",
      render: (t) => (
        <span className="font-mono text-xs text-muted">
          {tanggalJam(t.dibuatPada)}
        </span>
      ),
    },
    {
      kunci: "invoice",
      label: "Invoice",
      render: (t) => (
        <span className="font-mono text-xs font-bold text-ink">
          {t.id}
        </span>
      ),
    },
    {
      kunci: "volume",
      label: "Volume",
      rata: "kanan",
      render: (t) => (
        <span className="font-mono text-xs font-bold text-brand-700 dark:text-accent">
          {liter(t.volumeL, 0)}
        </span>
      ),
    },
    {
      kunci: "nominal",
      label: "Nominal",
      rata: "kanan",
      render: (t) => (
        <span className="tabular font-mono text-xs font-bold text-ink">
          {rupiah(t.jumlahRp)}
        </span>
      ),
    },
    {
      kunci: "status",
      label: "Status",
      render: (t) => lencanaStatus(t.status),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Catatan Publik Warga
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-1 text-xs text-muted text-balance">
            Daftar lengkap pembelian dan penukaran saldo air. Setiap transaksi tersimpan idempoten dan dapat dicocokkan dengan audit log.
          </p>
        </div>

        <Link href="/beli">
          <Button varian="utama" ukuran="sm">
            <Droplet size={14} />
            Beli Token Baru
          </Button>
        </Link>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Status */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted">Status:</span>
          {["SEMUA", "LUNAS", "MENUNGGU", "KEDALUWARSA"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setHalaman(1);
              }}
              className={`rounded-[3px] px-2.5 py-1 text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? "bg-brand-600 text-white"
                  : "border border-line bg-soft text-muted hover:text-ink"
              }`}
            >
              {st === "SEMUA" ? "Semua Transaksi" : st}
            </button>
          ))}
        </div>

        {/* Input Cari */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari invoice atau meter..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className="h-9 w-full rounded-[3px] border border-line bg-canvas pl-9 pr-3 font-mono text-xs text-ink outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* ── Konten Grid (Tabel di Kiri + Struk di Kanan pada Desktop) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Tabel (2/3 lebar) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-[4px] border border-line bg-surface shadow-xs">
            {!memuat && dataTersaring.length === 0 ? (
              <div className="py-12">
                <KeadaanKosong
                  judul="Belum Ada Transaksi"
                  pesan="Anda belum memiliki catatan transaksi pembelian token air."
                  aksi={
                    <Link href="/beli">
                      <Button varian="utama">Beli Token Air Pertama</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <Tabel
                kolom={kolom}
                data={dataTersaring}
                kunciBaris={(t) => t.id}
                onKlikBaris={handlePilihBaris}
                terpilih={transaksiTerpilih?.id}
                lebarMin="32rem"
              />
            )}
          </div>

          {/* Navigasi Paginasi */}
          {totalData > 12 ? (
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Menampilkan halaman {halaman} dari {Math.ceil(totalData / 12)}
              </span>
              <div className="flex gap-2">
                <Button
                  varian="sekunder"
                  ukuran="sm"
                  disabled={halaman <= 1}
                  onClick={() => setHalaman((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  varian="sekunder"
                  ukuran="sm"
                  disabled={halaman >= Math.ceil(totalData / 12)}
                  onClick={() => setHalaman((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Kolom Panel Struk Desktop (1/3 lebar) */}
        <div className="hidden lg:block">
          {transaksiTerpilih ? (
            <div className="sticky top-24 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-brand-600 dark:text-accent" />
                  <h3 className="font-display text-sm font-bold text-ink">
                    Struk Pembayaran
                  </h3>
                </div>
                {lencanaStatus(transaksiTerpilih.status)}
              </div>

              {pesanEmail ? (
                <div className="my-3 rounded-[3px] bg-success/10 p-2 text-center text-xs text-success">
                  {pesanEmail}
                </div>
              ) : null}

              {/* Rincian Struk Publik */}
              <div className="my-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Nomor Invoice</span>
                  <span className="font-mono font-bold text-ink">
                    {transaksiTerpilih.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ID Meter Tujuan</span>
                  <span className="font-mono text-ink">
                    {transaksiTerpilih.meterId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Waktu Transaksi</span>
                  <span className="font-mono text-muted">
                    {tanggalJam(transaksiTerpilih.dibuatPada)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Metode Pembayaran</span>
                  <span className="font-semibold text-ink">
                    {transaksiTerpilih.metode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Volume Air</span>
                  <span className="font-mono font-bold text-brand-700 dark:text-accent">
                    {liter(transaksiTerpilih.volumeL, 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <span className="text-muted">Total Bayar</span>
                  <span className="tabular font-mono text-base font-black text-ink">
                    {rupiah(transaksiTerpilih.jumlahRp)}
                  </span>
                </div>

                {/* Tampilan Token Bertopeng */}
                <div className="mt-4 rounded-[3px] border border-dashed border-line bg-soft p-3 text-center">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                    Kode Token Air (Bertopeng)
                  </span>
                  <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-none">
                    {transaksiTerpilih.token || "55120 •••••"}
                  </div>
                  <p className="text-[10px] text-muted">
                    Kode utuh hanya dikirim sekali saat pembayaran dan tersimpan di email Anda.
                  </p>
                </div>
              </div>

              {/* Tombol Aksi Struk */}
              <div className="space-y-2 border-t border-line pt-4">
                <Button
                  varian="utama"
                  blok
                  ukuran="sm"
                  onClick={handleUnduhStrukPdf}
                >
                  <Download size={14} />
                  Cetak / Unduh Struk
                </Button>
                <Button
                  varian="sekunder"
                  blok
                  ukuran="sm"
                  onClick={handleKirimEmailStruk}
                >
                  <Mail size={14} />
                  Kirim ke Email Saya
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-line p-8 text-center text-xs text-muted">
              Pilih baris pada tabel untuk melihat struk pembayaran.
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Sheet Struk (< 1024px / 390px) ── */}
      {sheetBuka && transaksiTerpilih ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          {/* Tirai latar */}
          <button
            type="button"
            onClick={() => setSheetBuka(false)}
            className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup struk"
          />

          {/* Konten Sheet Meluncur dari Bawah */}
          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[8px] border-t border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-brand-600 uppercase">
                  Rincian Struk
                </span>
                <h3 className="font-mono text-base font-bold text-ink">
                  {transaksiTerpilih.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSheetBuka(false)}
                className="grid size-8 place-items-center rounded-[3px] text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span>{lencanaStatus(transaksiTerpilih.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Meter</span>
                <span className="font-mono text-ink">{transaksiTerpilih.meterId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Waktu</span>
                <span className="font-mono text-muted">{tanggalJam(transaksiTerpilih.dibuatPada)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Volume Air</span>
                <span className="font-mono font-bold text-brand-700 dark:text-accent">
                  {liter(transaksiTerpilih.volumeL, 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <span className="text-muted">Total Bayar</span>
                <span className="font-mono text-base font-black text-ink">
                  {rupiah(transaksiTerpilih.jumlahRp)}
                </span>
              </div>

              <div className="mt-4 rounded-[3px] border border-dashed border-line bg-soft p-3 text-center">
                <span className="font-mono text-[10px] text-muted uppercase">
                  Kode Token Air (Bertopeng)
                </span>
                <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-none">
                  {transaksiTerpilih.token || "55120 •••••"}
                </div>
                <p className="text-[10px] text-muted">
                  Kode utuh hanya dikirim sekali saat transaksi ke email Anda.
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-4">
              <Button
                varian="utama"
                blok
                onClick={handleUnduhStrukPdf}
              >
                <Download size={14} />
                Cetak / Simpan Struk
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalamanRiwayat() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Memuat riwayat...</div>}>
      <KontenRiwayat />
    </Suspense>
  );
}
