"use client";

import React, { useState, useEffect, useCallback, use, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Clock,
  QrCode,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { liter, rupiah, token, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface TransaksiInvoice {
  invoiceId: string;
  meterId: string;
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "MENUNGGU" | "LUNAS" | "KEDALUWARSA" | "DIBATALKAN";
  qrString?: string | null;
  nomorVa?: string | null;
  dibayarPada?: string | null;
  dibuatPada: string;
}

export default function HalamanBayarInvoice({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.invoice;

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

  if (memuat && !transaksi) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-[4px] border border-line bg-surface p-8 shadow-xs">
          <div className="mx-auto size-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <h2 className="mt-4 font-display text-base font-bold text-ink">
            Memuat Status Pembayaran
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            Memeriksa penerbitan token air untuk invoice #{invoiceId}...
          </p>
        </div>
      </div>
    );
  }

  const isLunas = transaksi?.status === "LUNAS" || Boolean(kodeToken);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {/* ── MODE 1: Lunas Seketika / Sudah Dibayar ── */}
      {isLunas ? (
        <div className="space-y-6">
          <div className="rounded-[4px] border border-success/40 bg-surface p-6 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={32} />
            </div>

            <span className="mt-4 inline-block font-mono text-xs font-bold tracking-wider text-success uppercase">
              Pembayaran Berhasil
            </span>
            <h1 className="font-display text-2xl font-bold text-ink">
              Token Air Diterbitkan
            </h1>
            <p className="mt-1 text-xs text-muted">
              Invoice #{invoiceId} &middot; {tanggalJam(transaksi?.dibayarPada || new Date())}
            </p>

            {/* Kotak Kode Token Sekali Tampil */}
            <div className="my-6 rounded-[3px] border-2 border-dashed border-brand-500/50 bg-brand-500/5 p-5">
              <span className="font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
                Kode Token Meter (Sekali Pakai)
              </span>
              <div className="my-2 select-all font-mono text-2xl font-black tracking-[0.2em] text-ink sm:text-3xl">
                {kodeToken ? token(kodeToken) : "55120 •••••"}
              </div>

              {kodeToken ? (
                <Button
                  type="button"
                  varian="sekunder"
                  ukuran="sm"
                  onClick={handleSalinKode}
                >
                  <Copy size={14} />
                  <span>{sudahSalin ? "Kode Tersalin!" : "Salin Kode Token"}</span>
                </Button>
              ) : null}

              <p className="mt-3 text-[11px] text-muted">
                Catat kodenya sekarang — kode utuh hanya ditampilkan sekali di layar ini dan dikirim ke email terdaftar Anda.
              </p>
            </div>

            {/* Peringatan: Pembelian tidak langsung menambah saldo meter */}
            <div className="flex items-start gap-2 rounded-[2px] border border-warn/30 bg-warn/10 p-3 text-left text-xs leading-relaxed text-ink">
              <ShieldAlert size={16} className="shrink-0 text-warn mt-0.5" />
              <span>
                <strong>Perhatian:</strong> Pembelian ini tidak otomatis menambah saldo fisik meter Anda.
                Token baru diterbitkan; masukkan kode di atas melalui keypad meter air atau halaman <strong>Isi Token</strong> untuk mengaktifkan pasokan liter air.
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/token" className="flex-1">
                <Button varian="utama" blok>
                  Tukarkan ke Meter Sekarang
                  <ArrowRight size={14} />
                </Button>
              </Link>
              <Link href="/beranda" className="flex-1">
                <Button varian="halus" blok type="button">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ── MODE 2: Menunggu Pembayaran (QR / VA) ── */
        <div className="space-y-6">
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs text-center">
            <span className="font-mono text-xs font-bold text-warn uppercase tracking-wider">
              Menunggu Pembayaran
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              Selesaikan Pembayaran
            </h1>
            <p className="mt-1 font-mono text-xs text-muted">Invoice: {invoiceId}</p>

            <div className="my-6 border-y border-line py-4">
              <p className="text-xs text-muted">Total Pembayaran</p>
              <p className="tabular font-mono text-3xl font-black text-ink">
                {rupiah(transaksi?.jumlahRp ?? 0)}
              </p>
              <p className="mt-1 font-mono text-xs text-brand-700 dark:text-accent">
                {liter(transaksi?.volumeL ?? 0, 0)} Air Bersih
              </p>
            </div>

            {/* QRIS Display atau Virtual Account */}
            {transaksi?.metode === "QRIS" ? (
              <div className="mx-auto flex flex-col items-center">
                <div className="grid size-48 place-items-center rounded-[3px] border border-line bg-white p-4 shadow-xs">
                  <QrCode size={160} className="text-black" />
                </div>
                <p className="mt-3 text-xs text-muted">
                  Pindai QR di atas menggunakan aplikasi pembayaran apa saja (GoPay, OVO, BCA, Livin, dll).
                </p>
              </div>
            ) : (
              <div className="rounded-[3px] border border-line bg-soft p-4">
                <p className="text-xs text-muted">Nomor Virtual Account</p>
                <p className="my-1 font-mono text-xl font-bold text-ink">
                  {transaksi?.nomorVa ?? "88081234567890"}
                </p>
                <p className="text-[11px] text-muted">Bank Mandiri / BCA / BNI</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-1.5 font-mono text-xs text-muted">
              <Clock size={14} className="animate-pulse text-warn" />
              <span>Menunggu konfirmasi server... (Pengecekan tiap 5 detik)</span>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <Link href="/beranda">
                <Button varian="halus" blok type="button">
                  Bayar Nanti (Kembali ke Beranda)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
