import React from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, KeyRound, Mail } from "lucide-react";
import { LogoJernih } from "@/components/layout/logo";
import { PanelAir } from "./panel-air";

interface AuthLayoutProps {
  children: React.ReactNode;
  judul: string;
  keterangan: string;
  langkah?: string;
}

/**
 * Tiga hal yang bisa dilakukan warga setelah masuk.
 *
 * Versi sebelumnya memakai daftar bernomor 01/02/03 yang isinya tentang
 * TRANSPARANSI sebagai gagasan — "angka yang sama persis", "riwayat yang
 * bisa diperiksa". Itu menjawab pertanyaan yang tidak sedang ditanyakan
 * siapa pun di halaman masuk. Orang yang berhenti di pintu masuk sedang
 * menimbang satu hal: begitu saya masuk, saya bisa apa?
 *
 * Jadi ketiganya diganti kemampuan yang konkret, dan masing-masing menyebut
 * benda yang sudah dikenal pembacanya — email, keypad meter, bunyi meter.
 * Ikonnya mengikuti benda itu, bukan tiga tetes air berjajar yang tidak
 * membedakan apa pun.
 */
const KEMAMPUAN = [
  {
    Ikon: Mail,
    teks: "Verifikasi dan kode keamanan hanya lewat email",
  },
  {
    Ikon: KeyRound,
    teks: "Token angka, sama dengan keypad meter",
  },
  {
    Ikon: BellRing,
    teks: "Pengingat sebelum meter berbunyi",
  },
];

export function AuthShell({
  children,
  judul,
  keterangan,
  langkah,
}: AuthLayoutProps) {
  return (
    /*
     * Kolom formulir DILEBARKAN: 560 → 640 → 680px, bukan 480 → 520px.
     *
     * Halaman daftar punya lima kolom isian berurutan. Pada lebar lama,
     * isinya dibatasi 420px sementara panel merek di sebelahnya memakai
     * sisa layar — di monitor 2000px itu berarti formulir terjepit di pita
     * sempit di tepi kanan dengan padang luas di sebelahnya. Yang terbaca
     * bukan "fokus", melainkan sesak: label, kolom, dan teks bantuannya
     * berdesakan sementara ruang kosongnya justru ada di tempat yang salah.
     *
     * Panel merek tetap `1fr` — ia yang mengalah, karena isinya cuma judul
     * dan tiga baris, sedangkan kolom kanan menampung pekerjaan sungguhan.
     */
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1fr_560px] xl:grid-cols-[1fr_640px] 2xl:grid-cols-[1fr_680px]">
      {/* ── Kolom 1: Panel Merek Berlatar Gelap ── */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-console p-6 text-on-console sm:p-10 lg:p-14">
        {/* Latar bergerak: kolom ukur yang terisi air melewati garis takar. */}
        <PanelAir />

        {/* Bilah atas panel merek */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoJernih size={28} className="text-brand-500" />
            <span className="font-display text-xl font-black tracking-tight text-on-console">
              Jernih
            </span>
          </Link>

          {/*
            Tombol kembali yang BERLABEL, dan ada di semua ukuran layar.
            Sebelumnya satu-satunya jalan pulang ke halaman depan adalah
            mengeklik logo — jalan yang hanya diketahui orang yang sudah
            terbiasa menebak bahwa logo selalu bisa diklik. Di ponsel, panel
            ini menyusut jadi bilah tipis dan seluruh isinya disembunyikan,
            jadi bilah inilah satu-satunya tempat yang tersisa untuk
            meletakkannya.

            Labelnya memendek jadi "Kembali" di bawah `sm` supaya tidak
            berebut lebar dengan logo, tetapi tidak pernah menyusut jadi ikon
            telanjang: panah tanpa kata adalah teka-teki, bukan tombol.
          */}
          <Link
            href="/"
            className="angkat inline-flex shrink-0 items-center gap-2 rounded-full border border-console-2 bg-console-2/50 py-1.5 pr-3.5 pl-2.5 text-[13px] font-semibold text-on-console shadow-[var(--kedalaman-1)] transition-colors hover:border-accent/40 hover:bg-console-2"
          >
            <ArrowLeft size={15} aria-hidden />
            <span className="sm:hidden">Kembali</span>
            <span className="hidden sm:inline">Kembali ke beranda</span>
          </Link>
        </div>

        {/*
          Blok merek. Hanya di layar lebar — di ponsel kolom ini menyusut jadi
          bilah tipis dan isinya akan mendorong formulirnya turun sampai
          kolom kata sandi keluar dari layar.
        */}
        <div className="relative z-10 mt-10 mb-16 hidden lg:block">
          <span className="eyebrow animate-[masuk-naik_0.5s_ease-out_both] text-accent">
            Dompet air digital
          </span>

          {/*
            Judulnya berbicara tentang apa yang dipegang warga, bukan tentang
            sifat datanya. "Airnya jernih. Angkanya juga." terbaca sebagai
            slogan poster: enak diucapkan, tidak bisa dibuktikan, dan tidak
            memberi tahu calon pengguna apa pun tentang apa yang menunggunya
            di balik tombol masuk.
          */}
          <h2 className="mt-3 max-w-[18ch] animate-[masuk-naik_0.5s_ease-out_0.06s_both] font-display text-4xl leading-[1.05] font-black tracking-[-0.03em] text-on-console xl:text-5xl">
            Kelola air rumah Anda,
            <br />
            <span className="text-accent">dari mana saja.</span>
          </h2>

          <p className="mt-5 max-w-[46ch] animate-[masuk-naik_0.5s_ease-out_0.12s_both] text-sm leading-relaxed text-on-console-muted">
            Pantau saldo dan debit secara waktu nyata, isi token angka, dan
            dapat peringatan sebelum air berhenti.
          </p>

          {/*
            Satu kolom, tanpa ilustrasi pendamping.

            Sebelumnya ada kartu berisi bola air bertuliskan "Saldo meter —
            contoh tampilan". Dibuang: di halaman masuk, angka saldo tidak
            merujuk siapa pun (pengunjungnya belum masuk), jadi sebanyak apa
            pun keterangan dipasang, yang terbaca tetap benda hias yang
            memakan ruang. Panelnya lebih baik bernapas.
          */}
          <ul className="mt-10 max-w-md">
            {KEMAMPUAN.map(({ Ikon, teks }, i) => (
              <li
                key={teks}
                className="flex animate-[masuk-naik_0.5s_ease-out_both] items-center gap-4 border-t border-console-2 py-4"
                style={{ animationDelay: `${0.18 + i * 0.08}s` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-console-2/70 text-accent shadow-[var(--kedalaman-1)]">
                  <Ikon size={16} aria-hidden />
                </span>
                <span className="text-sm leading-snug font-medium text-on-console">
                  {teks}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer panel */}
        <div className="relative z-10 hidden items-center justify-between gap-4 lg:flex">
          <span className="font-mono text-[11px] text-on-console-muted">
            &copy; 2026 Jernih &middot; Web In Action MIA 2026
          </span>

          {/*
            Keping berdenyut, bukan kotak bertulis "TRANSPARANSI AIR". Kotak
            persegi berhuruf kapital semua terbaca seperti stiker kategori:
            ia menamai halaman, bukan memberi tahu apa pun. Yang dipakai
            sekarang menyatakan sesuatu yang bisa diperiksa orang — portalnya
            terbuka tanpa akun — dan titik yang berdenyut mengulang bahasa
            penanda status yang sudah ada di konsol.

            Dipindah ke footer karena bilah atas sekarang ditempati tombol
            kembali, dan dua tautan bersebelahan di sana membuat yang satu
            menyamarkan yang lain.
          */}
          <Link
            href="/statistik"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-console-2 bg-console-2/40 py-1 pr-3 pl-2.5 font-mono text-[11px] tracking-wide text-on-console-muted transition-colors hover:border-accent/40 hover:text-on-console"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Data publik, tanpa akun
          </Link>
        </div>
      </aside>

      {/* ── Kolom 2: Form Panel ── */}
      <main className="flex flex-1 flex-col justify-center bg-canvas px-4 py-8 sm:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[520px]">
          {/*
            `langkah` dirender sebagai KENING, bukan keping berlatar.

            Halaman daftar sudah menampilkan `StepperAuth` — "1 Akun ·
            2 Verifikasi · 3 Meter" — tepat di bawah keterangan. Keping
            berlatar "Langkah 1 dari 3" di atas judul karena itu adalah
            penanda langkah KEDUA untuk perjalanan yang sama, ditumpuk tiga
            baris di atas yang pertama. Dua komponen yang mengatakan hal sama
            tidak membuat posisinya lebih jelas; ia membuat kepala halaman
            terasa penuh sebelum satu kolom isian pun terlihat.

            Sebagai kening, ia berhenti bersaing: terbaca sebagai milik
            judulnya, dan steppernya yang membawa gambaran langkahnya.
          */}
          {langkah ? (
            <span className="eyebrow block animate-[masuk-naik_0.5s_ease-out_both] text-brand-700 dark:text-accent">
              {langkah}
            </span>
          ) : null}

          <h1
            className={`animate-[masuk-naik_0.5s_ease-out_0.06s_both] font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-ink sm:text-[34px] ${
              langkah ? "mt-2" : ""
            }`}
          >
            {judul}
          </h1>
          <p className="mt-2.5 max-w-[46ch] animate-[masuk-naik_0.5s_ease-out_0.12s_both] text-[15px] leading-relaxed text-balance text-muted">
            {keterangan}
          </p>

          <div className="mt-9 animate-[masuk-naik_0.5s_ease-out_0.2s_both]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
