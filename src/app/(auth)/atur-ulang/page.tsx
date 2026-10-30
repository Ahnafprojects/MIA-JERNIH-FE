"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";

function KontenAturUlang() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const handleSimpanSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setPesanGalat("Token atur ulang tidak ditemukan atau sudah kedaluwarsa.");
      return;
    }
    if (kataSandiBaru.length < 8) {
      setPesanGalat("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (kataSandiBaru !== konfirmasiSandi) {
      setPesanGalat("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setPesanGalat(null);
    setMemuat(true);

    try {
      await api("/api/auth/atur-ulang", {
        method: "POST",
        body: JSON.stringify({
          token,
          kataSandiBaru,
        }),
      });
      setBerhasil(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.");
      }
    } finally {
      setMemuat(false);
    }
  };

  return (
    <AuthShell
      judul="Buat Kata Sandi Baru"
      keterangan="Masukkan kata sandi baru untuk akun Jernih Anda."
    >
      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </div>
      ) : null}

      {!berhasil ? (
        <form onSubmit={handleSimpanSandi} className="space-y-4">
          <TextField
            label="Kata Sandi Baru"
            type={lihatSandi ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={kataSandiBaru}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKataSandiBaru(e.target.value)}
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

          <TextField
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Ulangi kata sandi baru"
            value={konfirmasiSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKonfirmasiSandi(e.target.value)}
            disabled={memuat}
          />

          <Button
            type="submit"
            varian="utama"
            blok
            memuat={memuat}
          >
            Perbarui Kata Sandi
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-ink">
              Kata Sandi Diperbarui
            </h2>
            <p className="text-xs leading-relaxed text-muted">
              Kata sandi Anda berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.
            </p>
          </div>

          <div className="takar-kepala pt-4">
            <Button
              varian="utama"
              blok
              onClick={() => router.push("/masuk")}
            >
              Masuk Sekarang
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

export default function HalamanAturUlang() {
  return (
    <Suspense fallback={null}>
      <KontenAturUlang />
    </Suspense>
  );
}
