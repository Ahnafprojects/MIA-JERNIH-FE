"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

import { KolomSandi } from "../_bagian/kolom-teks";
import { KotakGalat } from "../_bagian/kotak-galat";

/**
 * Batas yang sama persis dengan pendaftaran — lihat `skemaAturUlang` dan
 * `skemaDaftar` di `MIA-JERNIH-BE/src/rute/auth.ts`. Dua angka berbeda
 * untuk hal yang sama menghasilkan keadaan mustahil: sandi yang diterima
 * saat mengatur ulang tetapi ditolak saat mendaftar.
 */
const MIN_SANDI = 8;

function KontenAturUlang() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] = useState("");

  const [memuat, setMemuat] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const sandiCukup = kataSandiBaru.length >= MIN_SANDI;
  /* Hanya dinilai setelah kolom keduanya diisi — menandai "tidak cocok"
     pada huruf pertama yang diketik adalah tuduhan yang belum waktunya. */
  const cocok = konfirmasiSandi.length > 0 && kataSandiBaru === konfirmasiSandi;

  const handleSimpanSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setPesanGalat("Tautan atur ulang tidak lengkap atau sudah kedaluwarsa.");
      return;
    }
    if (!sandiCukup) {
      setPesanGalat(`Kata sandi baru minimal ${MIN_SANDI} karakter.`);
      return;
    }
    if (kataSandiBaru !== konfirmasiSandi) {
      setPesanGalat("Ulangan kata sandi belum sama.");
      return;
    }

    setPesanGalat(null);
    setMemuat(true);

    try {
      await api("/api/auth/atur-ulang", {
        method: "POST",
        body: JSON.stringify({ token, kataSandiBaru }),
      });
      setBerhasil(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat(
          "Gagal mengatur ulang kata sandi. Tautannya mungkin sudah kedaluwarsa.",
        );
      }
    } finally {
      setMemuat(false);
    }
  };

  return (
    <AuthShell
      judul="Buat kata sandi baru"
      keterangan="Masukkan kata sandi baru untuk akun Jernih Anda."
    >
      <KotakGalat pesan={pesanGalat} />

      {!berhasil ? (
        <form onSubmit={handleSimpanSandi} className="space-y-4" noValidate>
          <div>
            <KolomSandi
              label="Kata sandi baru"
              required
              autoComplete="new-password"
              placeholder={`Minimal ${MIN_SANDI} karakter`}
              value={kataSandiBaru}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setKataSandiBaru(e.target.value)
              }
              disabled={memuat}
            />

            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[12.5px] transition-colors",
                sandiCukup ? "text-success" : "text-muted",
              )}
            >
              <Check
                size={14}
                className={cn(
                  "shrink-0",
                  sandiCukup ? "opacity-100" : "opacity-40",
                )}
                aria-hidden
              />
              <span>
                Minimal {MIN_SANDI} karakter
                {kataSandiBaru ? ` — sekarang ${kataSandiBaru.length}` : ""}
              </span>
            </p>
          </div>

          <KolomSandi
            label="Ulangi kata sandi baru"
            required
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi baru"
            value={konfirmasiSandi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setKonfirmasiSandi(e.target.value)
            }
            disabled={memuat}
            galat={
              konfirmasiSandi.length > 0 && !cocok
                ? "Belum sama dengan kata sandi baru."
                : null
            }
            hint={cocok ? "Sudah sama." : undefined}
          />

          <Button type="submit" varian="utama" ukuran="lg" blok memuat={memuat}>
            <span className="whitespace-nowrap">Perbarui kata sandi</span>
            {!memuat ? <ArrowRight size={16} /> : null}
          </Button>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success shadow-[var(--kilau-tepi),var(--kedalaman-1)]">
            <CheckCircle2 size={26} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-ink">
              Kata sandi diperbarui
            </h2>
            <p className="text-[13px] leading-relaxed text-muted">
              Sesi di perangkat lain ikut dikeluarkan. Masuk kembali memakai
              kata sandi baru Anda.
            </p>
          </div>

          <div className="takar-kepala pt-4">
            <Button
              varian="utama"
              ukuran="lg"
              blok
              onClick={() => router.push("/masuk")}
            >
              <span className="whitespace-nowrap">Masuk sekarang</span>
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
