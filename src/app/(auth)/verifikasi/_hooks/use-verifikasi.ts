"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "../_tipe";

export function useVerifikasi() {
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

  return {
    email,
    kode,
    setKode,
    memuat,
    pesanGalat,
    hitungMundur,
    sedangKirimUlang,
    bisaKirimUlang,
    handleVerifikasi,
    handleKirimUlang,
  };
}
