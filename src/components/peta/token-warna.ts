"use client";

import { useEffect, useState } from "react";
import type { StatusZona } from "@/types/publik";
import { STATUS } from "./status-zona";

export type WarnaStatus = Record<StatusZona, string>;

/**
 * Membaca warna status dari token CSS, bukan dari hex yang ditulis ulang.
 *
 * MapLibre mengecat poligon di kanvas WebGL: ia tidak mengerti `var(--…)` dan
 * tidak ikut berganti saat kelas `dark` dipasang. Jadi nilainya harus dibaca
 * sebagai warna jadi lewat `getComputedStyle`, lalu dibaca ULANG setiap kali
 * tema berganti — kalau tidak, peta tetap memakai warna tema terang di atas
 * basemap gelap, dan itulah satu-satunya bagian halaman yang tertinggal.
 *
 * Tidak ada hex cadangan di berkas ini dengan sengaja. Hex cadangan akan
 * diam-diam dipakai saat token berubah nama, dan peta berhenti sewarna dengan
 * lencana di sebelahnya tanpa ada yang menyadarinya.
 */
function baca(): WarnaStatus | null {
  const gaya = getComputedStyle(document.documentElement);
  const hasil = {} as WarnaStatus;
  for (const [kunci, arti] of Object.entries(STATUS)) {
    const nilai = gaya.getPropertyValue(arti.tokenWarna).trim();
    if (!nilai) return null;
    hasil[kunci as StatusZona] = nilai;
  }
  return hasil;
}

export function useWarnaStatus(): WarnaStatus | null {
  // Komponen ini hanya dimuat di klien (`ssr: false`), jadi `document` sudah
  // ada sejak render pertama dan peta tidak pernah sempat tampil tanpa warna.
  const [warna, setWarna] = useState<WarnaStatus | null>(() =>
    typeof document === "undefined" ? null : baca(),
  );

  useEffect(() => {
    // Identitas objek dipertahankan saat nilainya tidak berubah: `warna` ikut
    // jadi bahan `useMemo` data GeoJSON, dan objek baru tiap render akan
    // memaksa seluruh lapisan peta digambar ulang tanpa alasan.
    const perbarui = () =>
      setWarna((lama) => {
        const baru = baca();
        if (!baru) return lama;
        if (
          lama &&
          (Object.keys(baru) as StatusZona[]).every((k) => lama[k] === baru[k])
        ) {
          return lama;
        }
        return baru;
      });
    perbarui();

    const pengamat = new MutationObserver(perbarui);
    pengamat.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => pengamat.disconnect();
  }, []);

  return warna;
}
