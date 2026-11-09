"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Tombol salin nomor pengaduan.
 *
 * ── Kenapa tidak cukup `navigator.clipboard.writeText()` ──────────────
 *
 * API papan klip hanya ada di konteks aman (HTTPS atau localhost), dan
 * bahkan di sana ia bisa ditolak: tab yang tidak sedang difokuskan, izin
 * yang dicabut, atau peramban dalam mode privat tertentu. Semua kegagalan
 * itu datang sebagai Promise yang DITOLAK — bukan pengecualian yang
 * terlempar.
 *
 * Versi sebelumnya di halaman ini menulis
 *
 *     navigator.clipboard.writeText(nomor);
 *     setSudahSalin(true);
 *
 * tanpa `await` dan tanpa `catch`. Dua akibatnya nyata: tombolnya menulis
 * "Nomor tersalin" pada setiap kegagalan — papan klip kosong, warga menempel
 * dan mendapat isi lama — dan penolakannya menjadi unhandled rejection di
 * konsol. Yang paling merugikan bukan gagalnya, melainkan BERBOHONGNYA:
 * orang yang diberi tahu "tersalin" tidak akan mencoba cara lain.
 *
 * Karena itu di sini keadaan "tersalin" hanya disetel SETELAH promisnya
 * benar-benar selesai, dan kegagalan punya tampilannya sendiri.
 *
 * ── Jalur cadangan ────────────────────────────────────────────────────
 *
 * `document.execCommand("copy")` sudah usang, tetapi ia satu-satunya yang
 * bekerja di konteks tidak aman — dan portal ini dibuka lewat alamat IP di
 * jaringan lokal saat demo, yang persis konteks tidak aman. Dipakai hanya
 * sebagai cadangan, tidak pernah sebagai jalur utama.
 */
export function SalinNomor({
  nomor,
  className,
  label = "Salin nomor",
}: {
  nomor: string;
  className?: string;
  label?: string;
}) {
  const [keadaan, setKeadaan] = useState<"diam" | "sukses" | "gagal">("diam");
  const jeda = useRef<number | null>(null);

  /*
   * Pengatur waktu dibersihkan saat komponen dilepas. Tanpa ini, berpindah
   * tab tepat setelah menekan tombol akan memanggil `setKeadaan` pada
   * komponen yang sudah tidak ada.
   */
  useEffect(() => {
    return () => {
      if (jeda.current !== null) window.clearTimeout(jeda.current);
    };
  }, []);

  const tandai = (hasil: "sukses" | "gagal") => {
    setKeadaan(hasil);
    if (jeda.current !== null) window.clearTimeout(jeda.current);
    /* Kegagalan ditahan lebih lama: pesannya perlu dibaca, bukan sekadar
       dilihat berkedip. */
    jeda.current = window.setTimeout(
      () => setKeadaan("diam"),
      hasil === "sukses" ? 2000 : 3500,
    );
  };

  const salin = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(nomor);
        tandai("sukses");
        return;
      }
      throw new Error("papan klip tidak tersedia");
    } catch {
      tandai(salinCaraLama(nomor) ? "sukses" : "gagal");
    }
  };

  const sukses = keadaan === "sukses";
  const gagal = keadaan === "gagal";

  return (
    <>
      <button
        type="button"
        onClick={() => void salin()}
        className={cn(
          "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
          sukses
            ? "border-success/40 bg-success-soft text-success"
            : gagal
              ? "border-danger/40 bg-danger-soft text-danger"
              : "border-line bg-surface text-muted hover:text-ink",
          className,
        )}
      >
        {sukses ? (
          <Check size={13} aria-hidden />
        ) : gagal ? (
          <X size={13} aria-hidden />
        ) : (
          <Copy size={13} aria-hidden />
        )}
        <span>{sukses ? "Tersalin" : gagal ? "Gagal menyalin" : label}</span>
      </button>

      {/*
        Pengumuman untuk pembaca layar dipisahkan dari teks tombol.
        Mengandalkan label tombol yang berubah saja tidak cukup: sebagian
        pembaca layar tidak mengumumkan ulang elemen yang baru saja
        ditekan, jadi orang yang tidak melihat layar tidak pernah tahu
        penyalinannya berhasil atau tidak.
      */}
      <span aria-live="polite" className="sr-only">
        {sukses
          ? `Nomor ${nomor} tersalin.`
          : gagal
            ? `Gagal menyalin. Salin manual nomor ${nomor}.`
            : ""}
      </span>
    </>
  );
}

/**
 * Cadangan untuk konteks tidak aman.
 *
 * `position: fixed` dan `opacity: 0` — bukan `display: none`. Elemen yang
 * tidak dirender tidak bisa dipilih, jadi `execCommand` tidak punya apa pun
 * untuk disalin. `fixed` juga menahan halaman supaya tidak melompat saat
 * elemennya difokuskan.
 */
function salinCaraLama(teks: string): boolean {
  try {
    const kotak = document.createElement("textarea");
    kotak.value = teks;
    kotak.setAttribute("readonly", "");
    kotak.style.position = "fixed";
    kotak.style.top = "0";
    kotak.style.left = "0";
    kotak.style.opacity = "0";
    document.body.appendChild(kotak);
    kotak.select();
    const berhasil = document.execCommand("copy");
    document.body.removeChild(kotak);
    return berhasil;
  } catch {
    return false;
  }
}
