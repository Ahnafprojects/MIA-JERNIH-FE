"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, RotateCw } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "@/lib/auth-tipe";

function KontenVerifikasi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { masukDenganAkses } = useAuth();

  const emailParam = searchParams.get("email");
  const email = useMemo(() => {
    if (emailParam) return emailParam;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("jernih_email_daftar") ?? "";
    }
    return "";
  }, [emailParam]);

  const [kode, setKode] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const [hitungMundur, setHitungMundur] = useState(60);
  const [sedangKirimUlang, setSedangKirimUlang] = useState(false);

  const bisaKirimUlang = hitungMundur <= 0;

  useEffect(() => {
    if (hitungMundur <= 0) return;
    const timer = setInterval(() => {
      setHitungMundur((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hitungMundur]);

  const handleVerifikasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kode.length < 6) {
      setPesanGalat("Masukkan seluruh 6 digit kode.");
      return;
    }
    if (!email) {
      setPesanGalat("Email tidak ditemukan. Silakan mendaftar kembali.");
      return;
    }

    setPesanGalat(null);
    setMemuat(true);

    try {
      const res = await api<{
        accessToken: string;
        pengguna: Pengguna;
      }>("/api/auth/verifikasi-email", {
        method: "POST",
        body: JSON.stringify({ email, kode }),
      });

      masukDenganAkses(res.accessToken, res.pengguna);
      router.push("/hubungkan-meter");
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memverifikasi kode verifikasi.");
      }
    } finally {
      setMemuat(false);
    }
  };

  const handleKirimUlang = async () => {
    if (!bisaKirimUlang || sedangKirimUlang || !email) return;

    setSedangKirimUlang(true);
    setPesanGalat(null);

    try {
      await api("/api/auth/kirim-ulang-kode", {
        method: "POST",
        body: JSON.stringify({ email, tujuan: "daftar" }),
      });
      setHitungMundur(60);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal mengirim ulang kode.");
      }
    } finally {
      setSedangKirimUlang(false);
    }
  };

  return (
    <AuthShell
      judul="Verifikasi Email Anda"
      keterangan={`Kami mengirimkan 6 digit kode rahasia ke alamat ${email || "email Anda"}.`}
    >
      <StepperAuth langkahAktif={2} />

      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </div>
      ) : null}

      <form onSubmit={handleVerifikasi} className="space-y-6">
        <div>
          <label className="mb-2 block text-xs font-medium text-ink">
            Kode Verifikasi 6 Digit
          </label>
          <InputDigit
            panjang={6}
            nilai={kode}
            onChange={setKode}
            disabled={memuat}
          />
        </div>

        <Button
          type="submit"
          varian="utama"
          blok
          memuat={memuat}
          disabled={kode.length < 6}
        >
          Verifikasi & Lanjut
          {!memuat ? <ArrowRight size={16} /> : null}
        </Button>

        <div className="space-y-3 pt-2 text-center text-xs">
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted">Tidak menerima kode?</span>
            {bisaKirimUlang ? (
              <button
                type="button"
                onClick={handleKirimUlang}
                disabled={sedangKirimUlang}
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                <RotateCw size={12} className={sedangKirimUlang ? "animate-spin" : ""} />
                <span>Kirim ulang</span>
              </button>
            ) : (
              <span className="font-mono text-muted">
                Kirim ulang dalam {hitungMundur}s
              </span>
            )}
          </div>

          <div>
            <Link
              href="/daftar"
              className="text-muted hover:text-ink hover:underline"
            >
              Salah memasukkan email? Ganti email
            </Link>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

export default function HalamanVerifikasi() {
  return (
    <Suspense fallback={null}>
      <KontenVerifikasi />
    </Suspense>
  );
}
