"use client";

import { useEffect, useRef } from "react";

/** Arah datang. Dipilih per seksi supaya gerakannya punya alasan. */
type Arah =
  /** Naik 16px. Bawaan: searah dengan arah baca ke bawah. */
  | "naik"
  /** Datang dari kiri saat berdampingan, naik saat bertumpuk. */
  | "kiri"
  /** Hanya memudar, tanpa geser. Untuk baris tabel. */
  | "pudar";

const KELAS: Record<Arah, string[]> = {
  naik: ["gulir"],
  kiri: ["gulir", "gulir-kiri"],
  pudar: ["gulir", "gulir-pudar"],
};

/** Jeda terpanjang yang mungkin, untuk membersihkan `transition-delay`. */
const DURASI_MS = 700;

/**
 * Seksi yang muncul sekali saat tergulir ke dalam layar.
 *
 * Gerakannya tipis dengan sengaja: naik 16px dan memudar masuk, cukup untuk
 * mengarahkan mata ke baris pertama seksi berikutnya — bukan pertunjukan.
 *
 * Kelas penyembunyinya DIPASANG DARI JAVASCRIPT, tidak dari HTML server.
 * Kalau sebaliknya, pengunjung tanpa JavaScript — atau siapa pun saat skrip
 * gagal dimuat — hanya melihat halaman kosong. Di sini kegagalan apa pun
 * berakhir pada seksi yang terlihat penuh.
 *
 * Yang sudah berada di dalam layar saat halaman dimuat tidak disembunyikan
 * sama sekali: bagian itu sudah ditangani urutan masuk hero, dan
 * menyembunyikannya lalu memunculkannya kembali terlihat sebagai kedipan.
 *
 * Dengan `pilih`, yang disembunyikan bukan wadahnya melainkan elemen di
 * dalamnya satu per satu — baris daftar, langkah, baris tabel — dengan jeda
 * `langkah` di antaranya. Wadahnya sendiri tidak pernah ikut beranimasi:
 * dua transform bertumpuk membuat gerakannya terbaca dua kali dan ramai.
 */
export function Muncul({
  sebagai = "div",
  className,
  pilih,
  arah = "naik",
  langkah = 80,
  tunda = 0,
  children,
}: {
  sebagai?: "div" | "section";
  className?: string;
  /** Pemilih CSS untuk anak yang dimunculkan berjenjang. Kosong = wadahnya. */
  pilih?: string;
  arah?: Arah;
  /** Jeda antar anak, dalam milidetik. */
  langkah?: number;
  /** Jeda awal sebelum anak pertama, dalam milidetik. */
  tunda?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const kotak = el.getBoundingClientRect();
    if (kotak.top < window.innerHeight * 0.92) return;

    const sasaran = pilih
      ? Array.from(el.querySelectorAll<HTMLElement>(pilih))
      : [el];
    if (sasaran.length === 0) return;

    sasaran.forEach((s, i) => {
      s.classList.add(...KELAS[arah]);
      const jeda = tunda + i * langkah;
      if (jeda > 0) s.style.transitionDelay = `${jeda}ms`;
    });

    let bersihkan = 0;

    const pengamat = new IntersectionObserver(
      (masukan) => {
        if (!masukan.some((m) => m.isIntersecting)) return;
        for (const s of sasaran) s.classList.add("gulir-tampil");
        // Sekali saja. Seksi yang berkedip tiap kali digulir melewatinya
        // berhenti mengarahkan perhatian dan mulai mengganggu.
        pengamat.disconnect();
        // Jeda inline dilepas setelah perjalanannya selesai, supaya ia tidak
        // menempel dan memperlambat transisi lain pada elemen yang sama.
        bersihkan = window.setTimeout(
          () => {
            for (const s of sasaran) s.style.transitionDelay = "";
          },
          tunda + sasaran.length * langkah + DURASI_MS,
        );
      },
      { threshold: 0.04, rootMargin: "0px 0px -10% 0px" },
    );
    pengamat.observe(el);

    return () => {
      pengamat.disconnect();
      if (bersihkan) window.clearTimeout(bersihkan);
    };
  }, [pilih, arah, langkah, tunda]);

  if (sebagai === "section") {
    return (
      <section ref={ref} className={className}>
        {children}
      </section>
    );
  }
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
