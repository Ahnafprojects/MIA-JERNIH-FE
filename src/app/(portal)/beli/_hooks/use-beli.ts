"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { DataPaketResponse, ModePilihan, PaketOpsi } from "../_tipe";

export function useBeli() {
  const router = useRouter();
  const { meter, meterAktif, pilihMeter } = useAuth();

  const [tarifPerLiter, setTarifPerLiter] = useState(7.5);
  const [golonganNama, setGolonganNama] = useState("Rumah Tangga Umum");
  const [daftarPaket, setDaftarPaket] = useState<PaketOpsi[]>([]);
  const [modePilihan, setModePilihan] = useState<ModePilihan>("paket");

  const [literTerpilih, setLiterTerpilih] = useState<number>(2000);
  const [inputLiterBebas, setInputLiterBebas] = useState<string>("1500");
  const [inputRupiahBebas, setInputRupiahBebas] = useState<string>("11250");

  const [metode, setMetode] = useState<string>("QRIS");
  const [memuatBayar, setMemuatBayar] = useState(false);
  const [tahapBayar, setTahapBayar] = useState<string | null>(null);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<DataPaketResponse>("/api/paket");
        setTarifPerLiter(res.tarifPerLiter);
        setGolonganNama(res.golongan);
        setDaftarPaket(res.paket);
        if (res.paket.length > 0) {
          setLiterTerpilih(res.paket[1]?.volumeL ?? res.paket[0]!.volumeL);
        }
      } catch {
        // Fallback nilai standar bila gagal fetch
        setDaftarPaket([
          { volumeL: 500, hargaRp: 3750, label: "0,5 m³ (500 Liter)" },
          { volumeL: 1000, hargaRp: 7500, label: "1 m³ (1.000 Liter)" },
          { volumeL: 2000, hargaRp: 15000, label: "2 m³ (2.000 Liter)" },
          { volumeL: 5000, hargaRp: 37500, label: "5 m³ (5.000 Liter)" },
          { volumeL: 10000, hargaRp: 75000, label: "10 m³ (10.000 Liter)" },
        ]);
      }
    })();
  }, []);

  const handleUbahLiterBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    setInputLiterBebas(angkaSaja);
    const n = Number(angkaSaja) || 0;
    const rp = Math.round(n * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
  };

  const handleUbahRupiahBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    setInputRupiahBebas(angkaSaja);
    const rp = Number(angkaSaja) || 0;
    const l = Math.round(rp / tarifPerLiter);
    setInputLiterBebas(l > 0 ? String(l) : "");
  };

  const volumeFinalL = modePilihan === "paket" ? literTerpilih : Number(inputLiterBebas) || 0;
  const totalHargaRp = Math.round(volumeFinalL * tarifPerLiter);

  const handleBayar = async () => {
    if (!meterAktif) {
      setPesanGalat("Pilih meter tujuan terlebih dahulu.");
      return;
    }
    if (volumeFinalL < 500) {
      setPesanGalat("Pembelian minimal adalah 500 liter.");
      return;
    }

    setPesanGalat(null);
    setMemuatBayar(true);
    setTahapBayar("Menghubungkan ke gerbang pembayaran...");

    try {
      const res = await api<{
        invoiceId: string;
        jumlahRp: number;
        status: string;
        volumeL: number;
        kode?: string;
        meterId: string;
        qrString?: string | null;
        vaNumber?: string | null;
      }>("/api/pembayaran", {
        method: "POST",
        body: JSON.stringify({
          meterId: meterAktif.id,
          liter: volumeFinalL,
          metode,
        }),
      });

      setTahapBayar("Menerbitkan tagihan dan token air...");

      // Simpan ringkasan transaksi & token ke sessionStorage agar halaman invoice langsung tampil tanpa blank
      if (typeof window !== "undefined") {
        if (res.kode) {
          sessionStorage.setItem(`jernih_token_${res.invoiceId}`, res.kode);
        }
        sessionStorage.setItem(
          `jernih_tx_${res.invoiceId}`,
          JSON.stringify({
            invoiceId: res.invoiceId,
            meterId: res.meterId,
            volumeL: res.volumeL,
            jumlahRp: res.jumlahRp,
            metode,
            status: res.status,
            qrString: res.qrString,
            nomorVa: res.vaNumber,
            dibuatPada: new Date().toISOString(),
          }),
        );
      }

      router.push(`/bayar/${res.invoiceId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memproses tagihan pembelian. Silakan coba kembali.");
      }
      setMemuatBayar(false);
      setTahapBayar(null);
    }
  };

  return {
    meter,
    meterAktif,
    pilihMeter,
    tarifPerLiter,
    golonganNama,
    daftarPaket,
    modePilihan,
    setModePilihan,
    literTerpilih,
    setLiterTerpilih,
    inputLiterBebas,
    inputRupiahBebas,
    handleUbahLiterBebas,
    handleUbahRupiahBebas,
    metode,
    setMetode,
    memuatBayar,
    tahapBayar,
    pesanGalat,
    volumeFinalL,
    totalHargaRp,
    handleBayar,
  };
}
