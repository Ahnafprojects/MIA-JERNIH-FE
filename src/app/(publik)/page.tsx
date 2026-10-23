/**
 * J01 — Landing publik Jernih.
 *
 * Arah: "membaca air". Halaman ini harus terasa seperti melihat menembus
 * sesuatu yang bening ke arah angka — sesuai arti nama produknya.
 *
 * Hero-nya bukan teks besar, melainkan kolom air yang benar-benar menyusut:
 * satu-satunya hal yang dijual produk ini adalah warga bisa MELIHAT sisa
 * airnya. Perangkat struktural yang berulang adalah garis takar gelas ukur,
 * diambil dari dunia subjeknya sendiri.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KolomAir } from "./_bagian/kolom-air";
import { PitaStatistik } from "./_bagian/pita-statistik";
import { MeterPeraga } from "./_bagian/meter-peraga";
import { Faq } from "./_bagian/faq";
import { angka, rupiah } from "@/lib/format";
import { TARIF_PER_LITER, PAKET } from "@/data/paket";

const TRANSPARANSI = [
  {
    href: "/status",
    judul: "Status layanan",
    teks: "Zona mana yang sedang terganggu, sejak kapan, dan perkiraan pulihnya.",
  },
  {
    href: "/lacak",
    judul: "Lacak pengaduan",
    teks: "Nomor tiket, lalu lihat sudah sampai mana. Tidak perlu masuk.",
  },
  {
    href: "/kinerja",
    judul: "Rapor kinerja",
    teks: "Ketepatan penanganan dan waktu tanggap, termasuk yang terlambat.",
  },
  {
    href: "/statistik",
    judul: "Statistik terbuka",
    teks: "Air yang disalurkan, tercatat, dan hilang di tiap zona.",
  },
];

/* Urutan di sini memang sebuah proses: tiap langkah syarat langkah sesudahnya. */
const LANGKAH = [
  {
    judul: "Hubungkan meter",
    teks: "Ketik ID pelanggan atau pindai QR di stiker meter.",
  },
  {
    judul: "Beli liter",
    teks: "Pilih paket atau isi nominal bebas. Kode token terbit saat itu juga.",
  },
  {
    judul: "Ketik di keypad",
    teks: "Tekan bintang, masukkan kode, tekan A. Keran hidup kembali.",
  },
  {
    judul: "Lihat tiap liter",
    teks: "Saldo dan debit berubah di layar, bukan menunggu akhir bulan.",
  },
];

export default function Landing() {
  return (
    <>
      {/* ── Hero: kolom air sebagai thesis ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-14 pb-20 lg:grid-cols-[1fr_auto] lg:gap-20 lg:pt-20">
          <div className="max-w-xl">
            <p className="eyebrow text-brand-600">Air prabayar · PDAM</p>

            <h1 className="mt-5 font-display text-[clamp(2.6rem,6.4vw,4.4rem)] leading-[0.98] font-semibold tracking-[-0.025em]">
              Airnya jernih.
              <span className="mt-1 block text-brand-600">
                Layanannya juga.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-[17px] leading-[1.65] text-muted">
              Warga PDAM biasanya baru tahu pemakaian airnya di akhir bulan,
              lewat angka yang tak bisa diperiksa. Di sini angkanya sama persis
              untuk warga dan petugas — dan bergerak sekarang juga.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-4">
              <Link
                href="/masuk"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand-900 px-7 font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-900 dark:hover:bg-brand-400"
              >
                Masuk ke akun saya
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/status"
                className="inline-flex h-12 items-center border-b-2 border-brand-300 px-1 font-semibold transition-colors hover:border-brand-600"
              >
                Lihat status layanan
              </Link>
            </div>
          </div>

          <KolomAir />
        </div>

        {/* Garis takar menutup hero — pembatas yang mengulang bahasa alat ukur. */}
        <div aria-hidden className="takar h-3 border-t border-line" />
      </section>

      {/* ── Angka jaringan, bukan kartu ──────────────────────────────── */}
      <PitaStatistik />

      {/* ── Empat pintu transparansi ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-muted">Tanpa akun</p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
            Yang biasanya tertutup, di sini dibuka
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Empat halaman berikut bisa dibuka siapa pun — termasuk yang bukan
            pelanggan, termasuk yang sedang menilai layanannya.
          </p>
        </div>

        {/*
          Daftar bergaris, bukan kartu membulat. Kartu seragam adalah pola
          yang paling sering dipakai dan paling cepat terlupa; baris bergaris
          membuat keempatnya terbaca sebagai satu daftar catatan publik.
        */}
        <ul className="mt-12 border-t border-line">
          {TRANSPARANSI.map((t, i) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-7 transition-colors hover:bg-surface sm:grid-cols-[3.5rem_16rem_1fr_auto] sm:gap-x-8"
              >
                <span className="tabular font-mono text-[13px] text-brand-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1.35rem] font-semibold tracking-[-0.01em]">
                  {t.judul}
                </span>
                <span className="col-start-2 text-[14.5px] leading-relaxed text-muted sm:col-start-3">
                  {t.teks}
                </span>
                <ArrowRight
                  size={18}
                  aria-hidden
                  className="col-start-3 row-start-1 self-center text-line-strong transition-all group-hover:translate-x-1 group-hover:text-brand-600 sm:col-start-4"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Meter: benda nyata di balik angka ────────────────────────── */}
      <section className="border-y border-line bg-silt dark:bg-silt">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 lg:grid-cols-[1fr_auto]">
          <div className="max-w-lg">
            <p className="eyebrow text-brand-700 dark:text-brand-500">
              Di balik angkanya
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
              Ada meter yang benar-benar berbunyi
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Saldo tinggal 5 liter, meter berbunyi tiap 10 detik. Tinggal 2
              liter, tiap 2 detik. Habis, aliran menutup sendiri. Angka di
              layar ponsel Anda adalah angka yang sama di layar meter.
            </p>

            <dl className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ["≤ 5 liter", "bip tiap 10 detik"],
                ["≤ 2 liter", "bip tiap 2 detik"],
                ["0 liter", "bunyi terus, aliran tertutup"],
                ["Token masuk", "keran hidup kembali"],
              ].map(([t, d]) => (
                <div key={t} className="border-t border-line-strong pt-3">
                  <dt className="tabular font-mono text-[13px] font-semibold">
                    {t}
                  </dt>
                  <dd className="mt-0.5 text-[13.5px] text-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </div>

          <MeterPeraga />
        </div>
      </section>

      {/* ── Cara kerja ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="max-w-xl font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          Dari kode jadi air, empat langkah
        </h2>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH.map((l, i) => (
            <li key={l.judul} className="border-t-2 border-brand-200 pt-5">
              <span className="tabular font-mono text-[12px] font-semibold text-brand-500">
                Langkah {i + 1}
              </span>
              <h3 className="mt-2 font-display text-[1.3rem] font-semibold tracking-[-0.01em]">
                {l.judul}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                {l.teks}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Paket ────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-md font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
              Beli seberapa yang dibutuhkan
            </h2>
            <p className="text-[15px] text-muted">
              Tarif {rupiah(TARIF_PER_LITER, 1)} per liter · minimal 500 liter
            </p>
          </div>

          {/* Tabel harga, bukan empat kartu — harga memang dibandingkan. */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-strong">
                  <th className="eyebrow pb-3 text-muted">Paket</th>
                  <th className="eyebrow pb-3 text-right text-muted">Liter</th>
                  <th className="eyebrow pb-3 text-right text-muted">Harga</th>
                  <th className="eyebrow pb-3 text-right text-muted">
                    Kira-kira cukup
                  </th>
                </tr>
              </thead>
              <tbody>
                {PAKET.map((p) => (
                  <tr key={p.literL} className="group border-b border-line">
                    <td className="py-5">
                      {p.tag ? (
                        <span className="eyebrow text-brand-600">{p.tag}</span>
                      ) : (
                        <span className="text-[14px] text-muted">Reguler</span>
                      )}
                    </td>
                    <td className="tabular py-5 text-right font-mono text-[1.6rem] font-bold">
                      {angka(p.literL)}
                    </td>
                    <td className="tabular py-5 text-right font-mono text-[1.1rem] font-semibold text-brand-600">
                      {rupiah(p.literL * TARIF_PER_LITER)}
                    </td>
                    <td className="py-5 text-right text-[14px] text-muted">
                      {p.kira}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[18rem_1fr]">
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] leading-tight font-semibold tracking-[-0.02em]">
            Yang sering ditanyakan
          </h2>
          <Faq />
        </div>
      </section>
    </>
  );
}
