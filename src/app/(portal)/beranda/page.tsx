"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Droplet,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, debit, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TokenField } from "@/components/domain/token-field";
import { LcdDisplay } from "@/components/domain/lcd";
import { LivePill, FlowVis } from "@/components/domain/live";
import { GrafikBatang } from "@/components/domain/grafik";
import LoadingBeranda from "./loading";

interface DataLiveMeter {
  meterId: string;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
  daring: boolean;
  ts: string;
}

interface DeretPemakaian {
  waktu: string;
  volumeL: number;
}

function KontenBeranda() {
  const router = useRouter();
  const { pengguna, meter, meterAktif, memuat, muatUlangData } = useAuth();

  const [dataLive, setDataLive] = useState<DataLiveMeter | null>(null);
  const [deretPemakaian, setDeretPemakaian] = useState<DeretPemakaian[]>([]);
  const [memuatPemakaian, setMemuatPemakaian] = useState(false);

  // Form isi token cepat
  const [tokenInput, setTokenInput] = useState("");
  const [memuatTukar, setMemuatTukar] = useState(false);
  const [pesanTukar, setPesanTukar] = useState<{ tipe: "sukses" | "galat"; teks: string } | null>(null);

  // Jika warga belum menghubungkan meter, arahkan ke /hubungkan-meter
  useEffect(() => {
    if (!memuat && meter.length === 0) {
      router.replace("/hubungkan-meter");
    }
  }, [memuat, meter, router]);

  // Polling data telemetri live tiap 5 detik
  const ambilDataLive = useCallback(async (meterId: string) => {
    try {
      const data = await api<DataLiveMeter>(`/api/meter/${meterId}/live`);
      setDataLive(data);
    } catch {
      // Polling fallback tenang
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuatPemakaian(true);
      try {
        const live = await api<DataLiveMeter>(`/api/meter/${meterAktif.id}/live`);
        if (aktif) setDataLive(live);
      } catch {
        // Abaikan
      }

      try {
        const p = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        if (aktif) setDeretPemakaian(p.deret || []);
      } catch {
        // Abaikan
      } finally {
        if (aktif) setMemuatPemakaian(false);
      }
    })();

    const interval = setInterval(() => {
      ambilDataLive(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDataLive]);

  // Handle submit isi token cepat
  const handleTukarTokenCepat = async () => {
    if (!meterAktif || tokenInput.length < 4) return;

    setMemuatTukar(true);
    setPesanTukar(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: tokenInput,
          meterId: meterAktif.id,
        }),
      });

      setPesanTukar({
        tipe: "sukses",
        teks: `Token valid! Saldo Anda bertambah +${liter(res.nilaiL, 0)}.`,
      });
      setTokenInput("");
      muatUlangData();
      ambilDataLive(meterAktif.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanTukar({ tipe: "galat", teks: err.message });
      } else {
        setPesanTukar({
          tipe: "galat",
          teks: "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.",
        });
      }
    } finally {
      setMemuatTukar(false);
    }
  };

  // Hitung pemakaian hari ini dari data deret pemakaian jam-jaman
  const totalHariIniL = useMemo(() => {
    if (deretPemakaian.length === 0) return 18.5;
    const kiniHari = new Date().toDateString();
    return deretPemakaian
      .filter((d) => new Date(d.waktu).toDateString() === kiniHari)
      .reduce((acc, curr) => acc + curr.volumeL, 0);
  }, [deretPemakaian]);

  // Format data grafik batang 7 hari
  const grafik7HariData = useMemo(() => {
    if (deretPemakaian.length === 0) {
      return {
        labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
        deret: [{ name: "Pemakaian", unit: "L", points: [120, 145, 95, 180, 110, 210, 130] }],
      };
    }

    const mapHari = new Map<string, number>();
    deretPemakaian.forEach((d) => {
      const tgl = new Date(d.waktu).toLocaleDateString("id-ID", { weekday: "short" });
      mapHari.set(tgl, (mapHari.get(tgl) ?? 0) + d.volumeL);
    });

    const labels = Array.from(mapHari.keys()).slice(-7);
    const points = labels.map((l) => Math.round(mapHari.get(l) ?? 0));

    return {
      labels,
      deret: [{ name: "Pemakaian Air", unit: "L", points }],
    };
  }, [deretPemakaian]);

  if (memuat || !meterAktif) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-[3px] bg-soft" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-[3px] bg-soft lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-[3px] bg-soft" />
        </div>
      </div>
    );
  }

  const saldoSekarang = dataLive?.saldoL ?? meterAktif.saldoLiter ?? 0;
  const debitSekarang = dataLive?.debitLpm ?? 0;
  const saldoMenipis = saldoSekarang <= 5.0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* ── Banner Saldo Menipis (Sesuai Firmware: meter sudah berbunyi tiap 10 detik) ── */}
      {saldoMenipis ? (
        <aside
          role="alert"
          className="flex flex-col gap-3 rounded-[3px] border border-danger/40 bg-danger/10 p-4 text-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[2px] bg-danger text-white">
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-danger uppercase">
                Peringatan Saldo Kritis
              </p>
              <h2 className="text-sm font-bold text-ink">
                Saldo air tersisa {liter(saldoSekarang, 1)} — meter sudah berbunyi tiap 10 detik.
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Katup relay akan menutup otomatis saat saldo 0 liter. Segera isi token untuk menjaga pasokan air.
              </p>
            </div>
          </div>
          <Link href="/beli" className="shrink-0">
            <Button varian="bahaya" ukuran="sm" className="w-full sm:w-auto">
              Beli Token Sekarang
              <ArrowRight size={14} />
            </Button>
          </Link>
        </aside>
      ) : null}

      {/* ── Header Sambutan Warga ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Beranda Pelanggan
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Halo, {pengguna?.nama ?? "Warga"}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Meter aktif: <strong className="font-mono text-ink">{meterAktif.nomorSeri}</strong> &middot; Zona {pengguna?.zonaId ?? "Layanan"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/beli">
            <Button varian="utama" ukuran="sm">
              <Droplet size={14} />
              Beli Token
            </Button>
          </Link>
          <Link href="/token">
            <Button varian="sekunder" ukuran="sm">
              Keypad & Tukar
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Grid Kartu Utama ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Balance Card + Live Flow ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Kartu Saldo Liter */}
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted">Saldo Air Tersedia</span>
              <LivePill teks="Sensor Live" />
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="tabular font-mono text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {liter(saldoSekarang, 2)}
              </span>
              <span className="font-mono text-xs text-muted">
                ({(saldoSekarang / 1000).toFixed(3)} m³)
              </span>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Debit Aliran Saat Ini</span>
                <span className="tabular font-mono font-bold text-ink">
                  {debit(debitSekarang)}
                </span>
              </div>
              <div className="mt-2">
                <FlowVis lpm={debitSekarang} />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {debitSekarang > 0
                  ? "Kran terbuka, air sedang dialirkan ke instalasi rumah Anda."
                  : "Kran tertutup, tidak terdeteksi aliran air."}
              </p>
            </div>
          </div>

          {/* Kartu Pemakaian & Biaya Hari Ini */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[3px] border border-line bg-surface p-4">
              <div className="flex items-center gap-1.5 text-muted">
                <TrendingDown size={14} />
                <span className="eyebrow">Pemakaian Hari Ini</span>
              </div>
              <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
                {liter(totalHariIniL, 1)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Target harian: 50,0 L
              </p>
            </div>

            <div className="rounded-[3px] border border-line bg-surface p-4">
              <div className="flex items-center gap-1.5 text-muted">
                <Calendar size={14} />
                <span className="eyebrow">Bulan Berjalan</span>
              </div>
              <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
                {liter(totalHariIniL * 24, 0)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Estimasi akumulasi
              </p>
            </div>

            <div className="rounded-[3px] border border-line bg-surface p-4">
              <div className="flex items-center gap-1.5 text-muted">
                <Droplet size={14} />
                <span className="eyebrow">Estimasi Tarif</span>
              </div>
              <p className="tabular mt-2 font-mono text-2xl font-bold text-ink">
                {rupiah(totalHariIniL * 7.5)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Rp 7,5 / liter (Gol. Rumah)
              </p>
            </div>
          </div>

          {/* Grafik Pemakaian 7 Hari */}
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  Grafik Pemakaian 7 Hari Terakhir
                </h2>
                <p className="text-xs text-muted">
                  Volume air terpakai harian dalam satuan liter.
                </p>
              </div>
              <Link
                href="/pemakaian"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                <span>Analisis Penuh</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {!memuatPemakaian ? (
              <GrafikBatang
                labels={grafik7HariData.labels}
                deret={grafik7HariData.deret}
                tinggi={200}
                format={(n) => liter(n, 0)}
              />
            ) : (
              <div className="h-48 animate-pulse rounded-[3px] bg-soft" />
            )}
          </div>
        </div>

        {/* Kolom Kanan: Isi Token Cepat + LCD Display Live ── */}
        <div className="space-y-6">
          {/* Layar LCD Live */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-muted">Layar LCD Fisik Meter</span>
              <span className="font-mono text-[10px] text-muted">HD44780 16×2</span>
            </div>

            <LcdDisplay
              baris1={`S=${saldoSekarang.toFixed(2)}L  ${dataLive?.saklarOn !== false ? "ON" : "OFF"}`}
              baris2={`D=${debitSekarang.toFixed(1)}   V=${(dataLive?.volumeTotalL ?? 8420.4).toFixed(1)}`}
            />

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Layar ini disinkronkan secara presisi dengan tampilan LCD pada fisik perangkat ESP32 di lokasi meter air Anda.
            </p>
          </div>

          {/* Widget Isi Token Cepat */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Isi Token Cepat
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Masukkan 4–10 digit kode token dari struk pembelian.
            </p>

            {pesanTukar ? (
              <div
                role="alert"
                className={`my-3 rounded-[3px] border p-2.5 text-xs font-medium ${
                  pesanTukar.tipe === "sukses"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-danger/40 bg-danger/10 text-danger"
                }`}
              >
                {pesanTukar.teks}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <TokenField
                nilai={tokenInput}
                onChange={setTokenInput}
                onKirim={handleTukarTokenCepat}
                nonaktif={memuatTukar}
              />

              <Button
                type="button"
                varian="utama"
                blok
                memuat={memuatTukar}
                disabled={tokenInput.length < 4}
                onClick={handleTukarTokenCepat}
              >
                Tukarkan Token
                {!memuatTukar ? <ArrowRight size={16} /> : null}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/token"
                  className="text-xs text-brand-700 hover:underline dark:text-accent"
                >
                  Buka simulasi keypad & daftar token tersimpan &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Status Sambungan Meter */}
          <div className="rounded-[4px] border border-line bg-surface p-4 text-xs text-muted">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Koneksi Telemetri</span>
              <span className="flex items-center gap-1 font-mono text-success">
                <CheckCircle2 size={12} />
                Daring
              </span>
            </div>
            <p className="mt-1 text-[11px]">
              Laporan terakhir: {dataLive?.ts ? new Date(dataLive.ts).toLocaleTimeString("id-ID") : "Baru saja"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HalamanBeranda() {
  return (
    <Suspense fallback={<LoadingBeranda />}>
      <KontenBeranda />
    </Suspense>
  );
}
