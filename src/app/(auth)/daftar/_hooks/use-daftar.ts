"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { periksaSandi } from "../_bagian/syarat-sandi";

export function useDaftar() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [lihatSandi, setLihatSandi] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const syarat = periksaSandi(kataSandi);

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

  return {
    nama,
    setNama,
    email,
    setEmail,
    hp,
    setHp,
    kataSandi,
    setKataSandi,
    setujuSyarat,
    setSetujuSyarat,
    lihatSandi,
    setLihatSandi,
    memuat,
    pesanGalat,
    syarat,
    handleDaftar,
  };
}
