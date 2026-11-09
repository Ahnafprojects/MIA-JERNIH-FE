"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, RotateCw } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "@/lib/auth-tipe";

import { KotakGalat } from "../_bagian/kotak-galat";

/** Jeda sebelum kode boleh dikirim ulang, dalam detik. */
const JEDA_KIRIM_ULANG = 60;

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

  const [sisaDetik, setSisaDetik] = useState(JEDA_KIRIM_ULANG);
  const [sedangKirimUlang, setSedangKirimUlang] = useState(false);

  const bisaKirimUlang = sisaDetik <= 0;

  /*
   * SATU interval untuk seluruh umur komponen, dengan daftar kebergantungan
   * kosong.
   *
   * Versi sebelumnya menaruh `hitungMundur` di daftar kebergantungan, jadi
   * tiap detik intervalnya dibongkar lalu dipasang ulang. Itu bekerja
   * secara kebetulan, tetapi setiap render ulang dari sebab lain — misalnya
   * satu ketukan di kotak digit — ikut menyetel ulang pewaktunya, dan
   * hitungannya melompat. Pembaruan lewat fungsi (`(s) => s - 1`) membuat
   * nilai terbaru selalu terbaca tanpa perlu ikut jadi kebergantungan.
   *
   * `Date.now()` sengaja TIDAK dipakai di sini: membacanya saat render
   * melanggar aturan kemurnian React, dan pada render server jamnya adalah
   * jam server — berbeda dari jam peramban, sehingga angkanya berganti
   * sendiri saat hidrasi.
   */
  useEffect(() => {
    const pewaktu = setInterval(() => {
      setSisaDetik((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(pewaktu);
  }, []);

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
      const res = await api<{ accessToken: string; pengguna: Pengguna }>(
        "/api/auth/verifikasi-email",
        {
          method: "POST",
          body: JSON.stringify({ email, kode }),
        },
      );

      masukDenganAkses(res.accessToken, res.pengguna);
      /*
       * Langsung ke beranda, bukan ke halaman hubungkan meter.
       *
       * Akun baru sekarang menerima meter bawaan begitu verifikasi selesai,
       * jadi memaksa warga mengisi nomor meter yang tidak dimilikinya hanya
       * membuat pendaftaran berakhir buntu. Kalau karena sesuatu hal meter
       * bawaan gagal dibuat, penjaga di /beranda tetap mengarahkan ke
       * /hubungkan-meter — jadi jalur manual tidak hilang.
       */
      router.push("/beranda");
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
      setSisaDetik(JEDA_KIRIM_ULANG);
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
      judul="Verifikasi email"
      keterangan={`Kami mengirim 6 digit kode ke ${email || "email Anda"}.`}
      langkah="Langkah 2 dari 3"
    >
      <StepperAuth langkahAktif={2} />

      <KotakGalat pesan={pesanGalat} />

      <form onSubmit={handleVerifikasi} className="space-y-5">
        <div className="cekung flex items-start gap-3 p-3.5">
          <Mail size={16} className="mt-0.5 shrink-0 text-brand-700" />
          <p className="text-[13px] leading-relaxed text-muted">
            Kode berlaku <strong className="text-ink">10 menit</strong>. Periksa
            kotak masuk, termasuk folder spam.
          </p>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold">Kode 6 digit</p>
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
          ukuran="lg"
          blok
          memuat={memuat}
          disabled={kode.length < 6}
        >
          <span className="whitespace-nowrap">Verifikasi</span>
          {!memuat ? <ArrowRight size={16} /> : null}
        </Button>

        <div className="space-y-3 text-center text-[13px]">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-muted">Tidak menerima kode?</span>
            {bisaKirimUlang ? (
              <button
                type="button"
                onClick={handleKirimUlang}
                disabled={sedangKirimUlang}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline disabled:opacity-60 dark:text-accent"
              >
                <RotateCw
                  size={13}
                  className={sedangKirimUlang ? "animate-spin" : ""}
                />
                <span className="whitespace-nowrap">Kirim ulang</span>
              </button>
            ) : (
              /* `tabular` supaya angkanya tidak bergoyang tiap detik —
                 lebar digit yang berbeda membuat teksnya bergeser. */
              <span className="tabular font-mono text-muted">
                Kirim ulang dalam {sisaDetik} detik
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
