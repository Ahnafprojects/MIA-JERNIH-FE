"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MerekJernih } from "@/components/layout/logo";
import { MerekGelap } from "@/components/layout/merek-gelap";
import { TombolTema } from "@/components/ui/tema";

export type ButirMenu = { href: string; teks: string };

/** Dipakai `aria-controls` pada tombol pembuka dan oleh `bilah-atas.css`. */
const ID_PANEL = "laci-navigasi";

/** Isi panel yang bisa menerima fokus. Panel hanya berisi tautan dan tombol. */
const BISA_FOKUS = "a[href], button:not([disabled])";

/**
 * Tombol bulat di dalam kapsul.
 *
 * Disalin bentuknya dari bilah portal supaya kedua bilah terbaca sebagai
 * satu produk: lingkaran bergaris tipis dengan kilau tepi, bukan petak
 * membulat. Di dalam wadah berkapsul, bentuk bersudut terbaca seperti dua
 * sistem bentuk yang dipaksa duduk bersama.
 */
const KELAS_TOMBOL_BILAH =
  "angkat grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted shadow-[var(--kilau-tepi),var(--kedalaman-1)] hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none";

/**
 * Bilah atas halaman publik.
 *
 * ── Kenapa kapsul mengambang ──────────────────────────────────────────
 *
 * Bentuknya mengikuti bilah portal warga, dan itu disengaja. Sebelumnya
 * keduanya berbeda: portal memakai kapsul melayang, halaman publik memakai
 * pita yang menempel ke tepi dengan garis bawah. Orang yang sama melewati
 * keduanya dalam satu alur — landing, lalu masuk — dan dua bilah yang
 * berlainan bentuk membuat perpindahan itu terbaca seperti berpindah situs,
 * bukan berpindah halaman.
 *
 * Pembungkusnya yang `sticky`, bukan kapsulnya. Kalau kapsulnya sendiri
 * yang diberi `sticky`, jarak atasnya ikut tergulir dan kapsul itu akhirnya
 * menempel persis di tepi layar — justru kehilangan sifat mengambang yang
 * diinginkan tepat ketika halaman digulir.
 *
 * Lapisan kabut di belakangnya menutup celah antara tepi layar dan kapsul.
 * Tanpa itu, isi halaman terlihat tajam menyelinap di sela kiri-kanan dan di
 * bawah kapsul saat digulir, dan kapsulnya berhenti terbaca melayang.
 *
 * ── Satu komponen klien untuk seluruh bilah ───────────────────────────
 *
 * Penanda halaman aktif (`aria-current`) butuh `usePathname`, yang hanya ada
 * di komponen klien. Panel layar penuhnya juga saudara dari `<header>`,
 * bukan anaknya: `backdrop-filter` menjadikan elemennya blok penampung bagi
 * keturunan `fixed`, jadi panel yang ditaruh di dalam header berisiko hanya
 * setinggi header alih-alih setinggi layar.
 *
 * Titik hentinya `lg`, bukan `md`: baris penuh — merek, empat tautan, tema,
 * Masuk — butuh ±860px, jadi di 768px dan 834px ia masih meluber.
 */
export function BilahAtas({ menu }: { menu: readonly ButirMenu[] }) {
  const jalur = usePathname();
  const [terbuka, setTerbuka] = useState(false);
  const tombolRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);
  const pernahTerbuka = useRef(false);

  const tutup = useCallback(() => setTerbuka(false), []);

  /** Sub-rute ikut terhitung, mis. `/lacak/ABC` tetap menyalakan "Lacak
      Pengaduan" — orang yang sedang melihat satu tiket masih berada di
      bagian pengaduan, dan menu yang padam di sana berhenti menjawab
      "saya sedang di mana". */
  const halamanIni = (href: string) =>
    jalur === href || jalur.startsWith(`${href}/`);

  // Pindah halaman lewat tombol maju/mundur peramban juga harus menutupnya.
  // Disetel SAAT RENDER, bukan di dalam efek: React membuang hasil render ini
  // dan mengulangnya dengan nilai baru sebelum apa pun sempat tergambar, jadi
  // tidak ada render berantai dan tidak ada satu bingkai pun berisi panel
  // terbuka di halaman yang sudah berganti.
  const [jalurTerpakai, setJalurTerpakai] = useState(jalur);
  if (jalur !== jalurTerpakai) {
    setJalurTerpakai(jalur);
    setTerbuka(false);
  }

  // Melebarkan jendela sampai navigasi penuh muncul: panelnya tidak relevan
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

  // Esc menutup; Tab berputar di dalam panel selama ia terbuka.
  useEffect(() => {
    if (!terbuka) return;
    const panel = panelRef.current;
    if (!panel) return;

    /*
     * Fokus mendarat di tombol TUTUP, bukan di tautan pertama.
     *
     * Tautan pertama adalah logo, dan cincin fokus yang menyala di sana
     * terbaca seperti "logo sedang terpilih" — padahal ia cuma jalan pulang.
     * Tombol tutup adalah satu-satunya kendali yang pasti dicari orang yang
     * tidak sengaja membuka panel ini, jadi ia yang pantas menerima fokus
     * lebih dulu.
     */
    tutupRef.current?.focus();

    // Ditulis sebagai const, bukan deklarasi fungsi: deklarasi ikut terangkat
    // ke atas penyempitan `panel`, jadi TypeScript kehilangan jaminan bahwa
    // ia tidak null di dalamnya.
    const tekanTombol = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === "Escape") {
        peristiwa.preventDefault();
        setTerbuka(false);
        return;
      }
      if (peristiwa.key !== "Tab") return;

      const isi = Array.from(panel.querySelectorAll<HTMLElement>(BISA_FOKUS));
      const pertama = isi.at(0);
      const terakhir = isi.at(-1);
      if (!pertama || !terakhir) return;

      const kini = document.activeElement;
      const diLuar = !panel.contains(kini);
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

  // Fokus kembali ke tombol pembukanya saat panel tertutup — tapi tidak pada
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
      <header data-bilah-atas className="sticky top-0 z-40">
        <div
          aria-hidden
          data-kabut-bilah
          className="pointer-events-none absolute inset-0 bg-canvas/75 backdrop-blur-md"
        />

        <div className="relative px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex h-14 items-center justify-between gap-3 rounded-full border border-line bg-surface px-3 shadow-[var(--kilau-tepi),var(--kedalaman-3)] sm:px-4">
            <div className="flex min-w-0 items-center gap-5">
              <Link
                href="/"
                aria-label="Jernih — beranda"
                // Sub-judul mereknya dibuang di layar sempit: di 320px ia
                // membungkus jadi dua baris dan mendorong tinggi kapsul
                // melewati `h-14`, sehingga bentuk kapsulnya rusak.
                className="inline-flex min-w-0 items-center [&_.eyebrow]:hidden sm:[&_.eyebrow]:block"
              >
                <MerekJernih sub="Transparansi layanan air" />
              </Link>

              <nav aria-label="Navigasi utama" className="hidden lg:block">
                <ul className="flex items-center gap-0.5">
                  {menu.map((m) => {
                    const ini = halamanIni(m.href);
                    return (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          aria-current={ini ? "page" : undefined}
                          className={cn(
                            // `whitespace-nowrap`: "Lacak Pengaduan" dan
                            // "Status Layanan" punya spasi, dan di dalam
                            // kapsul berlebar terbatas keduanya pecah dua
                            // baris — dua baris mendorong tinggi kapsul
                            // melewati tinggi tetapnya.
                            "relative flex items-center rounded-full px-3 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                            ini
                              ? "bg-brand-500/12 font-semibold text-brand-700 dark:text-accent"
                              : "text-muted hover:bg-soft hover:text-ink",
                          )}
                        >
                          {m.teks}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/*
                Tema tinggal di bilah, tidak dipindah ke menu profil seperti
                di portal — halaman publik tidak punya menu profil untuk
                menampungnya, dan pengunjung yang belum masuk tetap berhak
                menyetelnya.
              */}
              <TombolTema className={KELAS_TOMBOL_BILAH} />

              <Link
                href="/masuk"
                className="angkat inline-flex h-10 shrink-0 items-center rounded-full bg-brand-900 px-4 text-[13.5px] font-semibold whitespace-nowrap text-white shadow-[var(--kedalaman-1)] transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none sm:px-5 dark:bg-brand-500 dark:text-brand-900 dark:hover:bg-brand-400"
              >
                Masuk
              </Link>

              <button
                ref={tombolRef}
                type="button"
                data-pembuka-laci
                aria-expanded={terbuka}
                aria-controls={ID_PANEL}
                onClick={() => setTerbuka((v) => !v)}
                className={cn(KELAS_TOMBOL_BILAH, "text-ink lg:hidden")}
              >
                <span className="sr-only">Buka menu navigasi</span>
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/*
        Panel layar penuh — bukan laci dari samping, bukan bilah bawah.

        Laci menyisakan sebagian halaman lama di layar, jadi mata harus
        memilah mana yang menu dan mana yang sisa halaman, tepat pada saat
        orang sedang mencari arah. Panel penuh tidak punya masalah itu:
        begitu dibuka, satu-satunya hal di layar adalah daftar tujuan.

        Nomor urut mengubah daftar menjadi sesuatu yang bisa dihitung —
        orang tahu ada berapa tujuan dan tahu posisinya di antaranya, bukan
        sekadar melihat tumpukan tautan yang panjangnya tidak jelas.
        Nomornya kecil dan redup: ia penanda, bukan isi.

        ── Kenapa SELALU ada di DOM ──────────────────────────────────────

        Disembunyikan dengan `visibility`, bukan render bersyarat seperti di
        portal. Portal berada di balik login dan boleh mengandalkan
        JavaScript; halaman publik ini tidak. Tanpa JavaScript, panel yang
        dirender bersyarat tidak pernah ada sama sekali, dan SELURUH
        navigasi situs lenyap begitu skripnya gagal dimuat — pada situs yang
        menjanjikan transparansi, itu kegagalan yang paling tidak pantas.
        Karena elemennya tetap ada, `bilah-atas.css` bisa mengalirkannya
        kembali sebagai daftar biasa saat `data-js` tidak terpasang.

        Durasi `visibility` sengaja 0s dan yang diatur adalah TUNDAANNYA.
        Kalau ia ikut dilantar, nilai terhitungnya masih `hidden` pada
        langkah pertama transisi — dan `.focus()` yang dipanggil tepat
        setelah panel dibuka tidak mengenai apa pun.
      */}
      <div
        id={ID_PANEL}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className={cn(
          "fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain lg:hidden",
          "bg-console text-on-console",
          "transition-[opacity,visibility] [transition-duration:200ms,0s] ease-out motion-reduce:transition-none",
          terbuka
            ? "visible opacity-100"
            : "invisible opacity-0 [transition-delay:0s,200ms]",
        )}
      >
        {/* Kepala panel menyalin susunan kapsul — tanda di kiri, satu tombol
            bulat di kanan — supaya tombol tutupnya jatuh kira-kira di tempat
            hamburger tadi ditekan. */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
          <Link
            href="/"
            onClick={tutup}
            className="flex items-center text-on-console"
          >
            <MerekGelap sub="Transparansi layanan air" />
          </Link>

          <button
            ref={tutupRef}
            type="button"
            onClick={tutup}
            aria-label="Tutup menu"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-on-console/20 bg-white/5 text-on-console transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="flex-1 px-5 pt-2 pb-8"
          data-isi-panel
        >
          <p className="eyebrow pb-1 text-on-console-muted">Transparansi</p>
          <ol className="berjenjang motion-aware">
            {menu.map((m, i) => {
              const ini = halamanIni(m.href);
              return (
                <li key={m.href} className="border-b border-on-console/15">
                  <Link
                    href={m.href}
                    onClick={tutup}
                    aria-current={ini ? "page" : undefined}
                    className="group flex items-baseline gap-4 py-4 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "w-6 shrink-0 font-mono text-[11px] tabular-nums transition-colors",
                        ini ? "text-accent" : "text-on-console-muted",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-[29px] leading-tight font-semibold tracking-[-0.02em] transition-colors group-hover:text-on-console group-focus-visible:text-on-console sm:text-4xl",
                        ini ? "text-on-console" : "text-on-console-muted",
                      )}
                    >
                      {m.teks}
                    </span>
                    {/* Penanda halaman aktif berupa titik, bukan hanya warna:
                        pada daftar sebesar ini perbedaan dua nada mudah luput,
                        dan warna sendirian tidak pernah cukup sebagai
                        satu-satunya pembeda. */}
                    {ini ? (
                      <span
                        aria-hidden
                        className="ml-auto size-2 shrink-0 self-center rounded-full bg-accent"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>

          {/*
            Masuk dan Daftar dipisahkan dari daftar bernomor, bukan
            dilanjutkan sebagai 05 dan 06. Keempat nomor itu menghitung
            TUJUAN BACA — halaman yang bisa dibuka siapa pun tanpa akun.
            Dua tautan ini mengubah keadaan akun, bukan membawa ke bacaan
            lain; memasukkannya ke hitungan yang sama membuat "ada empat
            halaman terbuka" berhenti benar.
          */}
          <p className="eyebrow pt-7 pb-2 text-on-console-muted">Pelanggan</p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/masuk"
              onClick={tutup}
              className="flex h-12 items-center justify-center rounded-full bg-accent px-5 text-[15px] font-semibold text-console transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-console focus-visible:outline-none"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              onClick={tutup}
              className="flex h-12 items-center justify-center rounded-full border border-on-console/25 px-5 text-[15px] font-semibold text-on-console transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              Daftar akun
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
