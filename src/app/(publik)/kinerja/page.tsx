"use client";

/**
 * J04 — Rapor kinerja penanganan pengaduan. TANPA LOGIN.
 *
 * PDAM memublikasikan nilai rapornya sendiri. Inilah bentuk paling konkret
 * dari "mendorong akuntabilitas publik" pada tema lomba.
 *
 * Susunannya sengaja BUKAN empat kartu sejajar lalu dua panel. Halaman ini
 * punya satu pertanyaan utama — "apakah pengaduan saya akan ditangani tepat
 * waktu?" — jadi satu angka yang dominan menjawabnya lebih dulu, lalu
 * sisanya dibaca sebagai daftar bergaris seperti catatan publik.
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, type Nada } from "@/components/ui/badge";
import { KeadaanGalat, KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { BarMini, GrafikGaris } from "@/components/domain/grafik";
import { AngkaUtama } from "@/components/domain/angka-utama";
import useApi from "@/lib/use-api";
import { cn } from "@/lib/cn";
import { angka, tanggal } from "@/lib/format";
import { nilaiKpi, type KinerjaPublik } from "@/types/publik";

const RENTANG = [
  { hari: 7, label: "7 hari" },
  { hari: 30, label: "30 hari" },
  { hari: 90, label: "90 hari" },
];

/** Ambang yang dijanjikan PDAM. Dipakai sama persis di angka besar, batang
 *  mini, dan garis ambang grafik — satu angka, satu arti. */
const TARGET = 90;

/** Sengaja lebih sempit dari `Nada`: "info" tidak berarti apa-apa untuk
 *  sebuah nilai yang diukur terhadap target. */
type NadaAngka = Extract<Nada, "netral" | "sukses" | "peringatan">;

function nadaKetepatan(p: number | null): NadaAngka {
  if (p === null) return "netral";
  return p >= TARGET ? "sukses" : "peringatan";
}

const ISTILAH: [string, React.ReactNode][] = [
  [
    "SLA",
    <>
      Batas waktu penanganan yang dijanjikan untuk tiap jenis pengaduan.
      Batasnya berbeda menurut tingkat kedaruratan: kebocoran pipa ditangani
      lebih cepat daripada keluhan tekanan lemah.
    </>,
  ],
  [
    "Tepat waktu",
    <>
      Jumlah pengaduan yang selesai sebelum batas waktunya, dibagi seluruh
      pengaduan yang masuk pada periode tersebut. Target yang dipakai PDAM
      adalah <b className="text-ink">{TARGET}%</b>.
    </>,
  ],
  [
    "Waktu tanggap",
    <>
      Dihitung sejak laporan masuk sampai petugas ditugaskan — bukan sampai
      pekerjaannya selesai. Dua angka yang berbeda, dan keduanya dilaporkan
      terpisah supaya tidak tertukar.
    </>,
  ],
  [
    "Yang terlambat tetap dihitung",
    <>
      Pengaduan yang melewati batas waktu tidak dikeluarkan dari laporan.
      Kalau angkanya turun, halaman ini memperlihatkannya turun.
    </>,
  ],
];

export default function HalamanKinerja() {
  const [hari, setHari] = useState(30);
  const { data, memuat, galat, muatUlang } = useApi<KinerjaPublik>(
    `/api/publik/kinerja?rentang=${hari}`,
  );

  // KPI dicari lewat `key`, BUKAN indeks. Urutan milik server dan bisa
  // bertambah; membaca lewat indeks akan diam-diam menggeser semua angka.
  const kpi = data?.kpi ?? [];
  const masuk = nilaiKpi(kpi, "tiketMasuk");
  const selesai = nilaiKpi(kpi, "tiketSelesai");
  const ketepatan = nilaiKpi(kpi, "ketepatanSlaPct");
  const tanggap = nilaiKpi(kpi, "rataTanggapMenit");

  const perKategori = data?.perKategori ?? [];
  const meleset = perKategori.filter((k) => k.ketepatanPct < TARGET).length;

  const ringkas: {
    label: string;
    nilai: string | null;
    satuan: string;
    kaki: string;
  }[] = [
    {
      label: "Pengaduan masuk",
      nilai: masuk === null ? null : angka(masuk),
      satuan: "laporan",
      kaki: `selama ${hari} hari terakhir`,
    },
    {
      label: "Selesai ditangani",
      nilai: selesai === null ? null : angka(selesai),
      satuan: "laporan",
      kaki:
        masuk !== null && selesai !== null && masuk > 0
          ? `${angka((selesai / masuk) * 100, 1)}% dari yang masuk`
          : "termasuk yang melewati batas waktu",
    },
    {
      label: "Rata-rata waktu tanggap",
      nilai: tanggap === null ? null : angka(tanggap),
      satuan: "menit",
      kaki: "dari laporan masuk sampai petugas ditugaskan",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-7">
        <p className="eyebrow text-brand-600">Akuntabilitas</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Rapor Kinerja
        </h1>
        <p className="mt-3 max-w-[58ch] text-muted">
          Seberapa cepat pengaduan warga ditangani, dihitung dari data
          penanganan yang sebenarnya — termasuk yang terlambat.
        </p>
      </header>

      {/* Satu baris penyaring untuk SELURUH halaman: semua angka di bawahnya
          berubah bersama, jadi tidak ada dua bagian yang diam-diam berbeda
          periode. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-5">
        {RENTANG.map((r) => (
          <button
            key={r.hari}
            type="button"
            onClick={() => setHari(r.hari)}
            aria-pressed={hari === r.hari}
            className={cn(
              "rounded-input border px-4 py-2 text-[13px] font-semibold transition-colors",
              hari === r.hari
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-line-strong hover:bg-soft",
            )}
          >
            {r.label}
          </button>
        ))}
        {data ? (
          <span className="tabular ml-auto font-mono text-[12.5px] text-muted">
            {tanggal(data.periode.mulai)} – {tanggal(data.periode.selesai)}
          </span>
        ) : null}
      </div>

      {galat ? (
        <Card className="mt-6">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          {/* ── Angka utama: satu pertanyaan, satu jawaban besar ─────── */}
          <section className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
              <div className="bg-surface p-6 sm:p-7">
                {memuat ? (
                  <div className="space-y-4">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-16 w-44" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                ) : (
                  <AngkaUtama
                    eyebrow="Tepat waktu sesuai batas SLA"
                    nilai={ketepatan === null ? null : angka(ketepatan, 1)}
                    satuan="%"
                    nada={nadaKetepatan(ketepatan)}
                    keterangan={
                      masuk === null
                        ? `Dihitung dari pengaduan yang masuk dalam ${hari} hari terakhir.`
                        : `Dihitung dari ${angka(masuk)} pengaduan yang masuk dalam ${hari} hari terakhir.`
                    }
                  >
                    <BarMini
                      nilai={ketepatan}
                      maks={100}
                      tanda={TARGET}
                      nada={ketepatan !== null && ketepatan >= TARGET ? "sukses" : "peringatan"}
                      className="h-2.5"
                    />
                    <div className="relative mt-2 h-4 text-[11px] text-muted">
                      <span className="tabular absolute top-0 left-0 font-mono">0%</span>
                      <span
                        className="absolute top-0 -translate-x-full pr-1.5 whitespace-nowrap"
                        style={{ left: `${TARGET}%` }}
                      >
                        target {TARGET}%
                      </span>
                    </div>
                    <p className="mt-5">
                      <Badge nada={nadaKetepatan(ketepatan)} titik>
                        {ketepatan === null
                          ? "Angka belum tersedia"
                          : ketepatan >= TARGET
                            ? "Memenuhi target"
                            : "Di bawah target"}
                      </Badge>
                    </p>
                  </AngkaUtama>
                )}
              </div>

              <div className="bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-[15px] font-bold tracking-tight">
                    Pergerakan ketepatan
                  </h2>
                  <p className="text-[12.5px] text-muted">
                    Sumbu mulai dari 80% agar naik-turunnya terbaca
                  </p>
                </div>
                <div className="mt-4">
                  {memuat ? (
                    <Skeleton className="h-60 w-full" />
                  ) : (
                    <GrafikGaris
                      labels={data?.tren.labels ?? []}
                      deret={data?.tren.series ?? []}
                      format={(n) => `${angka(n, 1)}%`}
                      formatSumbu={(n) => `${angka(n)}%`}
                      domain={[80, 100]}
                      ambang={TARGET}
                      labelAmbang={`Target ${TARGET}%`}
                      tinggi={228}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Angka pendukung: baris bergaris, bukan kartu ─────────── */}
          <dl className="mt-10 grid border-y border-line sm:grid-cols-3">
            {ringkas.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  "py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0",
                  i > 0 && "border-t border-line sm:border-t-0 sm:border-l",
                )}
              >
                <dt className="eyebrow text-muted">{r.label}</dt>
                <dd className="mt-2.5 flex items-baseline gap-1.5">
                  {memuat ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <>
                      <span
                        className={cn(
                          "tabular font-mono text-[1.75rem] leading-none font-bold",
                          r.nilai === null && "text-muted",
                        )}
                      >
                        {r.nilai ?? "—"}
                      </span>
                      {r.nilai === null ? null : (
                        <span className="text-[13px] font-medium text-muted">
                          {r.satuan}
                        </span>
                      )}
                    </>
                  )}
                </dd>
                <dd className="mt-1.5 text-[12.5px] text-muted">{r.kaki}</dd>
              </div>
            ))}
          </dl>

          {/* ── Per kategori: daftar bergaris dengan batang pembanding ─ */}
          <section className="mt-12">
            <div aria-hidden className="takar h-2.5 border-t border-line" />
            <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <h2 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
                  Per kategori pengaduan
                </h2>
                <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-muted">
                  Tiap batang dibandingkan terhadap target {TARGET}% — penanda
                  tipis pada batang adalah letak targetnya.
                </p>
              </div>
              {!memuat && meleset > 0 ? (
                <Badge nada="peringatan" titik>
                  {meleset} kategori di bawah target
                </Badge>
              ) : null}
            </div>

            {memuat ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : perKategori.length === 0 ? (
              <KeadaanKosong
                judul="Belum ada pengaduan"
                pesan="Tidak ada pengaduan yang tercatat pada rentang ini."
              />
            ) : (
              <ul className="mt-6 border-t border-line">
                {perKategori.map((k) => {
                  const tercapai = k.ketepatanPct >= TARGET;
                  return (
                    <li
                      key={k.kategori}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_minmax(6rem,13rem)_5.5rem]"
                    >
                      <div className="order-1 min-w-0">
                        <p className="font-medium">{k.kategori}</p>
                        <p className="tabular mt-0.5 font-mono text-[12.5px] text-muted">
                          {angka(k.selesai)} dari {angka(k.masuk)} laporan
                          selesai
                        </p>
                      </div>
                      <div className="order-3 col-span-2 sm:order-2 sm:col-span-1">
                        <BarMini
                          nilai={k.ketepatanPct}
                          maks={100}
                          tanda={TARGET}
                          nada={tercapai ? "sukses" : "peringatan"}
                          className="h-2"
                        />
                      </div>
                      <div className="order-2 justify-self-end text-right sm:order-3">
                        <p
                          className={cn(
                            "tabular font-mono text-[15px] font-semibold",
                            tercapai ? "text-success" : "text-warn",
                          )}
                        >
                          {angka(k.ketepatanPct, 1)}%
                        </p>
                        {tercapai ? null : (
                          <p className="mt-0.5 text-[11px] font-semibold text-warn">
                            di bawah target
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Angka tanpa penjelasan tidak memenuhi "informasi jelas dan
              relevan". Bagian ini bukan hiasan — ia yang membuat rapor di
              atas bisa dipahami orang yang bukan petugas PDAM. */}
          <section className="mt-12">
            <div aria-hidden className="takar h-2.5 border-t border-line" />
            <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
              Bagaimana angka ini dihitung
            </h2>
            <dl className="mt-6 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {ISTILAH.map(([judul, isi]) => (
                <div key={judul} className="border-b border-line py-5">
                  <dt className="font-display text-[15px] font-bold tracking-tight">
                    {judul}
                  </dt>
                  <dd className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">
                    {isi}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
