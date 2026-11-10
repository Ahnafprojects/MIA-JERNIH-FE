"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  KeyRound,
  BarChart2,
  History,
  Gauge,
  LifeBuoy,
  Droplets,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { literAtauKosong } from "@/lib/format";
import { TombolTema } from "@/components/ui/tema";
import { useState, useRef, useEffect } from "react";

export const MENU_PORTAL = [
  { href: "/beranda", label: "Beranda", Ikon: Home },
  { href: "/beli", label: "Beli Token", Ikon: CreditCard },
  { href: "/token", label: "Isi Token", Ikon: KeyRound },
  { href: "/pemakaian", label: "Pemakaian", Ikon: BarChart2 },
  { href: "/riwayat", label: "Riwayat", Ikon: History },
  /*
   * Meter dan Bantuan ikut di bilah utama.
   *
   * Keduanya sebelumnya hanya bisa dicapai lewat tautan yang tersebar di
   * dalam halaman lain — dan keduanya justru dibuka pada saat yang paling
   * buruk untuk mencari-cari: ketika air berhenti mengalir. Menu yang hanya
   * muncul di tempat lain bukan menu; ia jalan pintas yang harus sudah
   * diketahui sebelumnya.
   */
  { href: "/meter", label: "Meter", Ikon: Gauge },
  { href: "/bantuan", label: "Bantuan", Ikon: LifeBuoy },
];

/**
 * Apakah sebuah rute sedang dibuka.
 *
 * `/beranda` dikecualikan dari `startsWith` karena ia akar portal: tanpa
 * pengecualian itu setiap halaman menyalakan Beranda sekaligus dirinya
 * sendiri, dan dua menu yang menyala bersamaan berhenti menjawab pertanyaan
 * "saya sedang di mana".
 */
function rutenyaAktif(path: string, href: string): boolean {
  return path === href || (href !== "/beranda" && path.startsWith(href));
}

/* ── Menu mendatar, layar lebar ─────────────────────────────────────── */

export function NavPortal() {
  const path = usePathname();

  return (
    <ul className="flex items-center gap-0.5">
      {MENU_PORTAL.map(({ href, label, Ikon }) => {
        const aktif = rutenyaAktif(path, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                /*
                 * `whitespace-nowrap` wajib: tujuh menu di dalam kapsul yang
                 * lebarnya terbatas membuat "Beli Token" dan "Isi Token"
                 * pecah dua baris, dan dua baris mendorong tinggi kapsul
                 * melewati tinggi tetapnya sehingga bentuk kapsulnya rusak.
                 *
                 * Bentuk petaknya ikut kapsul induknya — `rounded-full`,
                 * bukan persegi membulat. Petak bersudut di dalam wadah
                 * berkapsul terbaca seperti dua sistem bentuk yang dipaksa
                 * duduk bersama.
                 */
                "relative flex items-center gap-2 rounded-full px-3 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                aktif
                  ? "bg-brand-500/12 font-semibold text-brand-700 dark:text-accent"
                  : "text-muted hover:bg-soft hover:text-ink",
              )}
            >
              <Ikon size={16} aria-hidden />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Hamburger + menu layar penuh, layar kecil ──────────────────────── */

/**
 * Navigasi layar kecil: hamburger yang membuka SATU PANEL PENUH.
 *
 * ── Kenapa bukan laci, dan bukan bilah bawah ──────────────────────────
 *
 * Laci dari samping menyisakan sebagian halaman lama di layar, jadi mata
 * harus memilah mana yang menu dan mana yang sisa halaman — tepat pada saat
 * orang sedang mencari arah. Bilah bawah sudah dicoba dan ditolak: ia
 * memakan satu pita permanen di tepi bawah dan hanya memuat sebagian menu,
 * sehingga tiga halaman sisanya tetap tersembunyi di balik "Lainnya".
 *
 * Panel penuh tidak punya keduanya. Begitu dibuka, satu-satunya hal di layar
 * adalah daftar tujuan — tidak ada yang perlu dipilah — dan KETUJUH menu
 * terlihat sekaligus tanpa lapisan kedua.
 *
 * ── Kenapa bernomor ───────────────────────────────────────────────────
 *
 * Nomor urut mengubah daftar menjadi sesuatu yang bisa dihitung: orang tahu
 * ada tujuh tujuan dan tahu posisinya di antara tujuh itu, bukan sekadar
 * melihat tumpukan tautan yang panjangnya tidak jelas. Nomornya dibuat kecil
 * dan redup — ia penanda, bukan isi.
 */
export function MenuLayarPenuh() {
  const path = usePathname();
  const [buka, setBuka] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buka) return;

    /*
     * Fokus dipindahkan ke tombol tutup dan DIKURUNG di dalam panel.
     *
     * Tanpa kurungan, Tab berjalan terus ke menu dan tombol halaman yang
     * masih ada di belakang panel: pengguna papan ketik akan menelusuri
     * tautan yang tidak terlihat olehnya, dan pembaca layar membacakan
     * halaman yang secara visual sudah tertutup penuh.
     */
    const fokusSemula = document.activeElement as HTMLElement | null;
    tutupRef.current?.focus();

    const padaTombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBuka(false);
        return;
      }
      if (e.key !== "Tab") return;

      const el = panelRef.current;
      if (!el) return;
      const bisaFokus = Array.from(
        el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      if (bisaFokus.length === 0) return;

      const pertama = bisaFokus[0]!;
      const terakhir = bisaFokus[bisaFokus.length - 1]!;
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    };

    document.addEventListener("keydown", padaTombol);
    const semula = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", padaTombol);
      document.body.style.overflow = semula;
      fokusSemula?.focus();
    };
  }, [buka]);

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        aria-expanded={buka}
        aria-label="Buka menu navigasi"
        className="angkat grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none lg:hidden"
      >
        <Menu size={18} />
      </button>

      {buka ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="tirai-masuk motion-aware fixed inset-0 z-50 flex flex-col overflow-y-auto bg-console text-on-console lg:hidden"
        >
          {/* Kepala panel menyalin susunan bilah atas — tanda di kiri, satu
              tombol bulat di kanan — supaya tombol tutupnya jatuh persis di
              tempat hamburger tadi ditekan. */}
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <Link
              href="/beranda"
              onClick={() => setBuka(false)}
              className="flex items-center text-on-console"
            >
              <MerekRingkas />
            </Link>

            <button
              ref={tutupRef}
              type="button"
              onClick={() => setBuka(false)}
              aria-label="Tutup menu"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-on-console/20 bg-white/5 text-on-console transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <X size={18} />
            </button>
          </div>

          <nav aria-label="Navigasi utama" className="flex-1 px-5 pb-8">
            <ol className="berjenjang motion-aware">
              {MENU_PORTAL.map(({ href, label }, i) => {
                const aktif = rutenyaAktif(path, href);
                return (
                  <li key={href} className="border-b border-on-console/15">
                    <Link
                      href={href}
                      onClick={() => setBuka(false)}
                      aria-current={aktif ? "page" : undefined}
                      className="group flex items-baseline gap-4 py-4 focus-visible:outline-none"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "w-6 shrink-0 font-mono text-[11px] tabular-nums transition-colors",
                          aktif ? "text-accent" : "text-on-console-muted",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-display text-[29px] leading-tight font-semibold tracking-[-0.02em] transition-colors group-hover:text-on-console group-focus-visible:text-on-console sm:text-4xl",
                          aktif ? "text-on-console" : "text-on-console-muted",
                        )}
                      >
                        {label}
                      </span>
                      {/* Penanda halaman aktif berupa titik, bukan hanya
                          warna: pada daftar sebesar ini perbedaan dua nada
                          mudah luput, dan warna sendirian tidak pernah cukup
                          sebagai satu-satunya pembeda. */}
                      {aktif ? (
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
          </nav>
        </div>
      ) : null}
    </>
  );
}

/**
 * Tanda Jernih versi panel gelap.
 *
 * `MerekJernih` memakai warna tinta halaman terang; di atas panel gelap ia
 * nyaris tidak terbaca. Ditulis di sini supaya `components/layout/logo.tsx`
 * tidak perlu disentuh hanya demi satu varian warna.
 */
function MerekRingkas() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-accent/15 text-accent">
        <Droplets size={17} aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[18px] font-semibold tracking-[-0.02em]">
          Jernih
        </span>
        <span className="eyebrow block text-[9.5px] whitespace-nowrap text-on-console-muted">
          Portal warga
        </span>
      </span>
    </span>
  );
}

/* ── Pemilih meter (dipakai kartu saldo beranda) ────────────────────── */

/**
 * Pemilih meter — tinggal DI DALAM kartu saldo, bukan di bilah atas.
 *
 * Di bilah atas ia berdiri tanpa konteks: sebuah nomor seri dan sebuah angka
 * liter, melayang di antara menu dan tombol, tidak menjawab pertanyaan apa
 * pun yang sedang dipikirkan orang. Di kartu saldo, nomor serinya menjadi
 * keterangan bagi angka besar di sebelahnya — "saldo ini milik meter yang
 * mana" — dan itu memang satu-satunya pertanyaan yang ia jawab.
 *
 * Warga yang hanya punya satu meter tidak pernah melihat tombol: tidak ada
 * yang bisa dipilih, dan tombol yang membuka daftar berisi satu baris hanya
 * menambah langkah tanpa menambah pilihan.
 */
export function PemilihMeter() {
  const { meter, meterAktif, pilihMeter } = useAuth();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBuka(false);
      }
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  if (!meter || meter.length === 0) {
    return (
      <Link
        href="/hubungkan-meter"
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-500/40 bg-brand-500/5 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-500/10 dark:text-accent"
      >
        <Droplets size={14} />
        <span>Hubungkan meter</span>
      </Link>
    );
  }

  if (meter.length === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
        <Droplets
          size={12}
          aria-hidden
          className="text-brand-600 dark:text-accent"
        />
        {meterAktif?.nomorSeri ?? "—"}
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
        className="angkat inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider whitespace-nowrap text-ink uppercase shadow-[var(--kilau-tepi),var(--kedalaman-1)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <Droplets
          size={12}
          aria-hidden
          className="text-brand-600 dark:text-accent"
        />
        {meterAktif?.nomorSeri ?? "Pilih meter"}
        <ChevronDown size={13} className="text-muted" aria-hidden />
      </button>

      {buka ? (
        <div className="permukaan-rata absolute top-full left-0 z-50 mt-1.5 w-60 p-1 shadow-[var(--kedalaman-3)]">
          <p className="px-2 py-1 font-mono text-[10px] tracking-wider text-muted uppercase">
            Pilih meter Anda
          </p>
          <ul className="space-y-0.5">
            {meter.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    pilihMeter(m.id);
                    setBuka(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[8px] px-2 py-1.5 text-xs",
                    m.id === meterAktif?.id
                      ? "bg-brand-500/10 font-bold text-brand-700 dark:text-accent"
                      : "text-ink hover:bg-soft",
                  )}
                >
                  <span className="font-mono">{m.nomorSeri}</span>
                  <span className="font-mono text-muted">
                    {literAtauKosong(m.saldoLiter)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ── Notifikasi & profil: dua tombol TERPISAH ───────────────────────── */

/**
 * Tombol bulat mandiri di bilah atas.
 *
 * Notifikasi dan profil sebelumnya dijejalkan ke dalam SATU alur cekung
 * bersama. Hasilnya terbaca sebagai satu benda tak bernama yang kebetulan
 * berisi dua ikon — dan begitu bilahnya sendiri menjadi kapsul mengambang,
 * cekungan di dalamnya berubah menjadi lubang di tengah benda yang melayang.
 * Dua tombol bulat terpisah menjawabnya tanpa penjelasan: dua hal, dua
 * bentuk.
 */
const KELAS_TOMBOL_BILAH =
  "angkat grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted shadow-[var(--kilau-tepi),var(--kedalaman-1)] hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none";

export function TombolNotifikasi() {
  return (
    <Link
      href="/notifikasi"
      className={KELAS_TOMBOL_BILAH}
      aria-label="Lihat notifikasi"
    >
      <Bell size={17} />
    </Link>
  );
}

export function AvatarMenu() {
  const { pengguna, keluar } = useAuth();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBuka(false);
      }
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
        className={KELAS_TOMBOL_BILAH}
        aria-label="Menu profil"
      >
        <User size={17} />
      </button>

      {buka ? (
        <div className="permukaan-rata absolute top-full right-0 z-50 mt-2 w-56 p-1 shadow-[var(--kedalaman-3)]">
          <div className="border-b border-line px-2.5 py-2">
            <p className="truncate text-xs font-semibold text-ink">
              {pengguna?.nama}
            </p>
            <p className="truncate text-[11px] text-muted">{pengguna?.email}</p>
          </div>

          <div className="p-1">
            {/*
              Tombol tema tinggal DI SINI, bukan di bilah atas.

              Ia disetel sekali lalu nyaris tidak pernah disentuh lagi,
              sementara di bilah ia memakan petak sebesar notifikasi —
              sesuatu yang berubah sepanjang hari.

              Labelnya dibawa MASUK ke dalam tombol, bukan digambar di
              lapisan terpisah di bawahnya. Susunan dua lapis yang dipakai
              sebelumnya menaruh tombol transparan `absolute inset-0 z-10` di
              ATAS teksnya, jadi `hover:bg-soft` menyapukan latar legap
              selebar baris dan menghapus tulisan yang ada di bawahnya: yang
              tersisa hanya ikon di tepi kiri dengan kapsul kosong memanjang
              ke kanan.

              Kelasnya sekarang sama persis dengan baris "Pengaturan akun"
              dan "Keluar" di bawahnya, jadi ketiganya satu bentuk dan
              seluruh lebar baris tetap bisa ditekan.
            */}
            <TombolTema
              label="Tema terang / gelap"
              ukuranIkon={14}
              className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-xs text-ink hover:bg-soft"
            />

            <Link
              href="/akun"
              onClick={() => setBuka(false)}
              className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-xs text-ink hover:bg-soft"
            >
              <User size={14} className="shrink-0 text-muted" />
              <span>Pengaturan akun</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setBuka(false);
                keluar();
              }}
              className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-xs text-danger hover:bg-danger/10"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
