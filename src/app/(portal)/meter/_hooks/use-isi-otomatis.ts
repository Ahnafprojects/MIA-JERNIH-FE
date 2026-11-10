"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

export type MetodeBayar = "QRIS" | "VA" | "EWALLET" | "GERAI";

/** Bentuk jawaban `GET`/`PUT /api/isi-otomatis` (BE src/rute/bayar.ts). */
export interface PengaturanIsiOtomatis {
  meterId: string;
  aktif: boolean;
  ambangL: number;
  volumeL: number;
  metode: MetodeBayar;
  terakhirPada: string | null;
}

export interface PaketIsi {
  volumeL: number;
  hargaRp: number;
}

interface JawabanPaket {
  tarifPerLiter: number;
  paket: PaketIsi[];
}

export type HasilSimpan = { tipe: "sukses" | "galat"; teks: string } | null;

/**
 * Batas yang SAMA dengan skema backend (`skemaIsiOtomatis`). Disalin supaya
 * kolom isian menolak lebih awal; penolakan yang berlaku tetap di server.
 */
export const AMBANG_MIN_L = 10;
export const AMBANG_MAKS_L = 50_000;

/**
 * Pengaturan isi otomatis untuk SATU meter.
 *
 * Disimpan per meter di backend, karena satu akun bisa memegang rumah dan
 * kos yang pola pemakaiannya berbeda. Karena itu hook ini dimuat ulang
 * setiap kali meter aktif berganti, dan draf yang belum disimpan ikut
 * dibuang: draf ambang milik rumah tidak boleh terbawa ke kos.
 */
export function useIsiOtomatis(meterId: string | null) {
  const [tersimpan, setTersimpan] = useState<PengaturanIsiOtomatis | null>(null);
  const [draf, setDraf] = useState<PengaturanIsiOtomatis | null>(null);
  const [paket, setPaket] = useState<JawabanPaket | null>(null);
  const [galatMuat, setGalatMuat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [hasil, setHasil] = useState<HasilSimpan>(null);

  useEffect(() => {
    if (!meterId) return;
    let batal = false;

    Promise.all([
      api<PengaturanIsiOtomatis>(
        `/api/isi-otomatis?meterId=${encodeURIComponent(meterId)}`,
      ),
      api<JawabanPaket>("/api/paket"),
    ])
      .then(([pengaturan, daftarPaket]) => {
        if (batal) return;
        setTersimpan(pengaturan);
        setDraf(pengaturan);
        setPaket(daftarPaket);
        setGalatMuat(null);
        setHasil(null);
      })
      .catch((e: unknown) => {
        if (batal) return;
        setTersimpan(null);
        setDraf(null);
        setGalatMuat(
          e instanceof ApiError
            ? e.message
            : "Pengaturan isi otomatis tidak bisa dimuat.",
        );
      });

    return () => {
      batal = true;
    };
  }, [meterId]);

  const ubah = useCallback(
    (perubahan: Partial<PengaturanIsiOtomatis>) => {
      setDraf((d) => (d ? { ...d, ...perubahan } : d));
      setHasil(null);
    },
    [],
  );

  const ambangSah =
    draf !== null &&
    Number.isInteger(draf.ambangL) &&
    draf.ambangL >= AMBANG_MIN_L &&
    draf.ambangL <= AMBANG_MAKS_L;

  const berubah =
    draf !== null &&
    tersimpan !== null &&
    (draf.aktif !== tersimpan.aktif ||
      draf.ambangL !== tersimpan.ambangL ||
      draf.volumeL !== tersimpan.volumeL ||
      draf.metode !== tersimpan.metode);

  const simpan = useCallback(async () => {
    if (!draf || !ambangSah) return;
    setMenyimpan(true);
    setHasil(null);
    try {
      const baru = await api<PengaturanIsiOtomatis>("/api/isi-otomatis", {
        method: "PUT",
        body: JSON.stringify({
          meterId: draf.meterId,
          aktif: draf.aktif,
          ambangL: draf.ambangL,
          volumeL: draf.volumeL,
          metode: draf.metode,
        }),
      });
      setTersimpan(baru);
      setDraf(baru);
      setHasil({
        tipe: "sukses",
        teks: baru.aktif
          ? "Isi otomatis aktif. Pembelian berikutnya terjadi saat saldo turun di bawah ambang."
          : "Isi otomatis dimatikan.",
      });
    } catch (e) {
      setHasil({
        tipe: "galat",
        teks:
          e instanceof ApiError
            ? e.message
            : "Pengaturan gagal disimpan. Coba lagi beberapa saat.",
      });
    } finally {
      setMenyimpan(false);
    }
  }, [draf, ambangSah]);

  /** Harga paket terpilih, atau null bila paketnya tidak ada di katalog. */
  const hargaTerpilih =
    draf && paket
      ? (paket.paket.find((p) => p.volumeL === draf.volumeL)?.hargaRp ??
        Math.round(draf.volumeL * paket.tarifPerLiter))
      : null;

  return {
    draf,
    paket: paket?.paket ?? [],
    hargaTerpilih,
    memuat: meterId !== null && draf === null && galatMuat === null,
    galatMuat,
    ambangSah,
    berubah,
    menyimpan,
    hasil,
    ubah,
    simpan,
  };
}
