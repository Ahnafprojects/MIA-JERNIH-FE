"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "@/lib/auth-tipe";

import { KolomSandi, KolomTeks } from "../_bagian/kolom-teks";
import { KotakGalat } from "../_bagian/kotak-galat";

export default function HalamanMasuk() {
  const router = useRouter();
  const { masukDenganAkses } = useAuth();

  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [ingat, setIngat] = useState(false);

  const [butuhKode, setButuhKode] = useState(false);
  const [kodeDigit, setKodeDigit] = useState("");

  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const navigasiSetelahMasuk = (peran: string, jumlahMeter: number) => {
    if (peran !== "WARGA") {
      router.push("/konsol");
      return;
    }
    /*
     * Warga tanpa meter diarahkan ke /hubungkan-meter, tetapi itu keadaan
     * yang seharusnya jarang: akun baru sudah menerima meter bawaan begitu
     * verifikasi email selesai. Jalur ini tersisa sebagai jaring pengaman
     * bila pembuatan meter bawaan gagal, bukan sebagai alur normal.
     */
    router.push(jumlahMeter > 0 ? "/beranda" : "/hubungkan-meter");
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
      const res = await api<{ accessToken: string; pengguna: Pengguna }>(
        "/api/auth/masuk/kode",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            kode: kodeDigit,
          }),
        },
      );

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
      judul={butuhKode ? "Perangkat baru" : "Masuk"}
      keterangan={
        butuhKode
          ? `Perangkat ini baru pertama kali dipakai. Masukkan 6 digit kode yang kami kirim ke ${email}.`
          : "Satu pintu masuk untuk warga dan petugas PDAM."
      }
    >
      <KotakGalat pesan={pesanGalat} />

      {!butuhKode ? (
        <form onSubmit={handleMasuk} className="space-y-4" noValidate>
          <KolomTeks
            label="Email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            disabled={memuat}
          />

          <KolomSandi
            label="Kata sandi"
            required
            autoComplete="current-password"
            placeholder="Kata sandi akun Anda"
            value={kataSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setKataSandi(e.target.value)
            }
            disabled={memuat}
            kananLabel={
              <Link
                href="/lupa-sandi"
                className="text-[13px] font-medium text-brand-700 hover:underline dark:text-accent"
              >
                Lupa sandi?
              </Link>
            }
          />

          {/*
            Keterangan "ingat perangkat" ditulis apa adanya. Tanpa itu,
            mencentangnya terasa seperti sekadar memperpanjang sesi —
            padahal yang dilewati adalah kode email untuk perangkat ini,
            dan orang berhak tahu pengaman mana yang sedang dimatikan.
          */}
          <label
            htmlFor="ingat"
            className="cekung flex cursor-pointer items-start gap-3 p-3"
          >
            <input
              id="ingat"
              type="checkbox"
              checked={ingat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIngat(e.target.checked)
              }
              disabled={memuat}
              className="mt-0.5 size-4 shrink-0 rounded-[5px] border-line-strong text-brand-600 focus:ring-brand-500"
            />
            <span className="text-[13px] leading-relaxed text-muted">
              <span className="font-semibold text-ink">Ingat perangkat ini</span>
              <br />
              Lain kali masuk dari perangkat ini tanpa kode email.
            </span>
          </label>

          <Button type="submit" varian="utama" ukuran="lg" blok memuat={memuat}>
            <span className="whitespace-nowrap">Masuk</span>
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>

          <p className="takar-kepala mt-6 pt-4 text-center text-[13px] text-muted">
            Belum punya akun warga?{" "}
            <Link
              href="/daftar"
              className="font-semibold text-brand-700 hover:underline dark:text-accent"
            >
              Daftar sekarang
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifikasiKodeMasuk} className="space-y-5">
          <div className="cekung flex items-start gap-3 p-3.5">
            <Mail size={16} className="mt-0.5 shrink-0 text-brand-700" />
            <p className="text-[13px] leading-relaxed text-muted">
              Kode hanya dikirim lewat email. Periksa kotak masuk, termasuk
              folder spam.
            </p>
          </div>

          <InputDigit
            panjang={6}
            nilai={kodeDigit}
            onChange={setKodeDigit}
            disabled={memuat}
          />

          <Button
            type="submit"
            varian="utama"
            ukuran="lg"
            blok
            memuat={memuat}
            disabled={kodeDigit.length < 6}
          >
            <span className="whitespace-nowrap">Lanjutkan masuk</span>
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
              className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke formulir masuk</span>
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
