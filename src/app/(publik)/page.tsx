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
import { VideoHero } from "./_bagian/video-hero";
import { PitaStatistik } from "./_bagian/pita-statistik";
import { MeterPeraga } from "./_bagian/meter-peraga";
import { VideoPenjelasan } from "./_bagian/video-penjelasan";
import { Faq } from "./_bagian/faq";
import { Muncul } from "./_bagian/muncul";
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
    teks: "Masukkan nomor tiket, lalu lihat penanganannya sudah sampai mana.",
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
    teks: "Saldo dan debit berubah di layar seketika, tanpa menunggu akhir bulan.",
  },
];

export default function Landing() {
  return (
    <>
      {/* ── Hero: klip pembuka sebagai LATAR ─────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <VideoHero />

        <div className="mx-auto max-w-6xl px-5 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
          {/*
            Urutan masuk hero. Jenjangnya ~60ms dan arahnya satu — naik 12px
            sambil memudar masuk — supaya gerakannya MENGARAHKAN urutan baca,
            bukan merayakan pemuatan halaman. Sekali jalan, tanpa ulangan.
          */}
          <div className="max-w-2xl">
            <p className="masuk eyebrow text-brand-600">Air prabayar · PDAM</p>

            <h1 className="masuk mt-5 font-display text-[clamp(2.6rem,6.4vw,4.4rem)] leading-[0.98] font-semibold tracking-[-0.025em] [--tunda:60ms]">
              Airnya jernih.
              <span className="mt-1 block text-brand-600">
                Layanannya juga.
              </span>
            </h1>

            <p className="masuk mt-7 max-w-md text-[17px] leading-[1.65] text-muted [--tunda:120ms]">
              Warga PDAM biasanya baru tahu pemakaian airnya di akhir bulan,
              lewat angka yang tak bisa diperiksa. Di sini angkanya sama persis
              untuk warga dan petugas — dan bergerak sekarang juga.
            </p>

            <div className="masuk mt-9 flex flex-wrap items-center gap-x-3 gap-y-4 [--tunda:180ms]">
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

        </div>

        {/* Garis takar menutup hero — pembatas yang mengulang bahasa alat ukur. */}
        <div aria-hidden className="takar h-3 border-t border-line" />
      </section>

      {/* ── Angka jaringan, bukan kartu ──────────────────────────────── */}
      <Muncul>
        <PitaStatistik />
      </Muncul>

      {/* ── Empat pintu transparansi ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Muncul className="max-w-2xl">
          <p className="eyebrow text-muted">Tanpa akun</p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
            Yang biasanya tertutup, di sini dibuka
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Empat halaman berikut bisa dibuka siapa pun — termasuk yang bukan
            pelanggan, termasuk yang sedang menilai layanannya.
          </p>
        </Muncul>

        {/*
          Daftar bergaris, bukan kartu membulat. Kartu seragam adalah pola
          yang paling sering dipakai dan paling cepat terlupa; baris bergaris
          membuat keempatnya terbaca sebagai satu daftar catatan publik.

          Keempat baris masuk berjenjang, bukan serentak: daftar ini memang
          dibaca satu per satu dari atas, dan jenjang 70ms itulah yang
          memberitahu mata urutannya. Yang berjenjang BARISNYA, bukan
          wadahnya — dua transform bertumpuk terbaca ramai.
        */}
        <Muncul className="mt-12" pilih="li" langkah={70}>
          <ul className="border-t border-line">
            {TRANSPARANSI.map((t, i) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="sorot group relative isolate grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-7 sm:grid-cols-[3.5rem_16rem_1fr_auto] sm:gap-x-8"
                >
                  {/* Garis bawah melebar dari kiri — arah yang sama dengan
                      arah baca dan dengan panah di ujung kanan, jadi dua
                      gerakan kecil ini menunjuk ke tempat yang sama. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-[380ms] ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                  {/* Nomor urutnya isi, bukan hiasan — jadi ia harus terbaca.
                      brand-400 hanya 2,4:1 di atas latar terang. */}
                  <span className="tabular font-mono text-[13px] text-brand-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[1.35rem] font-semibold tracking-[-0.01em]">
                    {t.judul}
                  </span>
                  <span className="col-start-2 text-[14.5px] leading-relaxed text-muted sm:col-start-3">
                    {t.teks}
                  </span>
                  {/* Hanya panah yang bergerak — 4px ke arah tujuannya. Nomor
                      urut dan teks tetap diam: sorotnya tidak menyentuh tata
                      letak sama sekali. */}
                  <ArrowRight
                    size={18}
                    aria-hidden
                    className="col-start-3 row-start-1 self-center text-line-strong transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-brand-600 sm:col-start-4"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Muncul>
      </section>

      {/* ── Meter: benda nyata di balik angka ────────────────────────── */}
      {/* ── Video penjelasan ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Muncul>
          <p className="eyebrow text-brand-700">Video penjelasan</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
            Seluruhnya dalam sembilan puluh detik
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
            Cara meternya bekerja, apa yang terbuka tanpa akun, dan angka mana
            yang masih di bawah target.
          </p>
          <div className="mt-9">
            <VideoPenjelasan />
          </div>
          {/*
            Keterangan ini bukan basa-basi: ia menjanjikan bahwa tidak ada
            satu pun keterangan yang HANYA hidup di dalam video. Halaman
            yang menyembunyikan isinya di balik pemutar video adalah
            kebalikan dari transparansi.
          */}
          <p className="mt-4 text-[13px] text-muted">
            Bertakarir Bahasa Indonesia. Seluruh isinya juga tersedia sebagai
            teks di keempat halaman di atas.
          </p>
        </Muncul>
      </section>

      <section className="lapis-endap border-y border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 lg:grid-cols-[1fr_auto]">
          {/*
            Keterangan datang dari kiri, alatnya menyusul dari bawah sepersekian
            detik kemudian. Dua arah yang berbeda membuat keduanya terbaca
            sebagai PASANGAN — kalimat lalu bendanya — bukan dua blok yang
            kebetulan sebaris.
          */}
          <Muncul className="max-w-lg" arah="kiri">
            <p className="eyebrow text-brand-700 dark:text-brand-500">
              Di balik angkanya
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
              Meternya benar-benar berbunyi
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Saldo tinggal 5 liter, meter berbunyi tiap 10 detik. Tinggal 2
              liter, tiap 2 detik. Habis, aliran menutup sendiri. Angka di layar
              ponsel Anda sama persis dengan angka di layar meter.
            </p>

            <dl className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ["≤ 5 liter", "bunyi tiap 10 detik"],
                ["≤ 2 liter", "bunyi tiap 2 detik"],
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
          </Muncul>

          {/*
            Kolom air berdampingan dengan meter. Di hero ia mubazir — klip
            videonya menampilkan tabung yang sama. Di sini ia bermakna: seksi
            ini memang tentang benda fisik di balik angkanya, dan kolom ini
            satu-satunya yang angkanya BENAR-BENAR bergerak, bukan rekaman.
          */}
          {/*
            `items-start`, BUKAN `items-end`.

            Dengan `items-end` yang disejajarkan adalah tepi bawah kedua blok
            — padahal blok meter menyertakan teks keterangan di bawah
            alatnya. Hasilnya badan meter berakhir 120px di atas dasar kolom
            air sementara puncaknya 178px lebih tinggi: tidak ada satu sisi
            pun yang benar-benar lurus. Dengan tepi atas yang dikunci,
            kedua alat berangkat dari garis yang sama dan keterangannya
            menggantung di bawah — yang memang tempatnya.
          */}
          <Muncul
            className="flex flex-wrap items-start justify-center gap-x-10 gap-y-12"
            tunda={140}
          >
            <KolomAir />
            <MeterPeraga />
          </Muncul>
        </div>
      </section>

      {/* ── Cara kerja ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Muncul>
          <h2 className="max-w-xl font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
            Dari kode jadi air, empat langkah
          </h2>
        </Muncul>

        {/* Jenjangnya mengikuti urutan bacanya, karena di sini urutan itu
            memang syarat: tiap langkah baru mungkin setelah yang sebelumnya. */}
        <Muncul className="mt-12" pilih="li" langkah={90}>
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH.map((l, i) => (
              <li key={l.judul} className="border-t-2 border-brand-200 pt-5">
                {/* brand-500 adalah aksen untuk data hidup, bukan untuk teks
                    12px di atas latar terang: di sana ia hanya 2,6:1. Label
                    ini memakai brand-600 yang lulus di kedua tema. */}
                <span className="tabular font-mono text-[12px] font-semibold text-brand-600">
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
        </Muncul>
      </section>

      {/* ── Paket ────────────────────────────────────────────────────── */}
      <section className="lapis-permukaan border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Muncul className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-md font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
              Beli sebanyak yang dibutuhkan
            </h2>
            <p className="text-[15px] text-muted">
              Tarif {rupiah(TARIF_PER_LITER, 1)} per liter · minimal 500 liter
            </p>
          </Muncul>

          {/* Tabel harga, bukan empat kartu — harga memang dibandingkan.
              Barisnya hanya memudar masuk berurutan: paket memang dibaca
              dari yang terkecil, dan geseran di dalam wadah yang bisa
              digulir mendatar justru menambah lebar gulirnya. */}
          <Muncul
            className="mt-12 overflow-x-auto"
            pilih="tbody tr"
            arah="pudar"
            langkah={70}
          >
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-strong">
                  <th className="eyebrow pb-3 text-muted">Paket</th>
                  <th className="eyebrow pb-3 text-right text-muted">Liter</th>
                  <th className="eyebrow pb-3 text-right text-muted">Harga</th>
                  <th className="eyebrow pb-3 text-right text-muted">
                    Perkiraan pemakaian
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
          </Muncul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Muncul sebagai="section" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[18rem_1fr]">
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] leading-tight font-semibold tracking-[-0.02em]">
            Yang sering ditanyakan
          </h2>
          <Faq />
        </div>
      </Muncul>
    </>
  );
}
