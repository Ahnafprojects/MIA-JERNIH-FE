"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { DataPaketResponse, ModePilihan, PaketOpsi } from "../_tipe";

export function useBeli() {
  const router = useRouter();
  const { meter, meterAktif, pilihMeter } = useAuth();

  /*
   * `/beli?meter=<id>` memilih meter itu lebih dulu.
   *
   * Peringatan saldo menipis di halaman Notifikasi menautkan ke sini dengan
   * id meternya. Tanpa ini, warga dengan dua sambungan yang mengetuk
   * peringatan untuk meter kos bisa membeli token untuk meter rumah, karena
   * yang terpilih tetap meter aktif terakhir.
   *
   * Dibaca dari `window.location`, bukan `useSearchParams()`: yang kedua
   * menuntut batas Suspense di halaman, dan tanpanya `next build` berhenti
   * (lihat design.md §15.7). Diterapkan sekali saja, supaya pilihan warga
   * sesudahnya tidak ditimpa balik oleh parameter yang sama.
   */
  const meterDariTautan = useRef(false);
  useEffect(() => {
    if (meterDariTautan.current || meter.length === 0) return;
    meterDariTautan.current = true;
    const id = new URLSearchParams(window.location.search).get("meter");
    if (id && meter.some((m) => m.id === id)) pilihMeter(id);
  }, [meter, pilihMeter]);

  const [tarifPerLiter, setTarifPerLiter] = useState(7.5);
  /*
   * Batas satu kali pembelian, DIAMBIL DARI SERVER.
   *
   * Tanpa batas atas, warga bisa mengetik berapa pun digit sampai muncul
   * tagihan "Rp 15.000.000.000.000.000.000.000" yang menjulur keluar kartu —
   * dan server menerimanya. Pembatasan ini pernah ada lalu HILANG saat dua
   * cabang digabung, tanpa satu pun galat: build tetap hijau, halaman tetap
   * terbuka, hanya batasnya yang lenyap. Nilai di bawah cuma cadangan bila
   * `/api/paket` gagal dimuat; angka yang mengikat tetap milik server.
   */
  const [maksLiter, setMaksLiter] = useState(100_000);
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
        if (res.maksimalLiter) setMaksLiter(res.maksimalLiter);
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

  /*
   * Dipotong DI SUMBERNYA, bukan hanya ditolak saat menekan bayar: angka
   * yang mustahil tidak boleh sempat tergambar di kartu ringkasan. Kedua
   * arah — liter dan rupiah — harus dibatasi, kalau tidak batasnya bisa
   * dilewati lewat kolom yang satunya.
   */
  const handleUbahLiterBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    const n = Math.min(Number(angkaSaja) || 0, maksLiter);
    setInputLiterBebas(n > 0 ? String(n) : "");
    const rp = Math.round(n * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
  };

  const handleUbahRupiahBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    const rpMentah = Number(angkaSaja) || 0;
    const literMentah = Math.round(rpMentah / tarifPerLiter);
    const l = Math.min(literMentah, maksLiter);
    /* Rupiahnya ikut dipotong HANYA kalau liternya memang dipotong —
       kalau tidak, angka yang baru diketik warga dibulatkan ulang di
       bawah jarinya dan kolomnya terasa melawan. */
    const rp = l === literMentah ? rpMentah : Math.round(l * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
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
    if (volumeFinalL > maksLiter) {
      setPesanGalat(
        `Pembelian maksimal ${maksLiter.toLocaleString("id-ID")} liter sekali transaksi.`,
      );
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
    maksLiter,
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
