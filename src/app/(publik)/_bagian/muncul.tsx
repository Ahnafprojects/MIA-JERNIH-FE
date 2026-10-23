"use client";

import { useEffect, useRef } from "react";

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
 */
export function Muncul({
  sebagai = "div",
  className,
  children,
}: {
  sebagai?: "div" | "section";
  className?: string;
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

    el.classList.add("gulir");

    const pengamat = new IntersectionObserver(
      (masukan) => {
        for (const m of masukan) {
          if (!m.isIntersecting) continue;
          m.target.classList.add("gulir-tampil");
          // Sekali saja. Seksi yang berkedip tiap kali digulir melewatinya
          // berhenti mengarahkan perhatian dan mulai mengganggu.
          pengamat.unobserve(m.target);
        }
      },
      { threshold: 0.04, rootMargin: "0px 0px -10% 0px" },
    );
    pengamat.observe(el);

    return () => pengamat.disconnect();
  }, []);

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
