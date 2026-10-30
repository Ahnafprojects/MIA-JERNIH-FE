"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { Menu, X, Bell } from "lucide-react";
import { LogoJernih, MerekJernih } from "@/components/layout/logo";
import { TombolTema } from "@/components/ui/tema";
import { PenjagaRute } from "@/lib/penjaga-rute";
import { NavPortal, PemilihMeter, AvatarMenu } from "./_nav-portal";

export default function LayoutPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuBuka, setMenuBuka] = useState(false);

  useEffect(() => {
    if (!menuBuka) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuBuka(false);
    };
    document.addEventListener("keydown", esc);
    const semula = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = semula;
    };
  }, [menuBuka]);

  return (
    <PenjagaRute peranDiizinkan={["WARGA"]}>
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        {/* Top bar lengket */}
        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setMenuBuka(true)}
                aria-expanded={menuBuka}
                className="grid size-10 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink md:hidden"
                aria-label="Buka navigasi"
              >
                <Menu size={20} />
              </button>

              <Link href="/beranda" className="flex items-center">
                <MerekJernih sub="Portal warga" />
              </Link>

              <nav className="hidden md:block">
                <Suspense fallback={null}>
                  <NavPortal />
                </Suspense>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Suspense fallback={null}>
                <PemilihMeter />
              </Suspense>

              <Link
                href="/notifikasi"
                className="grid size-9 place-items-center rounded-[3px] border border-line bg-soft text-muted hover:text-ink"
                aria-label="Lihat notifikasi"
              >
                <Bell size={16} />
              </Link>

              <TombolTema className="grid size-9 place-items-center rounded-[3px] border border-line bg-soft text-muted hover:text-ink" />

              <Suspense fallback={null}>
                <AvatarMenu />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Laci navigasi mobile (390px) */}
        {menuBuka ? (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <button
              type="button"
              onClick={() => setMenuBuka(false)}
              className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
              aria-label="Tutup navigasi"
            />
            <div className="relative z-10 flex w-72 max-w-[80vw] flex-col bg-surface p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <LogoJernih size={24} className="text-brand-600 dark:text-accent" />
                <button
                  type="button"
                  onClick={() => setMenuBuka(false)}
                  className="grid size-9 place-items-center rounded-[3px] text-muted hover:text-ink"
                  aria-label="Tutup menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-4 flex-1">
                <Suspense fallback={null}>
                  <NavPortal onPilih={() => setMenuBuka(false)} />
                </Suspense>
              </nav>
            </div>
          </div>
        ) : null}

        <main className="flex-1">{children}</main>
      </div>
    </PenjagaRute>
  );
}
