"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, Keyboard, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { LcdDisplay } from "@/components/domain/lcd";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface DataMeterDitemukan {
  id: string;
  serial: string;
  label?: string | null;
  alamat?: string | null;
  zona?: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: string;
  saklarOn: boolean;
}

export default function HalamanHubungkanMeter() {
  const router = useRouter();
  const { muatUlangData } = useAuth();

  const [metode, setMetode] = useState<"ketik" | "pindai">("ketik");
  const [targetId, setTargetId] = useState("");
  const [memuatCari, setMemuatCari] = useState(false);
  const [memuatHubung, setMemuatHubung] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  // Status izin kamera untuk scanner QR
  const [izinKamera, setIzinKamera] = useState<"belum" | "minta" | "diberikan" | "ditolak">("belum");

  // State data meter jika ditemukan
  const [meterDitemukan, setMeterDitemukan] = useState<DataMeterDitemukan | null>(null);

  const cariMeter = async (id: string) => {
    if (!id.trim()) {
      setPesanGalat("Masukkan ID Pelanggan atau nomor seri meter.");
      return;
    }

    setPesanGalat(null);
    setMemuatCari(true);

    try {
      const res = await api<{ meter: DataMeterDitemukan }>(`/api/meter/${encodeURIComponent(id.trim())}`);
      setMeterDitemukan(res.meter);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "BUKAN_PEMILIK_METER" || err.status === 403) {
          setPesanGalat("Meter ini sudah terhubung ke akun lain. Hubungi kantor layanan PDAM bila ini adalah meter Anda.");
        } else {
          setPesanGalat(err.message);
        }
      } else {
        setPesanGalat("Meter tidak ditemukan. Periksa ID pelanggan pada stiker fisik meter.");
      }
      setMeterDitemukan(null);
    } finally {
      setMemuatCari(false);
    }
  };

  const handleMintaIzinKamera = async () => {
    setIzinKamera("minta");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIzinKamera("ditolak");
        setPesanGalat("Perangkat Anda tidak mendukung akses kamera. Silakan ketik ID secara manual.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Matikan stream setelah tes izin berhasil
      stream.getTracks().forEach((track) => track.stop());
      setIzinKamera("diberikan");
    } catch {
      setIzinKamera("ditolak");
      setPesanGalat("Izin kamera tidak diberikan. Anda tetap dapat melanjutkan dengan mengetik ID meter secara manual di tab Ketik ID.");
    }
  };

  const handleHubungkan = async () => {
    if (!targetId.trim()) return;

    setPesanGalat(null);
    setMemuatHubung(true);

    try {
      await api("/api/meter/hubungkan", {
        method: "POST",
        body: JSON.stringify({ idPelanggan: targetId.trim() }),
      });

      await muatUlangData();
      router.push("/beranda");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "METER_SUDAH_TERHUBUNG") {
          setPesanGalat("Meter ini sudah terhubung ke akun pelanggan lain. Hubungi petugas PDAM untuk bantuan pengalihan kepemilikan.");
        } else {
          setPesanGalat(err.message);
        }
      } else {
        setPesanGalat("Gagal menghubungkan meter ke akun Anda.");
      }
    } finally {
      setMemuatHubung(false);
    }
  };

  return (
    <AuthShell
      judul="Hubungkan Meter Fisik"
      keterangan="Langkah terakhir pendaftaran: sambungkan akun dengan meter air prabayar di rumah Anda."
    >
      <StepperAuth langkahAktif={3} />

      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 p-3 text-xs leading-relaxed font-medium text-danger"
        >
          <div className="flex gap-2">
            <AlertCircle size={16} className="shrink-0 text-danger" />
            <span>{pesanGalat}</span>
          </div>
        </div>
      ) : null}

      {/* Pemilih Tab Metode */}
      <div className="mb-6 flex rounded-[3px] border border-line bg-soft p-1">
        <button
          type="button"
          onClick={() => {
            setMetode("ketik");
            setPesanGalat(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[2px] py-2 text-xs font-semibold transition-colors ${
            metode === "ketik"
              ? "bg-surface text-ink shadow-xs"
              : "text-muted hover:text-ink"
          }`}
        >
          <Keyboard size={15} />
          <span>Ketik ID Pelanggan</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMetode("pindai");
            setPesanGalat(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[2px] py-2 text-xs font-semibold transition-colors ${
            metode === "pindai"
              ? "bg-surface text-ink shadow-xs"
              : "text-muted hover:text-ink"
          }`}
        >
          <QrCode size={15} />
          <span>Pindai QR Meter</span>
        </button>
      </div>

      {metode === "ketik" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cariMeter(targetId);
          }}
          className="space-y-4"
        >
          <TextField
            label="ID Pelanggan / Nomor Seri Meter"
            type="text"
            required
            placeholder="Contoh: P0001 atau JRN-10000"
            value={targetId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetId(e.target.value)}
            disabled={memuatCari || memuatHubung}
            hint="Lihat stiker barcode atau plat kuningan di badan meter air Anda."
          />

          <Button
            type="submit"
            varian="sekunder"
            blok
            memuat={memuatCari}
          >
            Cari & Periksa Meter
          </Button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          {izinKamera === "belum" || izinKamera === "minta" ? (
            <div className="rounded-[3px] border border-dashed border-line p-6">
              <QrCode size={36} className="mx-auto text-brand-600 dark:text-accent" />
              <p className="mt-3 text-xs font-medium text-ink">
                Akses Kamera untuk Pemindai QR
              </p>
              <p className="mt-1 text-[11px] text-muted text-balance">
                Kamera hanya dipakai untuk membaca kode QR pada stiker fisik meter. Jernih tidak pernah merekam atau menyimpan video.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  varian="utama"
                  ukuran="sm"
                  onClick={handleMintaIzinKamera}
                  memuat={izinKamera === "minta"}
                >
                  Izinkan Kamera & Pindai
                </Button>
              </div>
            </div>
          ) : izinKamera === "diberikan" ? (
            <div className="rounded-[3px] border border-line bg-surface p-4 text-center">
              <div className="mx-auto flex size-44 items-center justify-center rounded-[3px] border-2 border-dashed border-brand-500 bg-brand-500/5">
                <div className="text-center p-3">
                  <div className="inline-block animate-pulse text-xs font-semibold text-brand-700 dark:text-accent">
                    Arahkan kamera ke stiker QR meter
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetId("P0001");
                        cariMeter("P0001");
                      }}
                      className="rounded-[2px] bg-brand-500/10 px-2 py-1 font-mono text-[11px] font-bold text-brand-700 hover:bg-brand-500/20 dark:text-accent"
                    >
                      Simulasi Deteksi: P0001
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[3px] border border-warn/30 bg-warn/10 p-4 text-xs text-ink text-left">
              <p className="font-semibold text-warn">Izin kamera tidak tersedia</p>
              <p className="mt-1 text-muted">
                Silakan beralih ke tab <strong>Ketik ID Pelanggan</strong> di atas untuk memasukkan nomor meter secara manual.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pratinjau Meter Ditemukan dengan LCD Live */}
      {meterDitemukan ? (
        <div className="mt-6 space-y-4 rounded-[4px] border border-brand-500/30 bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="font-mono text-[11px] font-bold text-brand-600 uppercase tracking-wider dark:text-accent">
                Meter Ditemukan
              </span>
              <h3 className="font-mono text-base font-bold text-ink">
                {meterDitemukan.serial} ({meterDitemukan.id})
              </h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-[2px] bg-success/10 px-2 py-1 font-mono text-xs font-semibold text-success">
              <CheckCircle2 size={13} />
              <span>Daring</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-muted">
            <p>
              <strong className="text-ink">Alamat:</strong> {meterDitemukan.alamat || "—"}
            </p>
            <p>
              <strong className="text-ink">Zona Distribusi:</strong> {meterDitemukan.zona || "—"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold text-ink">
              Layar LCD Fisik Saat Ini (Cocokkan dengan Layar Meter):
            </p>
            <LcdDisplay
              baris1={`S=${meterDitemukan.saldoL.toFixed(2)}L  ${meterDitemukan.saklarOn ? "ON" : "OFF"}`}
              baris2={`D=${meterDitemukan.debitLpm.toFixed(1)}   V=${meterDitemukan.volumeTotalL.toFixed(1)}`}
            />
          </div>

          <Button
            type="button"
            varian="utama"
            blok
            memuat={memuatHubung}
            onClick={handleHubungkan}
          >
            Ini Meter Saya, Hubungkan Sekarang
            {!memuatHubung ? <ArrowRight size={16} /> : null}
          </Button>
        </div>
      ) : null}

      <div className="takar-kepala mt-8 pt-4 text-center text-xs text-muted">
        <Link
          href="/beranda"
          className="text-muted hover:text-ink hover:underline"
        >
          Lewati untuk sementara (Buka Beranda)
        </Link>
      </div>
    </AuthShell>
  );
}
