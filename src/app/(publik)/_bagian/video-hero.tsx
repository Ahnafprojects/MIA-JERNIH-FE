"use client";

import { useEffect, useRef, useState } from "react";
import { useHematGerak } from "@/lib/hemat-gerak";

/**
 * Klip latar hero.
 *
 * Isinya cerita, bukan hiasan: meteran berdebu yang angkanya tak terbaca →
 * tagihan yang tak bisa diperiksa → air membasuh layar → angka terbaca
 * menembus air.
 *
 * Dipasang sebagai LATAR, jadi tiga hal harus dijaga:
 *
 * 1. Teks di atasnya tetap terbaca. Klip ini berpindah dari adegan gelap ke
 *    adegan terang, jadi tidak ada satu pun warna teks yang aman di atasnya
 *    tanpa tabir.
 * 2. `prefers-reduced-motion` dihormati: videonya bahkan tidak dirender,
 *    hanya poster diam. Itu accommodation pengganti tombol jeda, yang
 *    sengaja tidak dipasang agar klipnya berjalan terus tanpa kendali.
 * 3. TIDAK PERNAH ada tombol putar di layar. Lihat catatan di bawah.
 */

export function VideoHero() {
  const hematGerak = useHematGerak();
  /*
   * `gagalPutar` hanya pernah disetel dari DALAM callback `.catch()`, bukan
   * dari badan effect. Itu bedanya dengan memanggil `setState` serentak saat
   * effect jalan — yang memicu render berantai dan memang dilarang aturan
   * lint proyek ini.
   */
  const [gagalPutar, setGagalPutar] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const poster = hematGerak || gagalPutar;

  useEffect(() => {
    if (poster) return;
    const v = ref.current;
    if (!v) return;

    /*
     * AUTOPLAY YANG DITOLAK HARUS JATUH KE POSTER, BUKAN DIBIARKAN TERJEDA.
     *
     * Chrome mengizinkan autoplay untuk video bisu, tapi Safari jauh lebih
     * ketat dan bisa menolaknya. Video yang terjeda SELALU menawarkan dirinya
     * untuk diputar — di Safari berupa tombol putar besar di tengah layar,
     * tepat di atas judul hero. Klip ini latar; tombol putar di latar adalah
     * tawaran yang tidak pernah kami maksudkan, dan pengguna yang menekannya
     * malah mendapat kendali yang sengaja tidak disediakan.
     *
     * Jadi: kalau pemutaran ditolak, elemen videonya DILEPAS dan diganti
     * gambar diam. Tidak ada keadaan di mana tombol putar bisa muncul.
     */
    let batal = false;
    const coba = () => {
      v.play().catch(() => {
        if (!batal) setGagalPutar(true);
      });
    };
    coba();

    /*
     * Tab yang kembali aktif: Chrome dan Safari menjeda video di tab latar
     * dan tidak selalu melanjutkannya sendiri. Tanpa ini, pengguna yang
     * berpindah tab lalu kembali menemukan hero yang membeku.
     */
    const saatTampil = () => {
      if (document.visibilityState === "visible" && v.paused) coba();
    };
    document.addEventListener("visibilitychange", saatTampil);

    return () => {
      batal = true;
      document.removeEventListener("visibilitychange", saatTampil);
      // Melepas klip saat berpindah halaman. Tanpa ini ia terus berjalan di
      // latar dan tetap memakan daya di halaman yang tidak menampilkannya.
      v.pause();
    };
  }, [poster]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero-poster.jpg"
          alt=""
          className="size-full object-cover object-[72%_center]"
        />
      ) : (
        <video
          ref={ref}
          // `playsInline` wajib: tanpa ini iOS merebut layar penuh saat putar.
          playsInline
          muted
          loop
          autoPlay
          // `controls` TIDAK pernah dipasang, dan `disablePictureInPicture`
          // menutup satu-satunya kendali yang masih bisa muncul lewat menu
          // klik kanan di sebagian peramban.
          disablePictureInPicture
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
