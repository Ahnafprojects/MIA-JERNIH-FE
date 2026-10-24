"use client";

import { useEffect, useState } from "react";
import { STATUS_METER } from "./status-meter";
import type { StatusMeter } from "./tipe";

export interface WarnaPeta {
  /** Warna lingkaran pin, per status. */
  status: Record<StatusMeter, string>;
  /** Permukaan kartu — dipakai sebagai garis tepi tipis pin saat zoom dekat. */
  permukaan: string;
  /** Aksen: cincin pin terpilih. Satu-satunya pemakaian aksen di peta ini. */
  aksen: string;
  /** Merek: isian dan garis batas zona. */
  merek: string;
}

/**
 * Daftar token yang harus dibaca peta, lengkap dengan tujuannya.
 *
 * Satu objek, satu pembacaan, satu pembandingan — supaya identitas objeknya
 * tidak berubah selama nilainya tidak berubah (lihat catatan di bawah).
 */
const TOKEN_LAIN = {
  permukaan: "--color-surface",
  aksen: "--color-accent",
  merek: "--color-brand-500",
} as const;

/**
 * Membaca warna peta dari token CSS, bukan dari hex yang ditulis ulang.
 *
 * MapLibre mengecat di kanvas WebGL: ia tidak mengerti `var(--…)` dan tidak
 * ikut berganti saat tema ditukar. Jadi nilainya dibaca sebagai warna JADI
 * lewat `getComputedStyle`, lalu dibaca ULANG setiap kali penanda tema di
 * `<html>` berubah — kalau tidak, pin tetap memakai warna tema terang di atas
 * basemap gelap, dan itu satu-satunya bagian halaman yang tertinggal.
 *
 * Diamati DUA atribut: `class` (kelas `dark` yang dibaca Tailwind) dan
 * `data-theme` (penanda eksplisit yang juga dipasang tombol tema). Mengamati
 * salah satunya saja bekerja hari ini dan diam-diam berhenti bekerja begitu
 * penanda yang lain dipakai sendirian.
 *
 * Tidak ada hex cadangan di berkas ini, dengan sengaja. Hex cadangan akan
 * diam-diam dipakai saat token berganti nama, dan peta berhenti sewarna
 * dengan lencana di sebelahnya tanpa ada yang menyadarinya.
 */
function baca(): WarnaPeta | null {
  const gaya = getComputedStyle(document.documentElement);

  const ambil = (token: string): string => gaya.getPropertyValue(token).trim();

  const status = {} as Record<StatusMeter, string>;
  for (const [kunci, arti] of Object.entries(STATUS_METER)) {
    const nilai = ambil(arti.tokenWarna);
    if (!nilai) return null;
    status[kunci as StatusMeter] = nilai;
  }

  const permukaan = ambil(TOKEN_LAIN.permukaan);
  const aksen = ambil(TOKEN_LAIN.aksen);
  const merek = ambil(TOKEN_LAIN.merek);
  if (!permukaan || !aksen || !merek) return null;

  return { status, permukaan, aksen, merek };
}

function sama(a: WarnaPeta, b: WarnaPeta): boolean {
  if (a.permukaan !== b.permukaan) return false;
  if (a.aksen !== b.aksen) return false;
  if (a.merek !== b.merek) return false;
  return (Object.keys(b.status) as StatusMeter[]).every(
    (k) => a.status[k] === b.status[k],
  );
}

export function useWarnaPeta(): WarnaPeta | null {
  // Komponen peta hanya dimuat di klien (`ssr: false`), jadi `document` sudah
  // ada sejak render pertama dan peta tidak pernah sempat tampil tanpa warna.
  const [warna, setWarna] = useState<WarnaPeta | null>(() =>
    typeof document === "undefined" ? null : baca(),
  );

  useEffect(() => {
    // Identitas objek dipertahankan saat nilainya tidak berubah: `warna` jadi
    // bahan `useMemo` cat lapisan, dan objek baru tiap render berarti seluruh
    // properti cat dikirim ulang ke MapLibre tanpa satu pun yang berubah.
    const perbarui = () =>
      setWarna((lama) => {
        const baru = baca();
        if (!baru) return lama;
        if (lama && sama(lama, baru)) return lama;
        return baru;
      });
    perbarui();

    const pengamat = new MutationObserver(perbarui);
    pengamat.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => pengamat.disconnect();
  }, []);

  return warna;
}
