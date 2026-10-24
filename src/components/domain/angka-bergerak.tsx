"use client";

import { useEffect, useRef, useState } from "react";
import { angka } from "@/lib/format";

/** Perlambatan di ujung — gerakan berhenti seperti jarum alat ukur, bukan rem mendadak. */
const keluar = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Angka yang berjalan menuju nilai barunya.
 *
 * Dipakai saat rentang waktu diganti: tanpa gerakan, 92,9 berganti jadi 88,4
 * dalam satu bingkai dan mata tidak sempat menyadari ada yang berubah.
 * Perjalanan angkanya yang memberi tahu "ini nilai yang lain", bukan sekadar
 * hiasan.
 *
 * Tiga hal yang dijaga:
 *
 * - `null` berarti server tidak mengirim angkanya. Ditampilkan em dash, dan
 *   TIDAK dianimasikan dari atau menuju nol — nol itu nilai yang sah, dan
 *   melintasinya akan terbaca sebagai hasil pengukuran sesaat. `NaN` dan tak
 *   hingga diperlakukan sama: keduanya bukan hasil pengukuran, dan menuliskan
 *   "NaN" di halaman publik lebih buruk daripada mengaku angkanya tidak ada.
 * - `prefers-reduced-motion` melompat langsung ke nilai akhir.
 * - Animasi dibatalkan saat nilai berganti di tengah jalan, supaya dua
 *   perjalanan tidak berebut menulis angka yang sama.
 */
export function AngkaBergerak({
  nilai: nilaiMasuk,
  desimal = 0,
  durasi = 650,
  className,
}: {
  nilai: number | null;
  desimal?: number;
  durasi?: number;
  className?: string;
}) {
  const nilai =
    typeof nilaiMasuk === "number" && Number.isFinite(nilaiMasuk)
      ? nilaiMasuk
      : null;
  const [tampil, setTampil] = useState<number | null>(nilai);
  const dariRef = useRef<number | null>(nilai);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const batalkan = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    batalkan();

    const dari = dariRef.current;

    // Tidak ada angka, atau belum pernah ada angka sebelumnya: langsung pasang.
    const hemat = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (nilai === null || dari === null || hemat) {
      dariRef.current = nilai;
      setTampil(nilai);
      return;
    }

    const mulai = performance.now();
    const jarak = nilai - dari;

    const langkah = (sekarang: number) => {
      const t = Math.min(1, (sekarang - mulai) / durasi);
      setTampil(dari + jarak * keluar(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(langkah);
      } else {
        dariRef.current = nilai;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(langkah);

    return batalkan;
  }, [nilai, durasi]);

  return (
    <span className={className}>
      {tampil === null ? "—" : angka(tampil, desimal)}
    </span>
  );
}
