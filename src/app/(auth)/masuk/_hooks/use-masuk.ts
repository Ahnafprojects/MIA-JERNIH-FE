"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Pengguna } from "../_tipe";

export function useMasuk() {
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

  const kembaliKeFormulir = () => {
    setButuhKode(false);
    setKodeDigit("");
    setPesanGalat(null);
  };

  return {
    email,
    setEmail,
    kataSandi,
    setKataSandi,
    ingat,
    setIngat,
    lihatSandi,
    setLihatSandi,
    butuhKode,
    kodeDigit,
    setKodeDigit,
    memuat,
    pesanGalat,
    handleMasuk,
    handleVerifikasiKodeMasuk,
    kembaliKeFormulir,
  };
}
