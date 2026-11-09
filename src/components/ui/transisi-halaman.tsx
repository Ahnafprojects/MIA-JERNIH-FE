"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

/**
 * Transisi masuk setiap kali rute berpindah.
 *
 * Sebelumnya gerakan hanya ada di halaman depan: hero beranimasi, seksi
 * muncul saat digulir, lalu begitu warga masuk ke portal semuanya berhenti.
 * Berpindah dari Beranda ke Pemakaian terasa seperti halaman diganti paksa —
 * konten lama hilang, konten baru langsung terpampang tanpa jeda yang
 * memberi tahu mata bahwa sesuatu telah berubah.
 *
 * Kuncinya `key={pathname}`. React membuang pohon lama dan memasang yang baru
 * setiap kali jalurnya berganti, jadi animasinya terputar ulang pada tiap
 * perpindahan — bukan sekali saat aplikasi pertama dimuat.
 *
 * Gerakannya sengaja tipis: naik 10px dan memudar masuk dalam 320 milidetik.
 * Cukup untuk menandai pergantian, terlalu singkat untuk terasa sebagai
 * penundaan. Transisi halaman yang panjang berubah menjadi pajak waktu yang
 * dibayar berulang kali oleh orang yang sedang bekerja cepat.
 *
 * `prefers-reduced-motion` dihormati lewat kelas `motion-aware`, sama seperti
 * animasi lain di proyek ini.
 *
 * ── Kenapa ada `<Suspense>` di sini ──────────────────────────────────
 *
 * `usePathname()` membaca keadaan navigasi, dan keadaan itu belum ada saat
 * Next.js memprarender halaman di waktu bangun. Tanpa batas Suspense,
 * `next build` BERHENTI dengan `CLIENT_HOOK_DYNAMIC` pada rute berparameter
 * — dibuktikan oleh `/konsol/pelanggan/[id]`, yang menggagalkan seluruh
 * build. Batasnya diletakkan DI DALAM komponen ini, bukan dibebankan ke
 * setiap tata letak yang memakainya: syarat teknis milik hook ada di sini,
 * jadi penanganannya juga harus di sini.
 *
 * Cadangannya menggambar isi yang sama persis, hanya tanpa `key`. Halaman
 * tetap utuh dan tetap beranimasi masuk pada pemuatan pertama; yang belum
 * aktif hanya pemutaran ulang saat rute berganti, dan itu memang tidak
 * berarti apa-apa sebelum ada rute kedua untuk berpindah.
 */
export function TransisiHalaman({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="motion-aware halaman-masuk">{children}</div>}
    >
      <BerkunciPadaRute>{children}</BerkunciPadaRute>
    </Suspense>
  );
}

function BerkunciPadaRute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="motion-aware halaman-masuk">
      {children}
    </div>
  );
}
