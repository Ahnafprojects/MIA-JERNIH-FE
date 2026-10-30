import React from "react";
import Link from "next/link";
import { LogoJernih } from "@/components/layout/logo";
import { PanelAir } from "./panel-air";

interface AuthLayoutProps {
  children: React.ReactNode;
  judul: string;
  keterangan: string;
  langkah?: string;
}

export function AuthShell({
  children,
  judul,
  keterangan,
  langkah,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
      {/* ── Kolom 1: Panel Merek Berlatar Gelap ── */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-console p-6 text-on-console sm:p-10 lg:p-14">
        {/* Latar bergerak: kolom ukur yang terisi air melewati garis takar. */}
        <PanelAir />

        {/* Bilah atas panel merek */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoJernih size={28} className="text-brand-500" />
            <span className="font-display text-xl font-black tracking-tight text-on-console">
              Jernih
            </span>
          </Link>
          {/*
            Keping berdenyut, bukan kotak bertulis "TRANSPARANSI AIR".
            Kotak persegi berhuruf kapital semua terbaca seperti stiker
            kategori: ia menamai halaman, bukan memberi tahu apa pun. Yang
            dipakai sekarang menyatakan sesuatu yang bisa diperiksa orang —
            portalnya terbuka tanpa akun — dan titik yang berdenyut
            mengulang bahasa penanda status yang sudah ada di konsol.
          */}
          <Link
            href="/statistik"
            className="group inline-flex items-center gap-2 rounded-full border border-console-2 bg-console-2/40 py-1 pr-3 pl-2.5 font-mono text-[11px] tracking-wide text-on-console-muted transition-colors hover:border-accent/40 hover:text-on-console"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Data publik, tanpa akun
          </Link>
        </div>

        {/*
          Blok merek: judul, lalu tiga hal yang benar-benar bisa dilakukan.
          Hanya di layar lebar — di ponsel kolom ini menyusut jadi bilah
          tipis dan isinya akan mendorong formulirnya turun.
        */}
        <div className="relative z-10 mt-8 mb-20 hidden lg:block">
          {/*
            Judulnya menggemakan hero di halaman depan ("Airnya jernih.
            Layanannya juga.") — satu produk harus berbicara dengan kalimat
            yang sama di pintu depan dan di pintu masuk.

            Kutipan berpetik yang lama diganti: ia berbunyi seperti slogan
            poster, tidak bisa dibuktikan, dan tidak memberi tahu calon
            pengguna apa pun tentang apa yang menunggunya setelah masuk.
          */}
          <h2 className="max-w-[16ch] font-display text-4xl leading-[1.05] font-black tracking-[-0.03em] text-on-console xl:text-5xl">
            Airnya jernih.
            <br />
            <span className="text-accent">Angkanya juga.</span>
          </h2>

          <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-on-console-muted">
            Satu pintu masuk untuk warga dan petugas PDAM. Yang dilihat warga
            dan yang dilihat petugas adalah angka yang sama persis.
          </p>

          {/*
            Daftar bernomor dengan indeks monospace — perangkat yang sama
            dengan seksi "Yang biasanya tertutup, di sini dibuka" di halaman
            depan. Bukan ikon: tiga ikon tetes air berjajar tidak membedakan
            apa pun, sedangkan 01/02/03 memberi urutan baca.
          */}
          <ul className="mt-10 max-w-sm">
            {[
              ["01", "Debit dan saldo waktu nyata", "Terbaca saat airnya mengalir, bukan akhir bulan."],
              ["02", "Riwayat yang bisa diperiksa", "Tiap liter dan tiap token punya catatannya."],
              ["03", "Pengaduan yang bisa dilacak", "Nomor tiket, tenggat, dan siapa yang menangani."],
            ].map(([no, judulBaris, isi], i) => (
              <li
                key={no}
                className="flex gap-4 border-t border-console-2 py-3.5 animate-[masuk-naik_0.5s_ease-out_both]"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <span className="pt-px font-mono text-[11px] font-bold text-accent">
                  {no}
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-on-console">
                    {judulBaris}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-on-console-muted">
                    {isi}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer panel */}
        <div className="relative z-10 hidden font-mono text-[11px] text-on-console-muted lg:block">
          &copy; 2026 Jernih &middot; Web In Action MIA 2026
        </div>
      </aside>

      {/* ── Kolom 2: Form Panel ── */}
      <main className="flex flex-1 flex-col justify-center bg-canvas px-4 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-[420px]">
          {langkah ? (
            <div className="mb-4 inline-flex animate-[masuk-naik_0.5s_ease-out_both] items-center gap-2 rounded-[2px] bg-soft px-2 py-1 font-mono text-xs font-semibold text-brand-700 dark:text-accent">
              <span>{langkah}</span>
            </div>
          ) : null}

          <h1 className="animate-[masuk-naik_0.5s_ease-out_0.06s_both] font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
            {judul}
          </h1>
          <p className="mt-2 animate-[masuk-naik_0.5s_ease-out_0.12s_both] text-sm text-muted text-balance">
            {keterangan}
          </p>

          <div className="mt-8 animate-[masuk-naik_0.5s_ease-out_0.2s_both]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
