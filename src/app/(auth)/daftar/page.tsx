"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";

function hitungKekuatanSandi(sandi: string): { skor: number; label: string; warna: string } {
  if (!sandi) return { skor: 0, label: "Kosong", warna: "bg-line" };
  let skor = 0;
  if (sandi.length >= 8) skor += 1;
  if (/[A-Z]/.test(sandi) && /[a-z]/.test(sandi)) skor += 1;
  if (/[0-9]/.test(sandi)) skor += 1;
  if (/[^A-Za-z0-9]/.test(sandi)) skor += 1;

  if (skor <= 1) return { skor: 1, label: "Lemah", warna: "bg-danger" };
  if (skor === 2 || skor === 3) return { skor: 2, label: "Cukup", warna: "bg-warn" };
  return { skor: 3, label: "Kuat", warna: "bg-success" };
}

export default function HalamanDaftar() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [lihatSandi, setLihatSandi] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const kekuatan = hitungKekuatanSandi(kataSandi);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setujuSyarat) {
      setPesanGalat("Anda harus menyetujui ketentuan layanan.");
      return;
    }
    if (kataSandi.length < 8) {
      setPesanGalat("Kata sandi minimal 8 karakter.");
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
          hp: hp.trim() ? (hp.startsWith("+") ? hp : `+62${hp.replace(/^0+/, "")}`) : undefined,
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
      judul="Daftar Akun Warga"
      keterangan="Pantau debit dan isi saldo air rumah Anda secara transparan."
    >
      <StepperAuth langkahAktif={1} />

      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </div>
      ) : null}

      <form onSubmit={handleDaftar} className="space-y-4">
        <TextField
          label="Nama Lengkap"
          type="text"
          required
          autoComplete="name"
          placeholder="Sesuai kartu identitas"
          value={nama}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNama(e.target.value)}
          disabled={memuat}
        />

        <TextField
          label="Alamat Email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          disabled={memuat}
        />

        <TextField
          label="Nomor Ponsel (WhatsApp / Telepon)"
          type="tel"
          autoComplete="tel-national"
          placeholder="8123456789"
          value={hp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHp(e.target.value.replace(/\D/g, ""))}
          disabled={memuat}
          depan="+62"
          hint="Nomor ini hanya untuk dihubungi petugas jika ada kendala meter fisik. Tidak ada OTP SMS."
        />

        <div>
          <TextField
            label="Kata Sandi"
            type={lihatSandi ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={kataSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKataSandi(e.target.value)}
            disabled={memuat}
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

          {kataSandi ? (
            <div className="mt-2 space-y-1">
              <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-soft">
                <div
                  className={`h-full flex-1 transition-colors ${
                    kekuatan.skor >= 1 ? kekuatan.warna : "bg-line"
                  }`}
                />
                <div
                  className={`h-full flex-1 transition-colors ${
                    kekuatan.skor >= 2 ? kekuatan.warna : "bg-line"
                  }`}
                />
                <div
                  className={`h-full flex-1 transition-colors ${
                    kekuatan.skor >= 3 ? kekuatan.warna : "bg-line"
                  }`}
                />
              </div>
              <p className="font-mono text-[10px] text-muted">
                Kekuatan: <span className="font-semibold text-ink">{kekuatan.label}</span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            id="syarat"
            type="checkbox"
            checked={setujuSyarat}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSetujuSyarat(e.target.checked)}
            disabled={memuat}
            className="mt-0.5 size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="syarat" className="text-xs leading-relaxed text-muted">
            Saya menyetujui ketentuan privasi dan transparansi data air Jernih.
          </label>
        </div>

        <Button
          type="submit"
          varian="utama"
          blok
          memuat={memuat}
        >
          Lanjut ke Verifikasi
          {!memuat ? <ArrowRight size={16} /> : null}
        </Button>

        <div className="takar-kepala mt-6 pt-4 text-center text-xs text-muted">
          Sudah punya akun?{" "}
          <Link
            href="/masuk"
            className="font-semibold text-brand-700 hover:underline dark:text-accent"
          >
            Masuk sekarang
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
