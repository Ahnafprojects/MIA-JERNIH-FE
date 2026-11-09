"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { KATEGORI_GANGGUAN } from "../_bagian/pilih-kategori";
import type { TabAktif, TiketBerhasil, TiketItem } from "../_tipe";

export function useBantuan() {
  const { meterAktif } = useAuth();

  const [tabAktif, setTabAktif] = useState<TabAktif>("lapor");

  const [kategori, setKategori] = useState(KATEGORI_GANGGUAN[0].id);
  const [deskripsi, setDeskripsi] = useState("");
  const [lampirkanSensor, setLampirkanSensor] = useState(true);
  const [daftarFoto, setDaftarFoto] = useState<string[]>([]);
  const titikKoordinat = {
    lat: -6.9175,
    lng: 107.6191,
  };

  const [memuatKirim, setMemuatKirim] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const [tiketBerhasil, setTiketBerhasil] = useState<TiketBerhasil | null>(null);
  const [sudahSalin, setSudahSalin] = useState(false);

  const [daftarTiketSaya, setDaftarTiketSaya] = useState<TiketItem[]>([]);
  const [memuatTiket, setMemuatTiket] = useState(false);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setMemuatTiket(true);
      try {
        const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
        if (aktif) setDaftarTiketSaya(res.tiket || []);
      } catch {
        if (aktif) setDaftarTiketSaya([]);
      } finally {
        if (aktif) setMemuatTiket(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  const ambilTiketSaya = async () => {
    try {
      const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
      setDaftarTiketSaya(res.tiket || []);
    } catch {
      // Abaikan
    }
  };

  const handleUnggahFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (daftarFoto.length + files.length > 3) {
      setPesanGalat("Maksimal 3 foto pendukung yang dapat diunggah.");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setPesanGalat(`Foto ${file.name} melebihi ukuran maksimal 5 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setDaftarFoto((prev) => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleHapusFoto = (indeks: number) => {
    setDaftarFoto((prev) => prev.filter((_, i) => i !== indeks));
  };

  const handleKirimLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deskripsi.trim().length < 5) {
      setPesanGalat("Deskripsi pengaduan minimal 5 karakter.");
      return;
    }

    setPesanGalat(null);
    setMemuatKirim(true);

    try {
      const res = await api<{
        ok: boolean;
        tiket: { nomor: string; slaJatuhTempo: string };
      }>("/api/tiket", {
        method: "POST",
        body: JSON.stringify({
          kategori,
          deskripsi: deskripsi.trim(),
          foto: daftarFoto,
          lat: titikKoordinat.lat,
          lng: titikKoordinat.lng,
          meterId: meterAktif?.id,
        }),
      });

      setTiketBerhasil({
        nomor: res.tiket.nomor,
        sla: res.tiket.slaJatuhTempo,
      });

      // Reset form
      setDeskripsi("");
      setDaftarFoto([]);
      ambilTiketSaya();
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal mengirimkan laporan gangguan. Coba lagi beberapa saat.");
      }
    } finally {
      setMemuatKirim(false);
    }
  };

  const handleSalinNomorTiket = () => {
    if (!tiketBerhasil) return;
    navigator.clipboard.writeText(tiketBerhasil.nomor);
    setSudahSalin(true);
    setTimeout(() => setSudahSalin(false), 2000);
  };

  return {
    meterAktif,
    tabAktif,
    setTabAktif,
    kategori,
    setKategori,
    deskripsi,
    setDeskripsi,
    lampirkanSensor,
    setLampirkanSensor,
    daftarFoto,
    titikKoordinat,
    memuatKirim,
    pesanGalat,
    tiketBerhasil,
    setTiketBerhasil,
    sudahSalin,
    daftarTiketSaya,
    memuatTiket,
    handleUnggahFoto,
    handleHapusFoto,
    handleKirimLaporan,
    handleSalinNomorTiket,
  };
}
