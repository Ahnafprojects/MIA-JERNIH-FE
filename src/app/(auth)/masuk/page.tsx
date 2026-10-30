"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "@/lib/auth-tipe";

export default function HalamanMasuk() {
  const router = useRouter();
  const { masukDenganAkses } = useAuth();

  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [ingat, setIngat] = useState(false);
  const [lihatSandi, setLihatSandi] = useState(false);

  const [butuhKode, setButuhKode] = useState(false);
  const [kodeDigit, setKodeDigit] = useState("");

  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const navigasiSetelahMasuk = (peran: string, jumlahMeter: number) => {
    if (peran === "WARGA") {
      if (jumlahMeter > 0) {
        router.push("/beranda");
      } else {
        router.push("/hubungkan-meter");
      }
    } else {
      router.push("/konsol");
    }
  };

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat(null);
    setMemuat(true);

    try {
      const res = await api<{
        step?: string;
        email?: string;
        accessToken?: string;
        pengguna?: Pengguna;
      }>("/api/auth/masuk", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          kataSandi,
          ingat,
        }),
      });

      if (res.step === "KODE_EMAIL") {
        setButuhKode(true);
        return;
      }

      if (res.accessToken && res.pengguna) {
        const meters = await masukDenganAkses(res.accessToken, res.pengguna);
        navigasiSetelahMasuk(res.pengguna.peran, meters.length);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal menghubungkan ke server. Coba lagi beberapa saat.");
      }
    } finally {
      setMemuat(false);
    }
  };

  const handleVerifikasiKodeMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kodeDigit.length < 6) {
      setPesanGalat("Masukkan 6 digit kode verifikasi.");
      return;
    }

    setPesanGalat(null);
    setMemuat(true);

    try {
      const res = await api<{
        accessToken: string;
        pengguna: Pengguna;
      }>("/api/auth/masuk/kode", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          kode: kodeDigit,
        }),
      });

      if (res.accessToken && res.pengguna) {
        const meters = await masukDenganAkses(res.accessToken, res.pengguna);
        navigasiSetelahMasuk(res.pengguna.peran, meters.length);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memverifikasi kode masuk.");
      }
    } finally {
      setMemuat(false);
    }
  };

  return (
    <AuthShell
      judul={butuhKode ? "Verifikasi Perangkat Baru" : "Masuk ke Jernih"}
      keterangan={
        butuhKode
          ? `Perangkat ini baru pertama kali digunakan. Masukkan 6 digit kode yang dikirim ke email ${email}.`
          : "Satu pintu masuk untuk seluruh peran warga dan petugas."
      }
    >
      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </div>
      ) : null}

      {!butuhKode ? (
        <form onSubmit={handleMasuk} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={memuat}
          />

          <TextField
            label="Kata Sandi"
            type={lihatSandi ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={kataSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKataSandi(e.target.value)}
            disabled={memuat}
            kananLabel={
              <Link
                href="/lupa-sandi"
                className="text-xs font-medium text-brand-700 hover:underline dark:text-accent"
              >
                Lupa sandi?
              </Link>
            }
            belakang={
              <button
                type="button"
                onClick={() => setLihatSandi(!lihatSandi)}
                className="text-muted hover:text-ink"
                aria-label={lihatSandi ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {lihatSandi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              id="ingat"
              type="checkbox"
              checked={ingat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIngat(e.target.checked)}
              disabled={memuat}
              className="size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="ingat" className="text-xs text-muted">
              Ingat perangkat ini
            </label>
          </div>

          <Button
            type="submit"
            varian="utama"
            blok
            memuat={memuat}
          >
            Masuk
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>

          <div className="takar mt-6 pt-4 text-center text-xs text-muted">
            Belum punya akun warga?{" "}
            <Link
              href="/daftar"
              className="font-semibold text-brand-700 hover:underline dark:text-accent"
            >
              Daftar sekarang
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifikasiKodeMasuk} className="space-y-6">
          <InputDigit
            panjang={6}
            nilai={kodeDigit}
            onChange={setKodeDigit}
            disabled={memuat}
          />

          <p className="text-[11px] text-muted text-center leading-relaxed">
            Kode keamanan 6 digit telah dikirimkan ke email Anda. Cek kotak masuk atau folder spam.
          </p>

          <Button
            type="submit"
            varian="utama"
            blok
            memuat={memuat}
            disabled={kodeDigit.length < 6}
          >
            Lanjutkan Masuk
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setButuhKode(false);
                setKodeDigit("");
                setPesanGalat(null);
              }}
              className="text-xs text-muted hover:text-ink hover:underline"
            >
              Kembali ke formulir masuk
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
