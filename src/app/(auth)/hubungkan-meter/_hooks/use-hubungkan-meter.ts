"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DataMeterDitemukan, IzinKamera, Metode } from "../_tipe";

export function useHubungkanMeter() {
  const router = useRouter();
  const { pengguna, muatUlangData } = useAuth();

  useEffect(() => {
    if (!pengguna) router.replace("/masuk");
  }, [pengguna, router]);

  const [metode, setMetode] = useState<Metode>("ketik");
  const [targetId, setTargetId] = useState("");
  const [memuatCari, setMemuatCari] = useState(false);
  const [memuatHubung, setMemuatHubung] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  // Status izin kamera untuk scanner QR
  const [izinKamera, setIzinKamera] = useState<IzinKamera>("belum");

  const [meterDitemukan, setMeterDitemukan] = useState<DataMeterDitemukan | null>(null);

  const cariMeter = async (id: string) => {
    if (!id.trim()) {
      setPesanGalat("Masukkan ID Pelanggan atau nomor seri meter.");
      return;
    }

    setPesanGalat(null);
    setMemuatCari(true);

    try {
      const res = await api<{ meter: DataMeterDitemukan }>(
        `/api/meter/${encodeURIComponent(id.trim())}`,
      );
      setMeterDitemukan(res.meter);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "BUKAN_PEMILIK_METER" || err.status === 403) {
          setPesanGalat(
            "Meter ini sudah terhubung ke akun lain. Hubungi kantor layanan PDAM bila ini adalah meter Anda.",
          );
        } else {
          setPesanGalat(err.message);
        }
      } else {
        setPesanGalat(
          "Meter tidak ditemukan. Periksa ID pelanggan pada stiker fisik meter.",
        );
      }
      setMeterDitemukan(null);
    } finally {
      setMemuatCari(false);
    }
  };

  const handleMintaIzinKamera = async () => {
    setIzinKamera("minta");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIzinKamera("ditolak");
        setPesanGalat(
          "Perangkat Anda tidak mendukung akses kamera. Silakan ketik ID secara manual.",
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      // Matikan stream setelah tes izin berhasil
      stream.getTracks().forEach((track) => track.stop());
      setIzinKamera("diberikan");
    } catch {
      setIzinKamera("ditolak");
      setPesanGalat(
        "Izin kamera tidak diberikan. Anda tetap dapat melanjutkan dengan mengetik ID meter secara manual di tab Ketik ID.",
      );
    }
  };

  const handleHubungkan = async () => {
    if (!targetId.trim()) return;

    setPesanGalat(null);
    setMemuatHubung(true);

    try {
      await api("/api/meter/hubungkan", {
        method: "POST",
        body: JSON.stringify({ idPelanggan: targetId.trim() }),
      });

      await muatUlangData();
      router.push("/beranda");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "METER_SUDAH_TERHUBUNG") {
          setPesanGalat(
            "Meter ini sudah terhubung ke akun pelanggan lain. Hubungi petugas PDAM untuk bantuan pengalihan kepemilikan.",
          );
        } else {
          setPesanGalat(err.message);
        }
      } else {
        setPesanGalat("Gagal menghubungkan meter ke akun Anda.");
      }
    } finally {
      setMemuatHubung(false);
    }
  };

  return {
    metode,
    setMetode,
    setPesanGalat,
    targetId,
    setTargetId,
    memuatCari,
    memuatHubung,
    pesanGalat,
    izinKamera,
    meterDitemukan,
    cariMeter,
    handleMintaIzinKamera,
    handleHubungkan,
  };
}
