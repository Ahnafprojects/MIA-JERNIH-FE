"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { HasilGalat, HasilSukses, TokenBelumDipakai } from "../_tipe";

export function useToken() {
  const { meter, meterAktif, pilihMeter, muatUlangData } = useAuth();

  const [kodeToken, setKodeToken] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [daftarToken, setDaftarToken] = useState<TokenBelumDipakai[]>([]);
  const [memuatTokenList, setMemuatTokenList] = useState(false);

  const [hasilSukses, setHasilSukses] = useState<HasilSukses | null>(null);
  const [hasilGalat, setHasilGalat] = useState<HasilGalat | null>(null);

  const [salahCount, setSalahCount] = useState(0);
  const [terkunciSampai, setTerkunciSampai] = useState<number | null>(null);
  const [sisaWaktuKunci, setSisaWaktuKunci] = useState(0);

  const ambilTokenBelumDipakai = useCallback(async () => {
    setMemuatTokenList(true);
    try {
      const res = await api<{ tokens: TokenBelumDipakai[] }>("/api/token/belum-dipakai");
      setDaftarToken(res.tokens || []);
    } catch {
      // Abaikan jika belum ada
    } finally {
      setMemuatTokenList(false);
    }
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const res = await api<{ tokens: TokenBelumDipakai[] }>("/api/token/belum-dipakai");
        if (aktif) setDaftarToken(res.tokens || []);
      } catch {
        // Abaikan
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    if (!terkunciSampai) return;

    const interval = setInterval(() => {
      const sisa = Math.max(0, Math.ceil((terkunciSampai - Date.now()) / 1000));
      setSisaWaktuKunci(sisa);
      if (sisa <= 0) {
        setTerkunciSampai(null);
        setSalahCount(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [terkunciSampai]);

  const handleTukarToken = async (kodeOverride?: string) => {
    const kodeTarget = (kodeOverride ?? kodeToken).trim();
    if (!meterAktif || kodeTarget.length < 4 || terkunciSampai) return;

    setMemuat(true);
    setHasilSukses(null);
    setHasilGalat(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
        lcd?: { baris1: string; baris2: string };
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: kodeTarget,
          meterId: meterAktif.id,
        }),
      });

      setHasilSukses({
        nilaiL: res.nilaiL,
        saldoBaruL: res.saldoBaruL,
        lcd: res.lcd,
      });
      setKodeToken("");
      setSalahCount(0);
      muatUlangData();
      ambilTokenBelumDipakai();
    } catch (err) {
      const baruSalah = salahCount + 1;
      setSalahCount(baruSalah);

      let pesanError = "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.";
      if (err instanceof ApiError) {
        pesanError = err.message;
      }

      if (baruSalah >= 5) {
        const expired = Date.now() + 10 * 60 * 1000;
        setTerkunciSampai(expired);
        setSisaWaktuKunci(600);
      }

      setHasilGalat({
        pesan: pesanError,
        lcdBaris1: "TOKEN SALAH",
        lcdBaris2: `SISA COBA: ${Math.max(0, 5 - baruSalah)}`,
      });
    } finally {
      setMemuat(false);
    }
  };

  const handleTekanKeypad = (tombol: string) => {
    if (terkunciSampai) return;

    if (tombol >= "0" && tombol <= "9") {
      if (kodeToken.length < 10) {
        setKodeToken((prev) => prev + tombol);
      }
    } else if (tombol === "D") {
      setKodeToken((prev) => prev.slice(0, -1));
    } else if (tombol === "*") {
      setKodeToken("");
    } else if (tombol === "A") {
      if (kodeToken.length >= 4) {
        handleTukarToken();
      }
    }
  };

  return {
    meter,
    meterAktif,
    pilihMeter,
    kodeToken,
    setKodeToken,
    memuat,
    daftarToken,
    memuatTokenList,
    hasilSukses,
    hasilGalat,
    terkunciSampai,
    sisaWaktuKunci,
    handleTukarToken,
    handleTekanKeypad,
  };
}
