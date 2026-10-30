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
          <span className="rounded-[3px] border border-console-2 bg-console-2/60 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-accent uppercase">
            Transparansi Air
          </span>
        </div>

        {/* Teks inspiratif & filosofi takar air di layar desktop */}
        <div className="relative z-10 mt-8 mb-24 hidden lg:block">
          <p className="font-mono text-xs font-semibold tracking-widest text-accent uppercase">
            Melihat Menembus Air
          </p>
          <blockquote className="mt-4 font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-on-console sm:text-3xl text-balance">
            “Keterbukaan bukan sekadar angka di layar, melainkan hak warga atas setiap tetes air bersih.”
          </blockquote>
          <div className="takar-kepala mt-8 max-w-sm pt-4 text-xs leading-relaxed text-on-console-muted">
            Satu pintu masuk untuk seluruh warga dan petugas PDAM. Data debit, saldo, dan jaringan terintegrasi waktu nyata.
          </div>
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
