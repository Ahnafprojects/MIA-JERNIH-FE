"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Keyboard,
  QrCode,
} from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { Button } from "@/components/ui/button";
import { LcdDisplay } from "@/components/domain/lcd";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";

import { KolomTeks } from "../_bagian/kolom-teks";
import { KotakGalat } from "../_bagian/kotak-galat";

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
  const { pengguna, muatUlangData } = useAuth();

  useEffect(() => {
    if (!pengguna) router.replace("/masuk");
  }, [pengguna, router]);

  const [metode, setMetode] = useState<"ketik" | "pindai">("ketik");
  const [targetId, setTargetId] = useState("");
  const [memuatCari, setMemuatCari] = useState(false);
  const [memuatHubung, setMemuatHubung] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const [izinKamera, setIzinKamera] = useState<
    "belum" | "minta" | "diberikan" | "ditolak"
  >("belum");

  const [meterDitemukan, setMeterDitemukan] =
    useState<DataMeterDitemukan | null>(null);

  const cariMeter = async (id: string) => {
    if (!id.trim()) {
      setPesanGalat("Masukkan ID pelanggan atau nomor seri meter.");
      return;
    }

    setPesanGalat(null);
    setMemuatCari(true);

    try {
      const res = await api<{ meter: DataMeterDitemukan }>(
        `/api/meter/${encodeURIComponent(id.trim())}`,
      );
      setMeterDitemukan(res.meter);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "BUKAN_PEMILIK_METER" || err.status === 403) {
          setPesanGalat(
            "Meter ini sudah terhubung ke akun lain. Hubungi kantor layanan PDAM bila ini memang meter Anda.",
          );
        } else {
          setPesanGalat(err.message);
        }
      } else {
        setPesanGalat(
          "Meter tidak ditemukan. Periksa ID pelanggan pada stiker fisik meter.",
        );
      }
      setMeterDitemukan(null);
    } finally {
      setMemuatCari(false);
    }
  };

  const handleMintaIzinKamera = async () => {
    setIzinKamera("minta");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setIzinKamera("ditolak");
        setPesanGalat(
          "Perangkat ini tidak mendukung akses kamera. Ketik ID meter secara manual.",
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      // Stream dimatikan begitu izinnya terbukti ada; halaman ini hanya
      // perlu tahu izinnya diberikan, bukan merekam apa pun.
      stream.getTracks().forEach((track) => track.stop());
      setIzinKamera("diberikan");
    } catch {
      setIzinKamera("ditolak");
      setPesanGalat(
        "Izin kamera tidak diberikan. Anda tetap bisa melanjutkan lewat tab Ketik ID.",
      );
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
          setPesanGalat(
            "Meter ini sudah terhubung ke akun lain. Hubungi petugas PDAM untuk pengalihan kepemilikan.",
          );
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

  const kelasTab = (aktif: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-[7px] px-3 py-2.5",
      "text-[13px] font-semibold whitespace-nowrap transition-all duration-200",
      aktif
        ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
        : "text-muted hover:text-ink",
    );

  return (
    <AuthShell
      judul="Hubungkan meter fisik"
      keterangan="Sambungkan akun Anda dengan meter air prabayar yang terpasang di rumah."
      langkah="Langkah 3 dari 3"
    >
      <StepperAuth langkahAktif={3} />

      {/*
        Keterangan bahwa langkah ini BOLEH DILEWATI, ditaruh paling atas.

        Akun baru sudah menerima meter bawaan begitu verifikasi email
        selesai, jadi portalnya sudah bisa dipakai tanpa mengisi apa pun di
        sini. Sebelumnya halaman ini berbunyi "langkah terakhir pendaftaran"
        dan satu-satunya jalan keluarnya tertulis kecil di dasar halaman —
        warga yang tidak hafal nomor meternya menyimpulkan pendaftarannya
        belum selesai dan berhenti di sini. Itu jalan buntu yang sudah
        diperbaiki di sisi server; teksnya harus ikut diperbaiki.
      */}
      <div className="cekung mb-5 flex items-start gap-3 p-3.5">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
        <p className="text-[13px] leading-relaxed text-muted">
          <strong className="text-ink">Akun Anda sudah aktif.</strong> Langkah
          ini hanya untuk menambahkan meter fisik, dan bisa dilewati kapan saja.
        </p>
      </div>

      <KotakGalat pesan={pesanGalat} />

      <div className="cekung mb-5 flex gap-1 p-1">
        <button
          type="button"
          onClick={() => {
            setMetode("ketik");
            setPesanGalat(null);
          }}
          aria-pressed={metode === "ketik"}
          className={kelasTab(metode === "ketik")}
        >
          <Keyboard size={15} />
          <span>Ketik ID</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMetode("pindai");
            setPesanGalat(null);
          }}
          aria-pressed={metode === "pindai"}
          className={kelasTab(metode === "pindai")}
        >
          <QrCode size={15} />
          <span>Pindai QR</span>
        </button>
      </div>

      {metode === "ketik" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void cariMeter(targetId);
          }}
          className="space-y-4"
          noValidate
        >
          <KolomTeks
            label="ID pelanggan atau nomor seri"
            type="text"
            required
            placeholder="Contoh: P0001 atau JRN-10000"
            value={targetId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTargetId(e.target.value)
            }
            disabled={memuatCari || memuatHubung}
            hint="Tertera pada stiker barcode atau plat di badan meter air."
          />

          <Button type="submit" varian="sekunder" ukuran="lg" blok memuat={memuatCari}>
            <span className="whitespace-nowrap">Cari meter</span>
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {izinKamera === "belum" || izinKamera === "minta" ? (
            <div className="cekung p-6 text-center">
              <QrCode size={34} className="mx-auto text-brand-700" />
              <p className="mt-3 text-[13px] font-semibold text-ink">
                Izinkan kamera untuk memindai
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-balance text-muted">
                Kamera hanya dipakai membaca kode QR pada stiker meter. Jernih
                tidak merekam maupun menyimpan video.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  varian="utama"
                  onClick={handleMintaIzinKamera}
                  memuat={izinKamera === "minta"}
                >
                  <span className="whitespace-nowrap">Izinkan kamera</span>
                </Button>
              </div>
            </div>
          ) : izinKamera === "diberikan" ? (
            <div className="permukaan p-4 text-center">
              <div className="cekung mx-auto grid size-44 place-items-center">
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-brand-700">
                    Arahkan ke stiker QR meter
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetId("P0001");
                      void cariMeter("P0001");
                    }}
                    className="mt-4 rounded-[8px] bg-brand-50 px-2.5 py-1.5 font-mono text-[11px] font-bold whitespace-nowrap text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    Simulasi deteksi: P0001
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-card border border-warn/40 bg-warn-soft p-4 text-left">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-warn">
                <AlertCircle size={15} className="shrink-0" />
                Izin kamera tidak tersedia
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Beralih ke tab <strong className="text-ink">Ketik ID</strong> di
                atas untuk memasukkan nomor meter secara manual.
              </p>
            </div>
          )}
        </div>
      )}

      {meterDitemukan ? (
        <div className="permukaan mt-5 space-y-4 border-brand-500/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line pb-3">
            <div className="min-w-0">
              <p className="eyebrow text-muted">Meter ditemukan</p>
              <h3 className="truncate font-mono text-base font-bold text-ink">
                {meterDitemukan.serial}
              </h3>
              <p className="font-mono text-[11px] text-muted">
                {meterDitemukan.id}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-success/40 bg-success-soft px-2 py-1 font-mono text-[11px] font-bold text-success">
              <CheckCircle2 size={12} />
              Daring
            </span>
          </div>

          <dl className="space-y-1.5 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-muted">Alamat</dt>
              <dd className="text-right text-ink">
                {meterDitemukan.alamat || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-muted">Zona</dt>
              <dd className="text-right text-ink">
                {meterDitemukan.zona || "—"}
              </dd>
            </div>
          </dl>

          <div>
            <p className="mb-1.5 text-[12.5px] font-semibold text-ink">
              Cocokkan dengan layar di meter Anda
            </p>
            <LcdDisplay
              baris1={`S=${meterDitemukan.saldoL.toFixed(2)}L  ${meterDitemukan.saklarOn ? "ON" : "OFF"}`}
              baris2={`D=${meterDitemukan.debitLpm.toFixed(1)}   V=${meterDitemukan.volumeTotalL.toFixed(1)}`}
            />
          </div>

          <Button
            type="button"
            varian="utama"
            ukuran="lg"
            blok
            memuat={memuatHubung}
            onClick={handleHubungkan}
          >
            <span className="whitespace-nowrap">Hubungkan meter ini</span>
            {!memuatHubung ? <ArrowRight size={16} /> : null}
          </Button>
        </div>
      ) : null}

      <div className="takar-kepala mt-7 pt-4 text-center">
        <Link
          href="/beranda"
          className="text-[13px] font-medium text-brand-700 hover:underline dark:text-accent"
        >
          Lewati, buka beranda
        </Link>
      </div>
    </AuthShell>
  );
}
