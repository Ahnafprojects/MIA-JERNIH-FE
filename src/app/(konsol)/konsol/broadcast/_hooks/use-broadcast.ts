"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TARGET } from "../_tipe";
import type { JawabanBroadcast, RiwayatBroadcast, Zona } from "../_tipe";

export function useBroadcast() {
  const [riwayat, setRiwayat] = useState<RiwayatBroadcast[]>([]);
  const [daftarZona, setDaftarZona] = useState<Zona[]>([]);
  const [telegram, setTelegram] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState("SEMUA_WARGA");
  const [zona, setZona] = useState("");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const response = await api<JawabanBroadcast>("/api/admin/broadcast");
    setRiwayat(response.broadcast);
    setDaftarZona(response.zona ?? []);
  };

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        load().catch((e: unknown) =>
          setGalat(
            e instanceof ApiError ? e.message : "Riwayat broadcast tidak bisa dimuat.",
          ),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const adaKanal = push || email || telegram;
  const zonaKurang = target === "ZONA" && !zona;
  const namaZona = daftarZona.find((z) => z.id === zona)?.nama;
  const bisaKirim =
    !loading && !!judul.trim() && pesan.trim().length >= 5 && adaKanal && !zonaKurang;

  const kirim = async () => {
    if (!judul.trim() || pesan.trim().length < 5 || !adaKanal || zonaKurang) return;
    const sasaran =
      target === "ZONA" && namaZona
        ? `warga zona ${namaZona}`
        : (TARGET[target]?.label.toLowerCase() ?? target);
    const konfirmasi = confirm(
      `Kirim broadcast kepada ${sasaran}? Pesan tidak dapat ditarik kembali.`,
    );
    if (!konfirmasi) return;
    setLoading(true);
    setGalat(null);
    setBerhasil(null);
    try {
      const hasil = await api<{ penerima: number }>("/api/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({
          judul,
          pesan,
          target,
          zona: target === "ZONA" ? zona : undefined,
          kanal: { push, email, telegram },
        }),
      });
      setJudul("");
      setPesan("");
      setBerhasil(`Terkirim ke ${hasil.penerima.toLocaleString("id-ID")} warga.`);
      await load();
    } catch (e) {
      /*
       * Sebelumnya galat ditelan tanpa jejak: tombol berhenti berputar,
       * pesannya tetap di kotak, dan operator tidak tahu apakah siarannya
       * terkirim. Penolakan seperti "tidak ada warga yang cocok" kini
       * terbaca apa adanya dari server.
       */
      setGalat(
        e instanceof ApiError ? e.message : "Broadcast gagal dikirim. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    riwayat,
    daftarZona,
    judul,
    setJudul,
    pesan,
    setPesan,
    target,
    setTarget,
    zona,
    setZona,
    push,
    setPush,
    email,
    setEmail,
    telegram,
    setTelegram,
    loading,
    galat,
    berhasil,
    bisaKirim,
    kirim,
  };
}
