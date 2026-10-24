"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MerekJernih } from "@/components/layout/logo";
import { TombolTema } from "@/components/ui/tema";

export type ButirMenu = { href: string; teks: string };

/** Dipakai oleh `aria-controls` pada tombol pembuka dan oleh `bilah-atas.css`. */
const ID_LACI = "laci-navigasi";

/** Isi laci yang bisa menerima fokus. Laci hanya berisi tautan dan tombol. */
const BISA_FOKUS = "a[href], button:not([disabled])";

/**
 * Tanda pembuka laci: tiga garis dengan panjang berbeda.
 *
 * Bentuknya diambil dari garis takar gelas ukur — panjang, pendek, panjang —
 * bukan tiga garis sama panjang. Masih terbaca sebagai "menu" karena
 * posisinya, tapi berasal dari dunia subjeknya sendiri.
 */
function GarisTakar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2.5 5.5h15M2.5 10h9M2.5 14.5h15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Bilah atas halaman publik.
 *
 * Satu komponen klien untuk SELURUH bilah, bukan hanya lacinya. Dua alasan:
 *
 * 1. Tabirnya harus `fixed` terhadap viewport, sedangkan `<header>` memakai
 *    `backdrop-blur` — dan `backdrop-filter` menjadikan elemennya blok
 *    penampung bagi keturunan `fixed`. Tabir yang ditaruh DI DALAM header
 *    karena itu hanya setinggi header, bukan setinggi layar. Dengan header
 *    dan tabir bersaudara di komponen yang sama, tabirnya kembali mengacu ke
 *    viewport tanpa perlu portal.
 * 2. Penanda halaman aktif (`aria-current`) butuh `usePathname`, yang hanya
 *    ada di komponen klien.
 *
 * Di bawah `lg` empat tautan navigasi pindah ke laci. Titik hentinya `lg`,
 * bukan `md`: diukur di browser, baris penuh (merek + empat tautan + tema +
 * Masuk) butuh ±860px, jadi di 768px dan 834px ia masih meluber.
 */
export function BilahAtas({ menu }: { menu: readonly ButirMenu[] }) {
  const jalur = usePathname();
  const [terbuka, setTerbuka] = useState(false);
  const tombolRef = useRef<HTMLButtonElement>(null);
  const laciRef = useRef<HTMLDivElement>(null);
  const pernahTerbuka = useRef(false);

  const tutup = useCallback(() => setTerbuka(false), []);

  /** Halaman yang sedang dibuka — penanda `aria-current="page"`. Sub-rute
      ikut terhitung, mis. `/lacak/ABC` tetap menyalakan "Lacak Pengaduan". */
  const halamanIni = (href: string) =>
    jalur === href || jalur.startsWith(`${href}/`);

  // Pindah halaman lewat tombol maju/mundur peramban juga harus menutupnya.
  // Disetel SAAT RENDER, bukan di dalam efek: React membuang hasil render ini
  // dan mengulangnya dengan nilai baru sebelum apa pun sempat tergambar, jadi
  // tidak ada render berantai dan tidak ada satu bingkai pun berisi laci
  // terbuka di halaman yang sudah berganti.
  const [jalurTerpakai, setJalurTerpakai] = useState(jalur);
  if (jalur !== jalurTerpakai) {
    setJalurTerpakai(jalur);
    setTerbuka(false);
  }

  // Melebarkan jendela sampai navigasi penuh muncul: lacinya tidak relevan
  // lagi, dan kalau dibiarkan terbuka ia mengunci gulir halaman tanpa ada
  // tombol tutup yang terlihat.
  useEffect(() => {
    const ambang = window.matchMedia("(min-width: 64rem)");
    const periksa = () => {
      if (ambang.matches) setTerbuka(false);
    };
    ambang.addEventListener("change", periksa);
    return () => ambang.removeEventListener("change", periksa);
  }, []);

  // Halaman di belakang tidak ikut tergulir. `overflow` pada <body> merambat
  // ke viewport selama <html> masih `visible`, jadi ini mengunci gulir
  // dokumen tanpa memindahkan posisinya.
  useEffect(() => {
    if (!terbuka) return;
    const badan = document.body;
    const gulirSemula = badan.style.overflow;
    const lebarBilahGulir =
      window.innerWidth - document.documentElement.clientWidth;
    badan.style.overflow = "hidden";
    if (lebarBilahGulir > 0) badan.style.paddingRight = `${lebarBilahGulir}px`;
    return () => {
      badan.style.overflow = gulirSemula;
      badan.style.paddingRight = "";
    };
  }, [terbuka]);

  // Esc menutup; Tab berputar di dalam laci selama ia terbuka.
  useEffect(() => {
    if (!terbuka) return;
    const laci = laciRef.current;
    if (!laci) return;

    laci.querySelector<HTMLElement>(BISA_FOKUS)?.focus();

    // Ditulis sebagai const, bukan deklarasi fungsi: deklarasi ikut terangkat
    // ke atas penyempitan `laci`, jadi TypeScript kehilangan jaminan bahwa ia
    // tidak null di dalamnya.
    const tekanTombol = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === "Escape") {
        peristiwa.preventDefault();
        setTerbuka(false);
        return;
      }
      if (peristiwa.key !== "Tab") return;

      const isi = Array.from(laci.querySelectorAll<HTMLElement>(BISA_FOKUS));
      const pertama = isi.at(0);
      const terakhir = isi.at(-1);
      if (!pertama || !terakhir) return;

      const kini = document.activeElement;
      const diLuar = !laci.contains(kini);
      if (peristiwa.shiftKey) {
        if (kini === pertama || diLuar) {
          peristiwa.preventDefault();
          terakhir.focus();
        }
      } else if (kini === terakhir || diLuar) {
        peristiwa.preventDefault();
        pertama.focus();
      }
    };

    document.addEventListener("keydown", tekanTombol);
    return () => document.removeEventListener("keydown", tekanTombol);
  }, [terbuka]);

  // Menekan di luar panel menutupnya. Dipasang di dokumen, bukan sebagai
  // `onClick` pada tabir, supaya ketukan pada bilah atas sendiri — di luar
  // panel tapi di atas tabir — ikut terbaca sebagai "di luar".
  useEffect(() => {
    if (!terbuka) return;
    function tekanDiLuar(peristiwa: PointerEvent) {
      const sasaran = peristiwa.target;
      if (!(sasaran instanceof Node)) return;
      if (laciRef.current?.contains(sasaran)) return;
      // Tombol pembukanya punya pengalihnya sendiri; tanpa pengecualian ini
      // ketukan untuk menutup akan ditutup lalu dibuka lagi dalam satu ketuk.
      if (tombolRef.current?.contains(sasaran)) return;
      setTerbuka(false);
    }
    document.addEventListener("pointerdown", tekanDiLuar);
    return () => document.removeEventListener("pointerdown", tekanDiLuar);
  }, [terbuka]);

  // Fokus kembali ke tombol pembukanya saat laci tertutup — tapi tidak pada
  // render pertama, saat belum ada yang pernah dibuka.
  useEffect(() => {
    if (terbuka) {
      pernahTerbuka.current = true;
      return;
    }
    if (pernahTerbuka.current) tombolRef.current?.focus();
  }, [terbuka]);

  return (
    <>
      <header
        data-bilah-atas
        className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-sm"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link
            href="/"
            aria-label="Jernih — beranda"
            // Sub-judul mereknya dibuang di layar sempit: di 320px ia
            // membungkus jadi dua baris dan mendorong tinggi baris bilah.
            // Disembunyikan lewat kelas `.eyebrow` milik komponen merek,
            // bukan dengan merender dua salinan logonya.
            // `min-h-11`: di bawah `sm` sub-judulnya hilang dan sasaran
            // ketuknya menyusut jadi 30px — padahal ini satu-satunya jalan
            // pulang ke beranda dari halaman mana pun. Tidak mengubah
            // tampilan: bilahnya memang sudah lebih tinggi dari 44px.
            className="inline-flex min-h-11 min-w-0 items-center [&_.eyebrow]:hidden sm:[&_.eyebrow]:block"
          >
            <MerekJernih sub="Transparansi Layanan Air" />
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="ml-auto hidden items-center gap-1 lg:flex"
          >
            {menu.map((m) => {
              const ini = halamanIni(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={ini ? "page" : undefined}
                  className={cn(
                    // `min-h-11` bukan `py-1.5`: tablet 1024px juga layar
                    // sentuh, dan target 44px berlaku di sana juga.
                    "inline-flex min-h-11 items-center border-b-2 px-3 text-[14px] font-medium transition-colors",
                    ini
                      ? "border-brand-500 text-ink"
                      : "border-transparent text-muted hover:border-brand-400 hover:text-ink",
                  )}
                >
                  {m.teks}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
            <TombolTema className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink" />
            <Link
              href="/masuk"
              className="inline-flex min-h-11 items-center rounded-full bg-brand-900 px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-700 sm:px-5 dark:bg-brand-500 dark:text-brand-900 dark:hover:bg-brand-400"
            >
              Masuk
            </Link>
            <button
              ref={tombolRef}
              type="button"
              data-pembuka-laci
              aria-expanded={terbuka}
              aria-controls={ID_LACI}
              onClick={() => setTerbuka((v) => !v)}
              // Ditarik sedikit ke kanan supaya garisnya sejajar optis dengan
              // tepi isi — tapi hanya 4px: cincin fokusnya memakai offset 3px,
              // dan di 320px tarikan yang lebih besar membuatnya nyaris
              // menyentuh tepi layar.
              className="-mr-1 inline-flex size-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-soft hover:text-ink lg:hidden"
            >
              <span className="sr-only">
                {terbuka ? "Tutup menu navigasi" : "Buka menu navigasi"}
              </span>
              {terbuka ? <X size={20} strokeWidth={1.75} /> : <GarisTakar />}
            </button>
          </div>
        </div>

        {/*
          Laci. Selalu ada di DOM, disembunyikan dengan `visibility` — bukan
          `inert`, dan bukan render bersyarat. Tiga sebab:
          • `visibility: hidden` sudah mengeluarkan isinya dari urutan Tab dan
            dari pohon aksesibilitas, persis seperti `inert`;
          • berbeda dengan `inert`, ia bisa DIBATALKAN dari CSS — itulah yang
            dipakai `bilah-atas.css` untuk mengembalikan tautannya saat
            JavaScript mati;
          • karena elemennya tetap ada, buka DAN tutup sama-sama bisa
            dilantar.

          Durasi `visibility` sengaja 0s dan yang diatur adalah TUNDAANNYA.
          Kalau ia ikut dilantar 200ms, nilai terhitungnya masih `hidden` pada
          langkah pertama transisi — dan `.focus()` yang dipanggil tepat
          setelah laci dibuka tidak mengenai apa pun. Diukur di browser:
          fokus tertinggal di tombol pembukanya. Dengan 0s + tundaan hanya
          pada arah menutup, laci langsung bisa menerima fokus saat dibuka dan
          tetap terlihat selama pudarnya saat ditutup.
        */}
        <div
          id={ID_LACI}
          ref={laciRef}
          className={cn(
            "absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain",
            "border-b border-line bg-surface shadow-lg lg:hidden",
            "transition-[opacity,transform,visibility] [transition-duration:200ms,200ms,0s] ease-out motion-reduce:transition-none",
            terbuka
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0 [transition-delay:0s,0s,200ms]",
          )}
        >
          <nav
            aria-label="Navigasi utama"
            className="mx-auto max-w-6xl px-5 pt-4 pb-5"
          >
            <p className="eyebrow pb-2 text-muted">Transparansi</p>
            <ul className="divide-y divide-line border-y border-line">
              {menu.map((m) => {
                const ini = halamanIni(m.href);
                return (
                  <li key={m.href}>
                    <Link
                      href={m.href}
                      aria-current={ini ? "page" : undefined}
                      onClick={tutup}
                      className={cn(
                        "flex min-h-12 items-center gap-3 text-[15px] font-medium transition-colors",
                        ini ? "text-ink" : "text-muted hover:text-ink",
                      )}
                    >
                      {/* Penanda halaman aktif: satu garis takar tegak,
                          bukan titik bulat. */}
                      <span
                        aria-hidden
                        className={cn(
                          "h-5 w-0.5 shrink-0",
                          ini ? "bg-brand-500" : "bg-transparent",
                        )}
                      />
                      {m.teks}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="eyebrow pt-5 pb-2 text-muted">Pelanggan</p>
            <ul className="divide-y divide-line border-y border-line">
              <li>
                <Link
                  href="/daftar"
                  onClick={tutup}
                  className="flex min-h-12 items-center gap-3 text-[15px] font-medium text-muted transition-colors hover:text-ink"
                >
                  <span aria-hidden className="h-5 w-0.5 shrink-0" />
                  Daftar akun
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/*
        Tabir. Saudara dari <header>, bukan anaknya — lihat catatan di atas
        soal `backdrop-filter`. Tanpa penangan klik sendiri: yang menutup
        adalah pendengar `pointerdown` di dokumen; tugas tabir hanya menahan
        ketukan supaya tidak tembus ke tautan di belakangnya.
      */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-brand-900/35 lg:hidden",
          "transition-[opacity,visibility] [transition-duration:200ms,0s] ease-out motion-reduce:transition-none",
          terbuka
            ? "visible opacity-100"
            : "invisible opacity-0 [transition-delay:0s,200ms]",
        )}
      />
    </>
  );
}
