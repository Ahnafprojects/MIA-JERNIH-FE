"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

import { KolomTeks } from "../_bagian/kolom-teks";
import { KotakGalat } from "../_bagian/kotak-galat";

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
      judul="Atur ulang kata sandi"
      keterangan="Masukkan email terdaftar, kami kirim tautan untuk membuat kata sandi baru."
    >
      <KotakGalat pesan={pesanGalat} />

      {!terkirim ? (
        <form onSubmit={handleKirimLupa} className="space-y-4" noValidate>
          <KolomTeks
            label="Alamat email terdaftar"
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

          <Button type="submit" varian="utama" ukuran="lg" blok memuat={memuat}>
            <span className="whitespace-nowrap">Kirim tautan</span>
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>

          <div className="takar-kepala mt-6 pt-4 text-center">
            <Link
              href="/masuk"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700 hover:underline dark:text-accent"
            >
              <ArrowLeft size={14} />
              <span className="whitespace-nowrap">Kembali ke halaman masuk</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success shadow-[var(--kilau-tepi),var(--kedalaman-1)]">
            <CheckCircle2 size={26} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-ink">
              Tautan terkirim
            </h2>
            {/*
              Kalimatnya SENGAJA memakai "jika akun terdaftar".

              Mengonfirmasi bahwa sebuah email ada di basis data membuat
              halaman ini bisa dipakai menebak-nebak siapa saja yang punya
              akun — cukup dengan memasukkan email orang lain dan melihat
              jawabannya berbeda.
            */}
            <p className="text-[13px] leading-relaxed text-muted">
              Jika akun dengan alamat{" "}
              <strong className="break-all text-ink">{email}</strong> terdaftar,
              tautan atur ulang kata sandi akan masuk dalam beberapa saat.
            </p>
          </div>

          <div className="takar-kepala pt-4">
            <Link href="/masuk" className="block">
              <Button varian="sekunder" ukuran="lg" blok type="button">
                <ArrowLeft size={16} />
                <span className="whitespace-nowrap">Kembali ke masuk</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
