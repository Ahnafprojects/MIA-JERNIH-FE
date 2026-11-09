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
 *
 * Sidebar bisa DILIPAT menjadi rel logo saja. Profil petugas, tombol keluar,
 * dan pengalih tema tinggal di bilah atas — bukan di kaki sidebar — supaya
 * identitas akun tetap terjangkau walau navigasi disembunyikan.
 */

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut,
  UserRound,
  Settings,
} from "lucide-react";
import { LogoJernih, MerekJernih } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { PenjagaRute } from "@/lib/penjaga-rute";
import { useAuth } from "@/lib/auth-context";
import { JudulKonsol, NavKonsol, NavKonsolRangka } from "./_nav";
import { setRingkas, useRingkas } from "./_ringkas";
import { TransisiHalaman } from "@/components/ui/transisi-halaman";

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

  /*
   * Konsol SELALU terang, apa pun preferensi global.
   *
   * Portal warga dan landing tetap memakai tema global (`jernih-tema`) seperti
   * semula; yang dipaksa terang hanya selama berada di /konsol. Saat keluar,
   * tema global dipulihkan dari localStorage supaya area lain tidak berubah.
   */
  useEffect(() => {
    const akar = document.documentElement;
    const gelapSemula = akar.classList.contains("dark");
    akar.classList.remove("dark");
    akar.dataset.theme = "light";
    return () => {
      let gelap = gelapSemula;
      try {
        gelap = localStorage.getItem("jernih-tema") === "gelap";
      } catch {
        // Mode penyamaran: pakai keadaan semula.
      }
      akar.classList.toggle("dark", gelap);
      akar.dataset.theme = gelap ? "dark" : "light";
    };
  }, []);

  return (
    <PenjagaRute peranDiizinkan={["OPERATOR", "SUPERVISOR", "TEKNISI"]}>
      <div
        className={cn(
          "min-h-dvh lg:grid",
          ringkas ? "lg:grid-cols-[4.75rem_1fr]" : "lg:grid-cols-[15.5rem_1fr]",
        )}
      >
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          id="sidebar-konsol"
          className={cn(
            "bg-console text-on-console",
            // `overflow-x-hidden` saja, JANGAN `overflow-hidden` penuh.
            //
            // Scrollbar di dalam panel gelap memang terbaca sebagai cacat, dan
            // pada tinggi layar biasa menunya memang muat tanpa digulir. Tetapi
            // mematikan gulir pada KEDUA sumbu membuat butir terakhir hilang
            // tanpa jalan apa pun untuk menjangkaunya begitu layarnya pendek.
            //
            // Terukur pada tinggi layar 480px: `scrollHeight` nav 496 melawan
            // `clientHeight` 396, dan "Analitik" serta "Audit" tidak bisa
            // dicapai sama sekali. Tinggi segitu bukan kasus aneh — jendela
            // yang dikecilkan, layar 1366x768 dengan bilah markah, atau
            // perbesaran sistem 125% sudah sampai ke sana.
            //
            // Gulir tegaknya dipasang di `<nav>` di bawah, sehingga scrollbar
            // hanya muncul ketika memang tidak muat.
            "fixed inset-y-0 left-0 z-50 flex flex-col overflow-x-hidden",
            ringkas ? "w-[15.5rem] lg:w-[4.75rem]" : "w-[15.5rem]",
            "transition-[translate] duration-200 motion-reduce:transition-none",
            "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0!",
          )}
          style={{ translate: buka ? "0%" : "-100%" }}
          aria-label="Navigasi konsol"
        >
          <div
            className={cn(
              "flex items-center gap-2 py-5",
              ringkas ? "px-5 lg:justify-center lg:px-0" : "justify-between px-5",
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
                    size={30}
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
              className="cincin-fokus-gelap -mr-2 grid size-11 place-items-center rounded-input text-on-console-muted hover:text-on-console lg:hidden"
              aria-label="Tutup menu"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {/* Menu tetap tampil saat dilipat — hanya ikonnya yang tersisa. */}
          <nav
            className={cn(
              // `overflow-y-auto`: scrollbar hanya lahir saat menunya tidak
              // muat. Pada tinggi layar biasa `scrollHeight === clientHeight`
              // sehingga tidak ada scrollbar sama sekali, jadi keberatan soal
              // "scrollbar di panel gelap" tetap terjawab — yang hilang hanya
              // kemungkinan butir menu menjadi tidak terjangkau.
              "min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4",
              ringkas ? "px-2" : "px-3",
            )}
          >
            <Suspense fallback={<NavKonsolRangka />}>
              <NavKonsol onPilih={() => setBuka(false)} />
            </Suspense>
          </nav>
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
          <header className="sticky top-0 z-30 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex min-h-14 items-center gap-3 rounded-full border border-white/50 bg-surface/72 px-4 shadow-[var(--kilau-tepi),var(--kedalaman-3)] backdrop-blur-xl backdrop-saturate-150 sm:px-5 dark:border-white/10">
              <button
                ref={tombolMenu}
                type="button"
                onClick={() => setBuka(true)}
                aria-expanded={buka}
                aria-controls="sidebar-konsol"
                className="cincin-fokus -ml-2 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-soft hover:text-ink lg:hidden"
              >
                <Menu size={18} aria-hidden />
                <span className="sr-only">Buka menu konsol</span>
              </button>

              <button
                type="button"
                onClick={() => setRingkas(!ringkas)}
                aria-pressed={ringkas}
                className="cincin-fokus -ml-2 hidden size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-soft hover:text-ink lg:grid"
              >
                {ringkas ? (
                  <PanelLeftOpen size={18} aria-hidden />
                ) : (
                  <PanelLeftClose size={18} aria-hidden />
                )}
                <span className="sr-only">
                  {ringkas ? "Tampilkan menu samping" : "Sembunyikan menu samping"}
                </span>
              </button>

              <h1 className="min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-[-0.01em]">
                <Suspense fallback="Konsol">
                  <JudulKonsol />
                </Suspense>
              </h1>

              <button
                type="button"
                className="cincin-fokus grid size-11 place-items-center rounded-full text-muted hover:bg-soft hover:text-ink"
                aria-label="Notifikasi"
              >
                <Bell size={17} aria-hidden />
              </button>

              <Link
                href="/konsol/pengaturan"
                className="cincin-fokus grid size-11 place-items-center rounded-full text-muted hover:bg-soft hover:text-ink"
                aria-label="Pengaturan"
              >
                <Settings size={17} aria-hidden />
              </Link>

              {/* Identitas petugas + keluar, pindah dari kaki sidebar. */}
              <div className="ml-1 flex items-center gap-1 border-l border-line pl-2">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-xs font-semibold leading-tight text-ink">
                    {pengguna?.nama ?? "Petugas"}
                  </p>
                  <p className="truncate font-mono text-[10px] leading-tight text-muted uppercase">
                    {pengguna?.peran ?? "PETUGAS"}
                  </p>
                </div>
                <span className="cincin-fokus grid size-11 place-items-center rounded-full bg-soft text-muted sm:hidden">
                  <UserRound size={17} aria-hidden />
                </span>
                <button
                  type="button"
                  onClick={keluar}
                  title="Keluar dari konsol"
                  className="cincin-fokus grid size-11 place-items-center rounded-full text-muted hover:bg-soft hover:text-danger"
                  aria-label="Keluar"
                >
                  <LogOut size={17} aria-hidden />
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <TransisiHalaman>{children}</TransisiHalaman>
          </main>
        </div>
      </div>
    </PenjagaRute>
  );
}
