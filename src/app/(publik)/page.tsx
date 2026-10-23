/**
 * J01 — Landing publik Jernih.
 *
 * Halaman pertama yang dilihat juri, dan satu-satunya yang namanya disebut
 * sebagai syarat screenshot di guidebook. Menyentuh tiga kriteria sekaligus:
 * Desain (20%), Orisinalitas (20%), Kesesuaian Tema (15%).
 */
import Link from "next/link";
import { ArrowRight, Droplets, Gauge, ScrollText, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MeterPeraga } from "./_bagian/meter-peraga";
import { PitaStatistik } from "./_bagian/pita-statistik";
import { Faq } from "./_bagian/faq";
import { angka, rupiah } from "@/lib/format";
import { TARIF_PER_LITER, PAKET } from "@/data/paket";

const TRANSPARANSI = [
  {
    href: "/status",
    ikon: Droplets,
    judul: "Status Layanan",
    teks: "Zona mana yang sedang terganggu, sejak kapan, dan perkiraan pulihnya.",
  },
  {
    href: "/lacak",
    ikon: ScrollText,
    judul: "Lacak Pengaduan",
    teks: "Masukkan nomor tiket, lihat sudah sampai mana — tanpa perlu masuk.",
  },
  {
    href: "/kinerja",
    ikon: ShieldCheck,
    judul: "Rapor Kinerja",
    teks: "Ketepatan penanganan dan waktu tanggap, dipublikasikan apa adanya.",
  },
  {
    href: "/statistik",
    ikon: Gauge,
    judul: "Statistik Terbuka",
    teks: "Distribusi air dan kehilangan air per zona, bisa diperiksa siapa pun.",
  },
];

const LANGKAH = [
  {
    n: "01",
    judul: "Hubungkan meter",
    teks: "Masukkan ID pelanggan atau pindai QR di stiker meter Anda.",
  },
  {
    n: "02",
    judul: "Beli token",
    teks: "Pilih paket liter atau nominal bebas. Kode token langsung terbit.",
  },
  {
    n: "03",
    judul: "Air mengalir",
    teks: "Ketik kode di keypad meter. Saldo bertambah, keran kembali hidup.",
  },
  {
    n: "04",
    judul: "Pantau tiap liter",
    teks: "Lihat pemakaian real-time, bukan menunggu tagihan akhir bulan.",
  },
];

export default function Landing() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-brand-700">
              Air prabayar · PDAM
            </span>

            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
              Air jernih.
              <br />
              <span className="text-brand-600">Layanannya juga.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
              Selama ini warga baru tahu pemakaian airnya di akhir bulan, lewat
              angka yang tidak bisa diperiksa. Jernih menampilkan angka yang sama
              persis ke warga dan ke petugas — saat itu juga.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/masuk"
                className="inline-flex h-13 items-center gap-2 rounded-input bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
              >
                Masuk ke akun saya
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/status"
                className="inline-flex h-13 items-center rounded-input border border-line-strong px-6 font-semibold hover:bg-soft"
              >
                Lihat status layanan
              </Link>
            </div>

            <p className="mt-4 text-[13px] text-muted">
              Status layanan, pelacakan pengaduan, dan rapor kinerja bisa dibuka
              tanpa akun.
            </p>
          </div>

          <MeterPeraga />
        </div>
      </section>

      {/* ── Pita statistik langsung ───────────────────────────────── */}
      <PitaStatistik />

      {/* ── Empat pintu transparansi ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Yang biasanya tertutup, di sini terbuka
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Empat halaman berikut tidak memerlukan akun. Siapa pun boleh memeriksa,
          termasuk yang bukan pelanggan.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRANSPARANSI.map((t) => (
            <Link key={t.href} href={t.href} className="group">
              <Card className="h-full p-5 transition-colors group-hover:border-brand-300">
                <t.ikon size={22} className="text-brand-500" aria-hidden />
                <h3 className="mt-4 font-display font-bold">{t.judul}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  {t.teks}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600">
                  Buka
                  <ArrowRight size={14} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Cara kerja ────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Empat langkah, selesai
          </h2>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH.map((l) => (
              <li key={l.n}>
                <span className="tabular font-mono text-[28px] font-bold text-brand-300">
                  {l.n}
                </span>
                <h3 className="mt-2 font-display font-bold">{l.judul}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  {l.teks}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Paket ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Beli sesuai kebutuhan
            </h2>
            <p className="mt-3 text-muted">
              Tarif {rupiah(TARIF_PER_LITER, 1)} per liter. Bisa juga isi nominal
              bebas, minimal 500 liter.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAKET.map((p) => (
            <Card key={p.literL} className="p-5">
              {p.tag ? (
                <span className="eyebrow text-brand-600">{p.tag}</span>
              ) : (
                <span className="eyebrow text-muted">Paket</span>
              )}
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="tabular font-mono text-[30px] leading-none font-bold">
                  {angka(p.literL)}
                </span>
                <span className="text-sm font-medium text-muted">liter</span>
              </p>
              <p className="mt-2 font-display text-lg font-bold text-brand-600">
                {rupiah(p.literL * TARIF_PER_LITER)}
              </p>
              <p className="mt-1 text-[12.5px] text-muted">{p.kira}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Pertanyaan yang sering muncul
          </h2>
          <Faq />
        </div>
      </section>
    </>
  );
}
