"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

import { KolomSandi, KolomTeks } from "../_bagian/kolom-teks";
import { KotakGalat } from "../_bagian/kotak-galat";

/**
 * Batas yang BENAR-BENAR diberlakukan server, bukan tebakan.
 *
 * Dibaca dari `skemaDaftar` di `MIA-JERNIH-BE/src/rute/auth.ts`: nama
 * minimal 2 karakter, kata sandi minimal 8 karakter, nomor HP opsional.
 * Tidak ada syarat huruf besar, angka, atau simbol — jadi tidak boleh ada
 * apa pun di halaman ini yang menyiratkan sebaliknya.
 */
const MIN_NAMA = 2;
const MIN_SANDI = 8;

export default function HalamanDaftar() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [setujuSyarat, setSetujuSyarat] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const sandiCukup = kataSandi.length >= MIN_SANDI;

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nama.trim().length < MIN_NAMA) {
      setPesanGalat(`Nama minimal ${MIN_NAMA} karakter.`);
      return;
    }
    if (!sandiCukup) {
      setPesanGalat(`Kata sandi minimal ${MIN_SANDI} karakter.`);
      return;
    }
    if (!setujuSyarat) {
      setPesanGalat("Centang persetujuan ketentuan layanan dulu.");
      return;
    }

    setPesanGalat(null);
    setMemuat(true);

    try {
      const emailBersih = email.trim().toLowerCase();
      await api("/api/auth/daftar", {
        method: "POST",
        body: JSON.stringify({
          nama: nama.trim(),
          email: emailBersih,
          hp: hp.trim()
            ? hp.startsWith("+")
              ? hp
              : `+62${hp.replace(/^0+/, "")}`
            : undefined,
          kataSandi,
        }),
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("jernih_email_daftar", emailBersih);
      }

      router.push(`/verifikasi?email=${encodeURIComponent(emailBersih)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memproses pendaftaran. Coba lagi beberapa saat.");
      }
    } finally {
      setMemuat(false);
    }
  };

  return (
    <AuthShell
      judul="Daftar akun warga"
      keterangan="Pantau debit dan isi saldo air rumah Anda, dari mana saja."
      langkah="Langkah 1 dari 3"
    >
      <StepperAuth langkahAktif={1} />

      <KotakGalat pesan={pesanGalat} />

      <form onSubmit={handleDaftar} className="space-y-4" noValidate>
        <KolomTeks
          label="Nama lengkap"
          type="text"
          required
          autoComplete="name"
          placeholder="Sesuai kartu identitas"
          value={nama}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNama(e.target.value)
          }
          disabled={memuat}
          hint={`Minimal ${MIN_NAMA} karakter.`}
        />

        <KolomTeks
          label="Alamat email"
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
          hint="Kode verifikasi dan kode keamanan hanya dikirim ke email ini."
        />

        <KolomTeks
          label="Nomor ponsel"
          type="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          placeholder="8123456789"
          value={hp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setHp(e.target.value.replace(/\D/g, ""))
          }
          disabled={memuat}
          depan="+62"
          hint="Opsional, hanya supaya petugas bisa menghubungi Anda kalau meter bermasalah. Tidak dipakai untuk OTP."
        />

        <div>
          <KolomSandi
            label="Kata sandi"
            required
            autoComplete="new-password"
            placeholder={`Minimal ${MIN_SANDI} karakter`}
            value={kataSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setKataSandi(e.target.value)
            }
            disabled={memuat}
          />

          {/*
            Syaratnya ditulis sebagai SATU hal yang bisa dicentang, bukan
            batang kekuatan tiga tingkat.

            Batang kekuatan yang lama menilai huruf besar, angka, dan simbol
            — padahal server tidak satu pun mensyaratkannya. Sandi delapan
            huruf kecil ditandai "Lemah" lalu tetap diterima, dan orang yang
            percaya pada penilaian itu mengira pendaftarannya akan ditolak.
            Ukuran yang ditampilkan harus ukuran yang benar-benar dipakai
            untuk menolak.
          */}
          <p
            className={cn(
              "mt-2 flex items-center gap-1.5 text-[12.5px] transition-colors",
              sandiCukup ? "text-success" : "text-muted",
            )}
          >
            <Check
              size={14}
              className={cn("shrink-0", sandiCukup ? "opacity-100" : "opacity-40")}
              aria-hidden
            />
            <span>
              Minimal {MIN_SANDI} karakter
              {kataSandi ? ` — sekarang ${kataSandi.length}` : ""}
            </span>
          </p>
        </div>

        <div className="cekung flex items-start gap-3 p-3.5">
          <Mail size={16} className="mt-0.5 shrink-0 text-brand-700" />
          <p className="text-[13px] leading-relaxed text-muted">
            Setelah ini kami kirim <strong className="text-ink">6 digit kode</strong>{" "}
            ke email Anda. Verifikasi di Jernih hanya lewat email, tidak pernah
            lewat SMS.
          </p>
        </div>

        <label
          htmlFor="syarat"
          className="flex cursor-pointer items-start gap-3 pt-1"
        >
          <input
            id="syarat"
            type="checkbox"
            checked={setujuSyarat}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSetujuSyarat(e.target.checked)
            }
            disabled={memuat}
            className="mt-0.5 size-4 shrink-0 rounded-[5px] border-line-strong text-brand-600 focus:ring-brand-500"
          />
          <span className="text-[13px] leading-relaxed text-muted">
            Saya menyetujui ketentuan privasi dan transparansi data air Jernih.
          </span>
        </label>

        <Button type="submit" varian="utama" ukuran="lg" blok memuat={memuat}>
          <span className="whitespace-nowrap">Lanjut ke verifikasi</span>
          {!memuat ? <ArrowRight size={16} /> : null}
        </Button>

        <p className="takar-kepala mt-6 pt-4 text-center text-[13px] text-muted">
          Sudah punya akun?{" "}
          <Link
            href="/masuk"
            className="font-semibold text-brand-700 hover:underline dark:text-accent"
          >
            Masuk sekarang
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
