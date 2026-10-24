"use client";

/**
 * Denyut penyegaran: penanda hidup, umur data, dan tombol segarkan.
 *
 * ── Kenapa ini komponen tersendiri ────────────────────────────────────
 *
 * Hitungannya berdetak sekali per detik. Kalau detaknya disimpan sebagai
 * state halaman, SELURUH dashboard — tabel dua belas baris, grafik tiga
 * puluh titik, empat daftar — digambar ulang enam puluh kali semenit hanya
 * supaya satu angka kecil di pojok berubah. Yang lebih buruk daripada
 * borosnya: tiap gambar ulang membuat fungsi format grafik berganti
 * identitas, dan Recharts memulai lagi animasi menggambarnya — garisnya
 * tidak pernah sempat selesai, dan grafiknya tampak kosong.
 *
 * Dengan detaknya dikurung di sini, yang berubah tiap detik hanya komponen
 * seukuran satu baris teks.
 *
 * ── Kenapa umur, bukan jam ────────────────────────────────────────────
 *
 * "Diperbarui 13.42.07" tetap terlihat mutakhir satu jam setelah
 * penyegarannya mati. Hitungan yang berjalan 0 → 12 lalu kembali ke 0
 * adalah satu-satunya tanda yang langsung terbaca saat pengambilannya
 * BERHENTI bekerja.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePill } from "@/components/domain/live";

/** Jeda pengambilan ulang. Cukup rapat untuk terasa hidup, cukup longgar
 *  untuk tidak membanjiri backend dengan 300 permintaan per jam per petugas. */
export const JEDA_SEGAR_DETIK = 12;

export function DenyutSegar({
  memuat,
  menyegarkan,
  onSegarkan,
}: {
  memuat: boolean;
  menyegarkan: boolean;
  /** Harus stabil antar-render, mis. `muatUlang` dari `useApi`. */
  onSegarkan: () => void;
}) {
  const [umur, setUmur] = useState(0);
  const hitung = useRef(0);

  const segarkan = useCallback(() => {
    hitung.current = 0;
    setUmur(0);
    onSegarkan();
  }, [onSegarkan]);

  useEffect(() => {
    const id = window.setInterval(() => {
      // Tab yang tersembunyi tidak dilihat siapa pun. Menyegarkannya hanya
      // membebani server dan baterai.
      if (document.hidden) return;
      hitung.current += 1;
      if (hitung.current >= JEDA_SEGAR_DETIK) {
        hitung.current = 0;
        onSegarkan();
      }
      setUmur(hitung.current);
    }, 1000);
    return () => window.clearInterval(id);
  }, [onSegarkan]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <LivePill />
      <span className="tabular font-mono text-[12px] text-muted">
        {memuat
          ? "Mengambil data…"
          : umur === 0
            ? "Baru diperbarui"
            : `Diperbarui ${umur} detik lalu`}
      </span>
      <Button
        varian="sekunder"
        ukuran="sm"
        onClick={segarkan}
        memuat={menyegarkan}
      >
        {menyegarkan ? null : (
          <RefreshCw size={14} aria-hidden className="shrink-0" />
        )}
        Segarkan
      </Button>
    </div>
  );
}
