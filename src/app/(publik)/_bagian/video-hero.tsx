"use client";

import { useEffect, useState } from "react";

/**
 * Klip latar hero.
 *
 * Isinya cerita, bukan hiasan: meteran berdebu yang angkanya tak terbaca →
 * tagihan yang tak bisa diperiksa → air membasuh layar → angka terbaca
 * menembus air.
 *
 * Dipasang sebagai LATAR, jadi dua hal harus dijaga:
 *
 * 1. Teks di atasnya tetap terbaca. Klip ini berpindah dari adegan gelap ke
 *    adegan terang, jadi tidak ada satu pun warna teks yang aman di atasnya
 *    tanpa tabir. Tabirnya memakai token `canvas` — ia ikut tema, sehingga
 *    kontras tetap terjaga di terang maupun gelap tanpa dua aturan terpisah.
 * 2. `prefers-reduced-motion` tetap dihormati: videonya bahkan tidak diunduh
 *    (`preload="none"`), hanya poster diam yang tampil. Itu accommodation
 *    pengganti tombol jeda, yang sengaja tidak dipasang agar klipnya berjalan
 *    terus tanpa kendali di layar.
 */
export function VideoHero() {
  const [hemat, setHemat] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const terapkan = () => setHemat(mq.matches);
    terapkan();
    mq.addEventListener("change", terapkan);
    return () => mq.removeEventListener("change", terapkan);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {hemat ? (
        /*
          Saat gerakan dikurangi, elemen <video> TIDAK dirender sama sekali —
          diganti gambar diam.

          Sebelumnya videonya tetap dipasang dengan autoPlay dimatikan, dan
          hasilnya Chrome menempelkan overlay tombol putar raksasa di
          tengahnya. Elemen video yang terjeda selalu menawarkan dirinya untuk
          diputar; satu-satunya cara menghilangkan tawaran itu adalah tidak
          memasang elemennya.
        */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero-poster.jpg"
          alt=""
          className="size-full object-cover object-[72%_center]"
        />
      ) : (
        <video
          // `playsInline` wajib: tanpa ini iOS merebut layar penuh saat putar.
          playsInline
          muted
          loop
          autoPlay
          preload="auto"
          poster="/hero-poster.jpg"
          // Titik fokus digeser ke kanan: subjek klip (tabung) harus duduk di
          // zona yang tabirnya tipis, bukan tertutup kolom teks.
          className="size-full object-cover object-[72%_center]"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/*
        Tabir ASIMETRIS.
        
        Versi pertama memakai satu tabir pekat merata, dan hasilnya kontras
        teks 15:1 — aman, tapi videonya tersapu habis sampai hanya tersisa
        bayangan. Tabir yang menutupi gambarnya sendiri tidak ada gunanya.
        
        Sekarang: lapis dasar tipis saja untuk meredam lonjakan terang klip,
        lalu gradien yang nyaris penuh di sisi kiri tempat teks duduk dan
        habis sebelum tengah. Teks aman, gambar tetap terbaca.
      */}
      <div className="absolute inset-0 bg-canvas/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-canvas from-25% via-canvas/85 via-45% to-transparent to-70%" />

      {/* Menyatukan hero dengan pita statistik di bawahnya. */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-canvas" />
    </div>
  );
}
