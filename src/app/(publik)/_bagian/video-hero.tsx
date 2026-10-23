"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Klip pembuka hero.
 *
 * Isinya cerita, bukan hiasan: meteran berdebu yang angkanya tak terbaca →
 * tagihan yang tak bisa diperiksa → air membasuh layar → angka terbaca
 * menembus air. Masalahnya dijelaskan lebih dulu, baru produknya.
 *
 * Tiga hal yang ditangani di sini dan sering terlewat:
 *
 * 1. `prefers-reduced-motion` — pengguna yang mematikan animasi di sistemnya
 *    melihat bingkai diam, bukan video berjalan. Videonya bahkan tidak
 *    diunduh: `preload` jadi "none", jadi tidak ada 2,6 MB yang terbuang.
 * 2. Kendali putar/jeda. Konten bergerak yang berjalan lebih dari 5 detik
 *    wajib bisa dihentikan (WCAG 2.2.2) — dan itu juga sopan.
 * 3. Jalur gagal. Kalau videonya tidak termuat, poster tetap tampil dan
 *    halaman tetap utuh.
 */
export function VideoHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const [hemat, setHemat] = useState(false);
  const [jalan, setJalan] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const terapkan = () => {
      setHemat(mq.matches);
      setJalan(!mq.matches);
    };
    terapkan();
    mq.addEventListener("change", terapkan);
    return () => mq.removeEventListener("change", terapkan);
  }, []);

  function putarJeda() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setJalan(true);
    } else {
      v.pause();
      setJalan(false);
    }
  }

  return (
    <figure className="relative">
      {/* Bingkai mengulang bahasa alat ukur: garis takar di bibir atas. */}
      <div
        aria-hidden
        className="takar h-2 rounded-t-sheet border-x border-t border-line bg-surface"
      />

      <div className="relative overflow-hidden rounded-b-sheet border border-t-0 border-line bg-brand-900">
        <video
          ref={ref}
          // `playsInline` wajib: tanpa ini iOS merebut layar penuh saat putar.
          playsInline
          muted
          loop
          autoPlay={!hemat}
          preload={hemat ? "none" : "auto"}
          poster="/hero-poster.jpg"
          aria-hidden
          className="block aspect-video w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {!hemat ? (
          <button
            type="button"
            onClick={putarJeda}
            aria-label={jalan ? "Jeda video" : "Putar video"}
            className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-brand-900/70 text-white backdrop-blur-sm transition-colors hover:bg-brand-900/90"
          >
            {jalan ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </button>
        ) : null}
      </div>

      {/* Video tidak terbaca pembaca layar, jadi ceritanya ditulis juga. */}
      <figcaption className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
        Dari meteran yang angkanya tak terbaca dan tagihan yang tak bisa
        diperiksa, menjadi angka yang terlihat setiap saat.
      </figcaption>
    </figure>
  );
}
