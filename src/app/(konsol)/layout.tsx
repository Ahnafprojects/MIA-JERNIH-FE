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
 * Bagian yang membaca rute saat ini ada di `_nav.tsx` dan dibungkus
 * `<Suspense>`. Itu BUKAN pilihan gaya: `usePathname()` adalah data runtime,
 * dan Next.js 16 menggagalkan seluruh build (`CLIENT_HOOK_DYNAMIC`) kalau
 * dipanggil di luar Suspense. Kalau menambah apa pun di sini yang membaca
 * rute, URL, atau parameter pencarian, taruh di `_nav.tsx` juga.
 *
 * Yang SENGAJA belum ada: penjaga rute dan pemeriksaan peran. Itu bagian
 * FE#3 yang menunggu autentikasi sungguhan (BE#1). Menulisnya sekarang
 * berarti membuat penjaga palsu yang selalu meluluskan — dan penjaga yang
 * selalu meluluskan lebih berbahaya daripada tidak ada, karena orang
 * berhenti memeriksanya.
 */

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { TombolTema } from "@/components/ui/tema";
import { LogoJernih, MerekJernih } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
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
          "fixed inset-y-0 left-0 z-50 overflow-y-auto",
          // Laci di ponsel SELALU lebar penuh. Meringkas jadi ikon saja
          // masuk akal di layar lebar yang menukar ruang dengan konteks,
          // tapi di laci yang menutupi layar tidak ada ruang yang dihemat —
          // yang hilang cuma labelnya.
          ringkas ? "w-[15.5rem] lg:w-[4.25rem]" : "w-[15.5rem]",
          "transition-[translate] duration-200 motion-reduce:transition-none",
          // Di layar lebar laci selalu terbuka. `!` wajib: ia harus
          // mengalahkan gaya sebaris di bawah, dan hanya `!important` yang
          // bisa melakukannya.
          "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0!",
        )}
        /*
         * Geserannya DITULIS SEBARIS, bukan lewat sepasang kelas bergantian.
         *
         * Versi sebelumnya memakai `translate-x-0` / `-translate-x-full`
         * bergantian, dan lacinya berhenti di tengah: kelasnya berganti dan
         * `aria-expanded` ikut berubah, tapi nilai `translate` terhitung
         * tetap `-100%`. Dua kelas yang sama spesifisitasnya diputuskan oleh
         * URUTAN DI BERKAS CSS, bukan oleh urutan penulisan di `className` —
         * jadi yang menang bisa yang salah, dan tidak terlihat dari kode ini.
         *
         * Gaya sebaris tidak punya masalah itu: tidak ada yang bisa
         * mengalahkannya kecuali `!important`, dan itulah yang dipakai varian
         * `lg:` di atas untuk layar lebar.
         *
         * Tailwind v4 memakai properti `translate`, BUKAN `transform` —
         * karena itu transisinya `transition-[translate]`. Dengan
         * `transition-transform` geserannya tidak pernah teranimasi.
         */
        style={{ translate: buka ? "0%" : "-100%" }}
        aria-label="Navigasi konsol"
      >
        <div
          className={cn(
            "flex items-center gap-2 py-5",
            ringkas ? "px-5 lg:justify-center lg:px-0" : "px-5 justify-between",
          )}
        >
          {/*
            Memakai komponen merek, BUKAN teks "Jernih" biasa.
            Versi pertama menulis namanya sebagai teks polos, jadi satu-satunya
            tempat di konsol yang seharusnya membawa logo justru tidak
            membawanya — padahal ini layar yang dilihat petugas sepanjang hari.
            Saat diringkas yang tersisa lambangnya saja; namanya tetap sampai
            ke pembaca layar lewat `aria-label` pada tautannya.
          */}
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

        <nav className={cn("pb-6", ringkas ? "px-3 lg:px-2.5" : "px-3")}>
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

            {/* Pelipat sidebar — hanya di layar lebar. Di ponsel sidebar-nya
                sudah berupa laci yang bisa ditutup. */}
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
  );
}
