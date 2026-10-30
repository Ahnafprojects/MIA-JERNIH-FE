"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";

export default function HalamanLupaSandi() {
  const [email, setEmail] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const handleKirimLupa = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat(null);
    setMemuat(true);

    try {
      await api("/api/auth/lupa", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setTerkirim(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memproses permintaan atur ulang kata sandi.");
      }
    } finally {
      setMemuat(false);
    }
  };

  return (
    <AuthShell
      judul="Atur Ulang Kata Sandi"
      keterangan="Masukkan email yang terdaftar untuk menerima tautan atur ulang kata sandi Anda."
    >
      {pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </div>
      ) : null}

      {!terkirim ? (
        <form onSubmit={handleKirimLupa} className="space-y-4">
          <TextField
            label="Alamat Email Terdaftar"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={memuat}
          />

          <Button
            type="submit"
            varian="utama"
            blok
            memuat={memuat}
          >
            Kirim Tautan Atur Ulang
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>

          <div className="takar-kepala mt-6 pt-4 text-center text-xs text-muted">
            <Link
              href="/masuk"
              className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-accent"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke halaman masuk</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-ink">
              Tautan Terkirim
            </h2>
            <p className="text-xs leading-relaxed text-muted">
              Jika akun dengan alamat <strong className="text-ink">{email}</strong> terdaftar di sistem kami, Anda akan menerima email berisi tautan atur ulang kata sandi dalam beberapa saat.
            </p>
          </div>

          <div className="takar-kepala pt-4">
            <Link href="/masuk">
              <Button varian="sekunder" blok type="button">
                <ArrowLeft size={16} />
                Kembali ke Masuk
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
