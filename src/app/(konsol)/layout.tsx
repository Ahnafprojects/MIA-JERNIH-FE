"use client";

/**
 * Kerangka konsol petugas.
 *
 * Satu aplikasi, tiga peran — ini lapisan ketiga. Bedanya dengan halaman
 * publik bukan sekadar menu: publik dibaca sekali oleh orang yang penasaran,
 * konsol dipelototi delapan jam sehari oleh orang yang sama. Karena itu
 * sidebar-nya gelap dan tetap, sementara isinya terang: mata bekerja di satu
 * bidang terang yang tidak berpindah-pindah, dan navigasinya mundur ke
 * belakang.
 */

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, X, LogOut } from "lucide-react";
import { TombolTema } from "@/components/ui/tema";
import { LogoJernih, MerekJernih } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { PenjagaRute } from "@/lib/penjaga-rute";
import { useAuth } from "@/lib/auth-context";
import { JudulKonsol, NavKonsol, NavKonsolRangka } from "./_nav";
import { setRingkas, useRingkas } from "./_ringkas";

export default function LayoutKonsol({
  children,
}: {
  children: React.ReactNode;
}) {
  const [buka, setBuka] = useState(false);
  const ringkas = useRingkas();
  const tombolMenu = useRef<HTMLButtonElement>(null);
  const { pengguna, keluar } = useAuth();

  useEffect(() => {
    if (!buka) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBuka(false);
        tombolMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", esc);
    const semula = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = semula;
    };
  }, [buka]);

  return (
    <PenjagaRute peranDiizinkan={["OPERATOR", "SUPERVISOR", "TEKNISI"]}>
      <div
        className={cn(
          "min-h-dvh lg:grid",
          ringkas ? "lg:grid-cols-[4.25rem_1fr]" : "lg:grid-cols-[15.5rem_1fr]",
        )}
      >
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          id="sidebar-konsol"
          className={cn(
            "bg-console text-on-console",
            "fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto",
            ringkas ? "w-[15.5rem] lg:w-[4.25rem]" : "w-[15.5rem]",
            "transition-[translate] duration-200 motion-reduce:transition-none",
            "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0!",
          )}
          style={{ translate: buka ? "0%" : "-100%" }}
          aria-label="Navigasi konsol"
        >
          <div
            className={cn(
              "flex items-center gap-2 py-5",
              ringkas ? "px-5 lg:justify-center lg:px-0" : "px-5 justify-between",
            )}
          >
            <Link
              href="/"
              aria-label="Jernih — beranda"
              className="flex min-h-11 items-center"
            >
              {ringkas ? (
                <>
                  <LogoJernih
                    size={26}
                    className="hidden text-brand-500 lg:block"
                  />
                  <MerekJernih sub="Konsol petugas" className="lg:hidden" />
                </>
              ) : (
                <MerekJernih sub="Konsol petugas" />
              )}
            </Link>
            <button
              type="button"
              onClick={() => setBuka(false)}
              className="-mr-2 grid size-11 place-items-center rounded-[3px] text-on-console-muted hover:text-on-console lg:hidden"
              aria-label="Tutup menu"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <nav className={cn("flex-1 pb-4", ringkas ? "px-3 lg:px-2.5" : "px-3")}>
            <Suspense fallback={<NavKonsolRangka />}>
              <NavKonsol onPilih={() => setBuka(false)} />
            </Suspense>
          </nav>

          {/* Profil Petugas & Tombol Keluar di Sidebar Bawah */}
          <div className={cn("border-t border-console-2 p-3", ringkas && "lg:px-2")}>
            <div className={cn("flex items-center gap-2", ringkas && "lg:justify-center")}>
              {!ringkas ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-on-console">
                    {pengguna?.nama ?? "Petugas"}
                  </p>
                  <p className="truncate font-mono text-[10px] text-on-console-muted uppercase">
                    {pengguna?.peran}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={keluar}
                title="Keluar dari konsol"
                className="grid size-9 shrink-0 place-items-center rounded-[3px] text-on-console-muted hover:bg-console-2 hover:text-danger"
                aria-label="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Tirai laci — hanya di ponsel. */}
        {buka ? (
          <button
            type="button"
            onClick={() => setBuka(false)}
            className="fixed inset-0 z-40 bg-brand-900/50 lg:hidden"
            aria-label="Tutup menu"
            tabIndex={-1}
          />
        ) : null}

        <div className="flex min-w-0 flex-col">
          {/* ── Top bar ────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
            <div className="flex min-h-14 items-center gap-3 px-4 sm:px-6">
              <button
                ref={tombolMenu}
                type="button"
                onClick={() => setBuka(true)}
                aria-expanded={buka}
                aria-controls="sidebar-konsol"
                className="-ml-2 grid size-11 shrink-0 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink lg:hidden"
              >
                <Menu size={18} aria-hidden />
                <span className="sr-only">Buka menu konsol</span>
              </button>

              <button
                type="button"
                onClick={() => setRingkas(!ringkas)}
                aria-pressed={ringkas}
                className="-ml-2 hidden size-11 shrink-0 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink lg:grid"
              >
                {ringkas ? (
                  <PanelLeftOpen size={18} aria-hidden />
                ) : (
                  <PanelLeftClose size={18} aria-hidden />
                )}
                <span className="sr-only">
                  {ringkas ? "Lebarkan menu samping" : "Ringkas menu samping"}
                </span>
              </button>

              <h1 className="min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-[-0.01em]">
                <Suspense fallback="Konsol">
                  <JudulKonsol />
                </Suspense>
              </h1>

              <button
                type="button"
                className="grid size-11 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink"
                aria-label="Notifikasi"
              >
                <Bell size={17} aria-hidden />
              </button>
              <TombolTema className="grid size-11 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink" />
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </PenjagaRute>
  );
}
