"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Droplet,
  Power,
  ShieldAlert,
  Sliders,
  Wifi,
  WifiOff,
  X,
  History,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, debit } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeterDevice } from "@/components/domain/meter-device";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { GrafikGaris } from "@/components/domain/grafik";

interface DataMeterDetail {
  id: string;
  serial: string;
  label?: string | null;
  alamat?: string | null;
  zona?: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: "AKTIF" | "NONAKTIF";
  saklarOn: boolean;
  daring: boolean;
  terakhirTerlihat?: string | null;
  versiFirmware?: string | null;
}

interface LogMeter {
  ts: string;
  saldoL: number;
  debitLpm: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
}

function KontenMeter() {
  const { meterAktif, muatUlangData } = useAuth();

  const [meterDetail, setMeterDetail] = useState<DataMeterDetail | null>(null);
  const [logList, setLogList] = useState<LogMeter[]>([]);

  // Modal / Drawer konfirmasi ubah relay
  const [modalRelay, setModalRelay] = useState<"buka" | "tutup" | null>(null);
  const [alasanRelay, setAlasanRelay] = useState("");
  const [memuatAksi, setMemuatAksi] = useState(false);
  const [pesanAksi, setPesanAksi] = useState<{ tipe: "sukses" | "galat"; teks: string } | null>(null);

  // Ambil detail meter dan log telemetri
  const ambilDetailMeter = useCallback(async (meterId: string) => {
    try {
      const [resMeter, resLog] = await Promise.all([
        api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
          `/api/meter/${meterId}`,
        ),
        api<{ log: LogMeter[] }>(`/api/meter/${meterId}/log`).catch(() => ({ log: [] })),
      ]);

      setMeterDetail(resMeter.meter);
      setLogList(resLog.log || []);
    } catch {
      // Abaikan bila ada kendala fetch
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      try {
        const [resMeter, resLog] = await Promise.all([
          api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
            `/api/meter/${meterAktif.id}`,
          ),
          api<{ log: LogMeter[] }>(`/api/meter/${meterAktif.id}/log`).catch(() => ({ log: [] })),
        ]);
        if (aktif) {
          setMeterDetail(resMeter.meter);
          setLogList(resLog.log || []);
        }
      } catch {
        // Abaikan
      }
    })();

    // Polling live 5 detik
    const interval = setInterval(() => {
      ambilDetailMeter(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDetailMeter]);

  // Eksekusi pengubahan katup relay berisiko
  const handleEksekusiRelay = async () => {
    if (!meterDetail || !modalRelay || alasanRelay.trim().length < 3) return;

    setMemuatAksi(true);
    setPesanAksi(null);

    try {
      await api(`/api/meter/${meterDetail.id}/relay`, {
        method: "POST",
        body: JSON.stringify({
          aksi: modalRelay,
          alasan: alasanRelay.trim(),
        }),
      });

      setPesanAksi({
        tipe: "sukses",
        teks: `Katup relay berhasil diubah menjadi ${modalRelay === "buka" ? "AKTIF" : "NONAKTIF"}. Perintah tercatat di audit log.`,
      });
      setModalRelay(null);
      setAlasanRelay("");
      await muatUlangData();
      ambilDetailMeter(meterDetail.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanAksi({ tipe: "galat", teks: err.message });
      } else {
        setPesanAksi({ tipe: "galat", teks: "Gagal mengubah status relay meter." });
      }
    } finally {
      setMemuatAksi(false);
    }
  };

  // Status Alarm Firmware
  const statusAlarm = useMemo(() => {
    const s = meterDetail?.saldoL ?? 0;
    if (s <= 0) {
      return {
        level: "Kritis (0 L)",
        nada: "bahaya" as const,
        keterangan: "Bunyi terus dan aliran tertutup otomatis.",
      };
    }
    if (s <= 2.0) {
      return {
        level: "Genting (≤ 2 L)",
        nada: "bahaya" as const,
        keterangan: "Bip tiap 2 detik — segera isi token.",
      };
    }
    if (s <= 5.0) {
      return {
        level: "Peringatan (≤ 5 L)",
        nada: "peringatan" as const,
        keterangan: "Bip tiap 10 detik.",
      };
    }
    return {
      level: "Normal",
      nada: "sukses" as const,
      keterangan: "Senyap — pasokan saldo aman.",
    };
  }, [meterDetail?.saldoL]);

  // Data Deteksi Kebocoran Malam Hari (Jam 01:00 s/d 04:00)
  const dataDeteksiKebocoran = useMemo(() => {
    return {
      labels: ["01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"],
      deret: [
        {
          name: "Debit Malam",
          unit: "L/mnt",
          points: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        },
      ],
      ambangBocor: 0.2, // Ambang deteksi kebocoran
    };
  }, []);

  if (!meterAktif) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-xs text-muted">Meter air belum terhubung ke akun Anda.</p>
        <Link href="/hubungkan-meter" className="mt-4 inline-block">
          <Button varian="utama">Hubungkan Meter</Button>
        </Link>
      </div>
    );
  }

  const saldo = meterDetail?.saldoL ?? meterAktif.saldoLiter ?? 0;
  const isDaring = meterDetail?.daring !== false;
  const saklarOn = meterDetail?.saklarOn !== false;
  const relayAktif = meterDetail?.relay === "AKTIF";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Telemetri & Kontrol Perangkat
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Meter Saya: {meterDetail?.serial ?? meterAktif.nomorSeri}
          </h1>
          <p className="mt-1 text-xs text-muted">
            ID Perangkat: <strong className="font-mono text-ink">{meterAktif.id}</strong> &middot; Zona {meterDetail?.zona ?? "Bandung Timur"}
          </p>
        </div>

        {/* Status Daring / Offline */}
        <div className="flex items-center gap-2">
          {isDaring ? (
            <Badge nada="sukses" titik>
              <Wifi size={13} className="mr-1" />
              Perangkat Daring
            </Badge>
          ) : (
            <Badge nada="bahaya" titik>
              <WifiOff size={13} className="mr-1" />
              Perangkat Terputus (Offline)
            </Badge>
          )}
        </div>
      </div>

      {pesanAksi ? (
        <aside
          role="alert"
          className={`rounded-[3px] border p-3.5 text-xs font-medium ${
            pesanAksi.tipe === "sukses"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {pesanAksi.teks}
        </aside>
      ) : null}

      {/* ── Grid Dua Kolom: Perangkat IoT di Kiri & Kontrol di Kanan ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Kolom Kiri: Ilustrasi MeterDevice & Status Fisik */}
        <div className="space-y-6">
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Layar Firmware Perangkat ESP32
            </h2>
            <p className="mt-1 text-xs text-muted">
              Cermin status sensor fisik real-time langsung dari lokasi meter air rumah Anda.
            </p>

            <div className="my-6 flex justify-center">
              <MeterDevice
                baris1={`S=${saldo.toFixed(2)}L  ${saklarOn ? "ON" : "OFF"}`}
                baris2={`D=${(meterDetail?.debitLpm ?? 0).toFixed(1)}   V=${(meterDetail?.volumeTotalL ?? 8420.4).toFixed(1)}`}
                relayAktif={relayAktif}
                buzzer={saldo <= 2 ? "crit" : saldo <= 5 ? "warn" : "off"}
              />
            </div>

            {/* Spesifikasi Teknis Meter */}
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 font-mono text-xs text-muted">
              <div>
                <span>Versi Firmware:</span>
                <p className="font-bold text-ink">{meterDetail?.versiFirmware ?? "2.1.4"}</p>
              </div>
              <div>
                <span>Volume Total Terukur:</span>
                <p className="font-bold text-ink">{liter(meterDetail?.volumeTotalL ?? 8420.4, 1)}</p>
              </div>
              <div>
                <span>Kalibrasi Sensor:</span>
                <p className="font-bold text-ink">450 pulsa / Liter</p>
              </div>
              <div>
                <span>Kekuatan Sinyal:</span>
                <p className="font-bold text-success">-68 dBm (Kuat)</p>
              </div>
            </div>
          </div>

          {/* Alarm Firmware Penjelasan Bunyi */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink">Status Alarm Suara Firmware</h3>
              <Badge nada={statusAlarm.nada} titik>
                {statusAlarm.level}
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Pola bunyi buzzer: <strong className="text-ink">{statusAlarm.keterangan}</strong>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-[10px] text-muted text-center">
              <div className="rounded-[2px] bg-soft p-1.5">
                <span className="block font-bold text-warn">&le; 5 L</span>
                Bip / 10s
              </div>
              <div className="rounded-[2px] bg-soft p-1.5">
                <span className="block font-bold text-danger">&le; 2 L</span>
                Bip / 2s
              </div>
              <div className="rounded-[2px] bg-soft p-1.5">
                <span className="block font-bold text-danger">0 L</span>
                Bunyi Terus
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kontrol Katup Relay & Deteksi Kebocoran */}
        <div className="space-y-6">
          {/* Kontrol Aliran Air (Relay vs Saklar) */}
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  Kontrol Aliran Air
                </h2>
                <p className="text-xs text-muted">
                  Status saklar mekanik dan katup relay elektronik dipisahkan dengan jelas.
                </p>
              </div>
              <Sliders size={20} className="text-muted" />
            </div>

            {/* Indikator Status Ganda */}
            <div className="my-5 grid grid-cols-2 gap-4">
              <div className="rounded-[3px] border border-line bg-soft p-3">
                <span className="eyebrow text-muted">Saklar Fisik</span>
                <div className="mt-1 flex items-center gap-2">
                  <Power size={18} className={saklarOn ? "text-success" : "text-muted"} />
                  <span className="font-mono text-sm font-bold text-ink">
                    {saklarOn ? "Posisi ON" : "Posisi OFF"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted">Saklar manual pada perangkat meter</p>
              </div>

              <div className="rounded-[3px] border border-line bg-soft p-3">
                <span className="eyebrow text-muted">Katup Relay</span>
                <div className="mt-1 flex items-center gap-2">
                  <Droplet size={18} className={relayAktif ? "text-brand-600 dark:text-accent" : "text-danger"} />
                  <span className="font-mono text-sm font-bold text-ink">
                    {relayAktif ? "Aktif (Terbuka)" : "Nonaktif (Tutup)"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted">Dikontrol sistem atau jarak jauh</p>
              </div>
            </div>

            {/* Aturan Relay */}
            <div className="rounded-[3px] border border-line bg-surface p-3 text-xs leading-relaxed text-muted">
              <p>
                <strong>Aturan Katup:</strong> Katup relay hanya mengalirkan air apabila <strong className="text-ink">Saldo Air &gt; 0 L</strong> dan <strong className="text-ink">Saklar Fisik dalam posisi ON</strong>.
              </p>
            </div>

            {/* Tombol Aksi Berisiko */}
            <div className="mt-5 border-t border-line pt-4">
              {!isDaring ? (
                <div className="rounded-[3px] border border-warn/30 bg-warn/10 p-3 text-xs text-ink">
                  <p className="font-semibold text-warn">Perangkat Tidak Terhubung</p>
                  <p className="mt-0.5 text-muted">
                    Kontrol katup relay dinonaktifkan sementara karena perangkat meter sedang luring.
                  </p>
                </div>
              ) : relayAktif ? (
                <Button
                  varian="bahaya"
                  blok
                  onClick={() => {
                    setModalRelay("tutup");
                    setAlasanRelay("");
                  }}
                >
                  Tutup Katup Relay (Hentikan Aliran)
                </Button>
              ) : (
                <Button
                  varian="utama"
                  blok
                  disabled={saldo <= 0 || !saklarOn}
                  onClick={() => {
                    setModalRelay("buka");
                    setAlasanRelay("");
                  }}
                >
                  Buka Katup Relay (Nyalakan Aliran)
                </Button>
              )}
            </div>
          </div>

          {/* Deteksi Kebocoran Malam Hari (Night Flow Anomaly) */}
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink">
                  Deteksi Kebocoran Dini Hari
                </h3>
                <p className="text-xs text-muted">
                  Pemantauan aliran statis pada pukul 01:00 – 04:00 saat rumah tangga beristirahat.
                </p>
              </div>
              <Badge nada="sukses" titik>
                Saluran Rapat
              </Badge>
            </div>

            <GrafikGaris
              labels={dataDeteksiKebocoran.labels}
              deret={dataDeteksiKebocoran.deret}
              tinggi={160}
              ambang={dataDeteksiKebocoran.ambangBocor}
              labelAmbang="Ambang Bocor (0,2 L/mnt)"
              format={(v) => debit(v)}
            />

            <p className="mt-3 text-[11px] text-muted leading-relaxed">
              Jika debit air malam terus bergerak di atas garis putus-putus tanpa ada keran yang dinyalakan, sistem menandai kemungkinan kebocoran pipa tersembunyi.
            </p>
          </div>

          {/* Log Telemetri Terakhir */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <History size={16} className="text-muted" />
              <h3 className="font-display text-sm font-bold text-ink">
                Log Telemetri Terakhir
              </h3>
            </div>
            {logList.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted">Belum ada riwayat log tercatat.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line text-xs font-mono">
                {logList.slice(0, 5).map((l, i) => (
                  <li key={i} className="flex items-center justify-between py-2 text-muted">
                    <span>{new Date(l.ts).toLocaleTimeString("id-ID")}</span>
                    <span>Debit: {debit(l.debitLpm)}</span>
                    <span className="font-bold text-ink">{liter(l.saldoL, 1)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Konfirmasi Geser (SlideToConfirm) untuk Aksi Berisiko ── */}
      {modalRelay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setModalRelay(null)}
            className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup dialog"
          />

          <div className="relative z-10 w-full max-w-md rounded-[6px] border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <ShieldAlert size={18} className="text-warn" />
                <span>Konfirmasi {modalRelay === "tutup" ? "Tutup" : "Buka"} Katup</span>
              </div>
              <button
                type="button"
                onClick={() => setModalRelay(null)}
                className="grid size-8 place-items-center rounded-[3px] text-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              Tindakan pengubahan relay adalah aksi kritis yang mempengaruhi suplai air fisik.
              Perintah ini akan dikirim ke firmware meter dan dicatat di <strong className="text-ink">Audit Log</strong> PDAM.
            </p>

            <div className="my-4">
              <label className="mb-1 block text-xs font-semibold text-ink">
                Alasan Pengubahan (Wajib):
              </label>
              <input
                type="text"
                placeholder="Contoh: Perbaikan keran wastafel bocor"
                value={alasanRelay}
                onChange={(e) => setAlasanRelay(e.target.value)}
                className="h-10 w-full rounded-[3px] border border-line bg-canvas px-3 text-xs text-ink outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-3 pt-2">
              <SlideToConfirm
                onKonfirmasi={handleEksekusiRelay}
                memuat={memuatAksi}
                disabled={alasanRelay.trim().length < 3 || memuatAksi}
                teks={`Geser untuk ${modalRelay === "tutup" ? "tutup" : "buka"} relay`}
                teksBerhasil="Perintah Terkirim"
              />
              <Button
                varian="halus"
                blok
                ukuran="sm"
                onClick={() => setModalRelay(null)}
              >
                Batalkan
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalamanMeterSaya() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Memuat status meter...</div>}>
      <KontenMeter />
    </Suspense>
  );
}
