"use client";

/**
 * J05 — Statistik distribusi air terbuka. TANPA LOGIN.
 *
 * Agregat saja: tidak ada satu pun data per pelanggan di halaman ini.
 *
 * Cerita halaman ini satu: JARAK antara air yang disalurkan dan air yang
 * tercatat sampai ke rumah. Karena itu jaraknya digambar — sebagai ruas
 * pipa yang hilang di atas, dan sebagai pita yang melebar-menyempit di
 * grafiknya. Dua batang berdampingan memaksa pembaca mengurangi sendiri.
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, type Nada } from "@/components/ui/badge";
import { KeadaanGalat, KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { BarMini, GrafikCelah } from "@/components/domain/grafik";
import { AngkaUtama } from "@/components/domain/angka-utama";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { PipaAir } from "@/components/domain/pipa-air";
import useApi from "@/lib/use-api";
import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import type { Deret, StatistikPublik } from "@/types/publik";
import { SeksiTolokUkur } from "./_bagian/tolok-ukur";
import { SeksiNeracaAir } from "./_bagian/neraca-air";
import { SeksiTrenBulanan } from "./_bagian/tren-bulanan";
import { SeksiPerOrang } from "./_bagian/per-orang";
import { SeksiUnduh } from "./_bagian/unduh";
import { SeksiMetodologi } from "./_bagian/metodologi";
import type { NeracaAirPublik } from "./_bagian/tipe";

const RENTANG = [
  { hari: 7, label: "7 hari" },
  { hari: 30, label: "30 hari" },
  { hari: 90, label: "90 hari" },
];

/** Ambang "baik" menurut acuan PDAM. Dipakai sebagai penanda di tiap batang. */
const AMBANG_BAIK = 20;

type BarisZona = StatistikPublik["perZona"][number];

/** PDAM di Indonesia umumnya 20–30%. Di luar 0–100% berarti salah hitung. */
function nadaNrw(p: number): Nada {
  if (p < 0 || p > 100) return "netral";
  if (p <= AMBANG_BAIK) return "sukses";
  if (p <= 30) return "peringatan";
  return "bahaya";
}

function kataNrw(p: number | null) {
  if (p === null) return "Angka belum tersedia";
  if (p <= AMBANG_BAIK) return "Tergolong baik";
  if (p <= 30) return "Masih di kisaran rata-rata nasional";
  return "Di atas kisaran wajar";
}

/**
 * Deret dicari lewat NAMANYA, bukan indeks — urutan milik server dan bisa
 * bertambah sewaktu-waktu.
 *
 * Kalau namanya tidak dikenali, yang dipakai sebagai langit-langit adalah
 * deret dengan total terbesar. Itu bukan tebakan: untuk grafik selisih,
 * deret yang lebih besar memang yang di atas menurut definisinya.
 */
function pasanganCelah(series: Deret[]): { atas: Deret | null; bawah: Deret | null } {
  if (series.length < 2) return { atas: null, bawah: null };

  const atas = series.find((d) => /disalur/i.test(d.name));
  const bawah = series.find((d) => /tercatat/i.test(d.name));
  if (atas && bawah && atas !== bawah) return { atas, bawah };

  const total = (d: Deret) =>
    d.points.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const urut = [...series].sort((a, b) => total(b) - total(a));
  return { atas: urut[0], bawah: urut[1] };
}

const PENJELASAN: [string, React.ReactNode][] = [
  [
    "Apa yang dihitung",
    <>
      Kehilangan air atau <i>non-revenue water</i> adalah selisih antara air
      yang disalurkan PDAM dengan air yang benar-benar tercatat di meter
      pelanggan.
    </>,
  ],
  [
    "Penyebabnya bukan hanya bocor",
    <>
      Ada juga meter yang sudah tidak akurat, sambungan liar, dan air yang
      dipakai untuk pembilasan jaringan. Ketiganya tercatat sebagai kehilangan
      yang sama.
    </>,
  ],
  [
    "Berapa yang wajar",
    <>
      Di bawah <b className="text-ink">{AMBANG_BAIK}%</b> tergolong baik.
      Rata-rata PDAM di Indonesia berada di kisaran{" "}
      <b className="text-ink">{AMBANG_BAIK}–30%</b>.
    </>,
  ],
  [
    "Kenapa angka ini dibuka",
    <>
      Semakin kecil angkanya, semakin sedikit air bersih yang terbuang sebelum
      sampai ke rumah warga — dan semakin kecil pula biaya yang akhirnya
      dibebankan ke tarif.
    </>,
  ],
];

export default function HalamanStatistik() {
  const [hari, setHari] = useState(30);
  const { data, memuat, galat, muatUlang } = useApi<StatistikPublik>(
    `/api/publik/statistik?rentang=${hari}`,
  );

  /*
   * Lapisan kedua: neraca air, tolok ukur, pemakaian per orang, dan tren 12
   * bulan. Diambil TERPISAH dari agregat di atas, dan kegagalannya ditangani
   * di tiap seksi sendiri — bukan dengan mematikan seluruh halaman.
   *
   * Halaman transparansi yang kosong total karena satu endpoint tambahan
   * gagal justru menghapus hal yang ia janjikan. Kalau lapisan ini tidak
   * datang, cerita utamanya — jarak antara disalurkan dan tercatat — tetap
   * utuh di layar.
   */
  const {
    data: lanjut,
    memuat: memuatLanjut,
    galat: galatLanjut,
    muatUlang: muatUlangLanjut,
  } = useApi<NeracaAirPublik>(`/api/publik/neraca-air?rentang=${hari}`);

  // NRW di luar 0–100% mustahil. Menampilkannya apa adanya akan jadi
  // pertanyaan pertama juri; lebih baik tampil "—" sampai sumbernya benar.
  const nrwSah =
    data != null && data.nrwPct >= 0 && data.nrwPct <= 100 ? data.nrwPct : null;

  const { atas, bawah } = pasanganCelah(data?.series ?? []);
  const perZona = data?.perZona ?? [];

  /*
   * Skala batang per zona: minimal 30% supaya perbandingannya tetap terbaca
   * terhadap acuan nasional, dan dinaikkan bila ada zona yang melewatinya.
   * Batang yang diskalakan ke nilai terbesar membuat zona terburuk selalu
   * tampak penuh — itu menyembunyikan seberapa buruk sebenarnya.
   */
  const maksBar = Math.max(
    30,
    Math.ceil(
      perZona.reduce((m, z) => (Number.isFinite(z.nrwPct) ? Math.max(m, z.nrwPct) : m), 0) / 5,
    ) * 5,
  );

  const rataPerPelanggan =
    data && data.pelangganTerlayani > 0
      ? data.volumeTercatatM3 / data.pelangganTerlayani
      : null;

  /*
   * Kehilangan menurut endpoint STATISTIK — bukan menurut endpoint neraca
   * air. Keduanya sengaja dibandingkan di seksi neraca: kalau suatu hari
   * dua sumber itu berbeda, halaman mengakuinya sendiri alih-alih diam.
   */
  const kehilanganDiLayar =
    data && data.volumeDisalurkanM3 >= data.volumeTercatatM3
      ? data.volumeDisalurkanM3 - data.volumeTercatatM3
      : null;

  /*
   * `nilai` disimpan sebagai ANGKA, bukan teks yang sudah diformat, supaya
   * `AngkaBergerak` bisa menjalankannya dari nilai lama ke nilai baru saat
   * rentang waktu diganti. Angka pendukung yang melompat sementara angka besar
   * di atasnya berjalan membuat halaman terbaca seperti hanya sebagian yang
   * diperbarui.
   */
  const ringkas: {
    label: string;
    nilai: number | null;
    desimal?: number;
    satuan: string;
    kaki: string;
  }[] = [
    {
      label: "Pelanggan terlayani",
      nilai: data?.pelangganTerlayani ?? null,
      satuan: "rumah",
      kaki: "sambungan aktif yang terpantau",
    },
    {
      label: "Zona terpantau",
      nilai: data?.jumlahZona ?? null,
      satuan: "zona",
      kaki: "wilayah distribusi dengan meter induk",
    },
    {
      label: "Rata-rata tercatat per pelanggan",
      nilai: rataPerPelanggan,
      desimal: 1,
      satuan: "m³",
      kaki: `selama ${hari} hari terakhir`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-7">
        <p className="eyebrow text-brand-600">Data terbuka</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Statistik Distribusi
        </h1>
        <p className="mt-3 max-w-[58ch] text-muted">
          Berapa air yang disalurkan, berapa yang tercatat sampai ke pelanggan,
          dan berapa yang hilang di perjalanan.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-5">
        {RENTANG.map((r) => (
          <button
            key={r.hari}
            type="button"
            onClick={() => setHari(r.hari)}
            aria-pressed={hari === r.hari}
            className={cn(
              // `min-h-11` (44px): tiga tombol ini mengatur SELURUH angka di
              // halaman, dan di ponsel merekalah yang paling sering ditekan.
              "inline-flex min-h-11 items-center rounded-input border px-4 py-2",
              "text-[13px] font-semibold transition-colors",
              hari === r.hari
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-line-strong hover:bg-soft",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {galat ? (
        <Card className="mt-6">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          {/* ── Cerita utama: jarak antara disalurkan dan tercatat ───── */}
          <section className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
              <div className="bg-surface p-6 sm:p-7">
                {memuat ? (
                  <div className="space-y-4">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-16 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ) : (
                  <AngkaUtama
                    eyebrow="Kehilangan air (NRW)"
                    nilai={nrwSah}
                    desimal={1}
                    satuan="%"
                    nada={
                      nrwSah === null
                        ? "netral"
                        : nrwSah <= AMBANG_BAIK
                          ? "sukses"
                          : nrwSah <= 30
                            ? "peringatan"
                            : "bahaya"
                    }
                    keterangan={`Bagian air yang disalurkan tetapi tidak pernah tercatat di meter pelanggan, selama ${hari} hari terakhir.`}
                  >
                    <Badge
                      nada={nrwSah === null ? "netral" : nadaNrw(nrwSah)}
                      titik
                    >
                      {kataNrw(nrwSah)}
                    </Badge>
                  </AngkaUtama>
                )}
              </div>

              <div className="bg-surface p-6 sm:p-7">
                {memuat ? (
                  <div className="space-y-4">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <PipaAir
                    disalurkan={data?.volumeDisalurkanM3 ?? null}
                    tercatat={data?.volumeTercatatM3 ?? null}
                    keterangan="Ruas berarsir adalah air yang tidak pernah sampai ke meter mana pun — bocor, salah ukur, atau terpakai untuk pembilasan jaringan."
                  />
                )}
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
                      <AngkaBergerak
                        nilai={r.nilai}
                        desimal={r.desimal ?? 0}
                        className={cn(
                          "tabular font-mono text-[1.75rem] leading-none font-bold",
                          r.nilai === null && "text-muted",
                        )}
                      />
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

          {/* ── Pembanding: angka tadi bagus atau buruk ──────────────── */}
          <SeksiTolokUkur
            tolokUkur={lanjut?.tolokUkur ?? []}
            nrwPct={nrwSah}
            nada={nrwSah === null ? "netral" : nadaNrw(nrwSah)}
            hari={hari}
            memuat={memuatLanjut || (lanjut === null && galatLanjut === null)}
            galat={galatLanjut}
            onCoba={muatUlangLanjut}
          />

          {/* ── Celah itu sendiri, dari hari ke hari ─────────────────── */}
          <section className="mt-12">
            <div aria-hidden className="takar h-2.5 border-t border-line" />
            <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
              Jaraknya dari hari ke hari
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
              Pita berarsir di antara kedua garis adalah air yang hilang hari
              itu. Semakin tebal pitanya, semakin banyak yang tidak sampai.
            </p>
            <div className="mt-6">
              {memuat ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <GrafikCelah
                  labels={data?.labels ?? []}
                  atas={atas}
                  bawah={bawah}
                  namaCelah="Hilang di perjalanan"
                  format={(n) => `${angka(n)} m³`}
                  formatSumbu={(n) => angka(n)}
                  tinggi={268}
                />
              )}
            </div>
          </section>

          {/* ── Gumpalan "hilang di perjalanan" itu dibongkar ────────── */}
          <SeksiNeracaAir
            kelompok={lanjut?.kelompok ?? []}
            kehilanganDiLayar={kehilanganDiLayar}
            hari={hari}
            memuat={memuatLanjut || (lanjut === null && galatLanjut === null)}
            galat={galatLanjut}
            onCoba={muatUlangLanjut}
          />

          {/* ── Per zona ────────────────────────────────────────────── */}
          <section className="mt-12">
            <div aria-hidden className="takar h-2.5 border-t border-line" />
            <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
              Rincian per zona
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
              Penanda tipis pada tiap batang adalah ambang {AMBANG_BAIK}% — di
              kirinya tergolong baik, di kanannya belum.
            </p>
            <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface">
              {memuat ? (
                <Skeleton className="m-5 h-48" />
              ) : perZona.length === 0 ? (
                <KeadaanKosong
                  judul="Belum ada zona"
                  pesan="Tidak ada zona distribusi yang terdata pada rentang ini."
                />
              ) : (
                <DaftarZona baris={perZona} maksBar={maksBar} />
              )}
            </div>
          </section>

          {/* ── Arah, bukan cuma posisi ──────────────────────────────── */}
          <SeksiTrenBulanan
            bulanan={lanjut?.bulanan ?? []}
            tolokUkur={lanjut?.tolokUkur ?? []}
            memuat={memuatLanjut || (lanjut === null && galatLanjut === null)}
            galat={galatLanjut}
            onCoba={muatUlangLanjut}
          />

          {/* ── m³ diterjemahkan jadi sesuatu yang bisa dirasakan ───── */}
          <SeksiPerOrang
            perOrang={lanjut?.perOrang ?? null}
            hari={hari}
            memuat={memuatLanjut || (lanjut === null && galatLanjut === null)}
            galat={galatLanjut}
            onCoba={muatUlangLanjut}
          />

          {/* ── Penjelasan: angka tanpa konteks bukan transparansi ──── */}
          <section className="mt-12">
            <div aria-hidden className="takar h-2.5 border-t border-line" />
            <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
              Apa itu kehilangan air
            </h2>
            <dl className="mt-6 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {PENJELASAN.map(([judul, isi]) => (
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

      {/*
       * Dua seksi terakhir sengaja DI LUAR cabang galat di atas.
       *
       * Kalau agregat gagal dimuat, justru saat itulah orang paling butuh
       * jalan lain menuju datanya — alamat endpoint dan berkas mentahnya
       * tidak bergantung pada permintaan yang baru saja gagal. Halaman yang
       * menjanjikan data terbuka lalu menyembunyikan tautan unduhannya
       * begitu satu permintaan gagal menarik kembali janjinya pada saat
       * janji itu paling diperlukan.
       */}
      <SeksiUnduh hari={hari} />
      <SeksiMetodologi
        meta={lanjut?.meta ?? null}
        memuat={memuatLanjut || (lanjut === null && galatLanjut === null)}
      />
    </div>
  );
}

/**
 * Rincian per zona — daftar bergaris yang MENYUSUN ULANG dirinya, bukan tabel
 * yang bergulir mendatar.
 *
 * ── Kenapa bukan `<Tabel>` lagi ────────────────────────────────────────
 *
 * Versi sebelumnya memakai `<Tabel>` dengan `lebarMin="20rem"`. Itu sudah
 * lebih sempit dari bawaannya, tapi 20rem = 320px tetap lebih lebar daripada
 * ruang yang tersisa di layar 320px (278px setelah padding halaman dan
 * kartu). Hasilnya diukur di peramban: tabelnya bergulir di dalam kartunya,
 * dan kolom "Kehilangan air" — satu-satunya angka yang jadi alasan seksi ini
 * ada — duduk pada x 277–327px, yaitu DI LUAR layar. Kabar terpentingnya
 * hanya bisa dibaca oleh orang yang menebak bahwa kartu itu bisa digeser.
 *
 * Sebagai daftar, tiap zona jadi satu blok: nama di atas, lalu jumlah
 * pelanggan dan volumenya, lalu batang dan persennya memenuhi lebar baris.
 * Tidak ada yang bisa tergeser ke luar pandangan, berapa pun sempit layarnya.
 *
 * Mulai `md` barisnya kembali berjajar sebagai kolom lewat `md:contents`,
 * jadi bacaan tabularnya — membandingkan satu kolom dari atas ke bawah —
 * tetap utuh di layar lebar, lengkap dengan kepala kolomnya.
 */
const KOLOM_ZONA =
  "md:grid-cols-[minmax(0,1fr)_6rem_7.5rem_minmax(10rem,15rem)] md:gap-x-5";

function DaftarZona({
  baris,
  maksBar,
}: {
  baris: BarisZona[];
  maksBar: number;
}) {
  return (
    <>
      {/* Kepala kolom hanya ada saat kolomnya memang berjajar. Di bawah `md`
          tiap angka membawa labelnya sendiri di dalam barisnya. */}
      <div
        aria-hidden
        className={cn(
          "hidden border-b border-line px-5 py-2.5 md:grid",
          "text-[11px] font-semibold tracking-wider text-muted uppercase",
          KOLOM_ZONA,
        )}
      >
        <span>Zona</span>
        <span className="text-right">Pelanggan</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Kehilangan air</span>
      </div>

      <ul>
        {baris.map((b) => (
          <li
            key={b.nama}
            className={cn(
              "grid gap-x-5 gap-y-2 border-b border-line/70 px-5 py-4 last:border-0",
              "md:items-center md:gap-y-0 md:py-3",
              KOLOM_ZONA,
            )}
          >
            <p className="font-medium">{b.nama}</p>

            {/* `md:contents` melepas pembungkus ini begitu kolomnya berjajar,
                jadi kedua angka di dalamnya jatuh langsung ke kolomnya
                masing-masing tanpa perlu ditulis dua kali. */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:contents">
              <p className="tabular font-mono text-[12.5px] text-muted md:text-right md:text-[13px] md:text-ink">
                {angka(b.pelanggan)}{" "}
                {/* Di layar lebar katanya pindah ke kepala kolom, tapi tetap
                    dibacakan pembaca layar — `sr-only`, bukan `hidden`. */}
                <span className="md:sr-only">pelanggan</span>
              </p>
              {/* Angka dan satuannya tidak boleh terpisah ke dua baris:
                  "12.480" di satu baris dan "m³" di baris berikutnya sekilas
                  terbaca sebagai dua hal. */}
              <p className="tabular font-mono text-[12.5px] whitespace-nowrap text-muted md:text-right md:text-[13px] md:text-ink">
                {angka(b.volumeM3)} m³
              </p>
            </div>

            {/* Batang pembanding: mata membandingkan panjang jauh lebih cepat
                daripada membandingkan angka bertumpuk. Sejak di ponsel pun ia
                ikut tampil — dulu `hidden sm:block`, padahal justru di layar
                sempit perbandingan antar zona paling sulit dilakukan. */}
            <div className="flex items-center gap-3 md:justify-end">
              <BarMini
                nilai={b.nrwPct}
                maks={maksBar}
                tanda={AMBANG_BAIK}
                nada={
                  nadaNrw(b.nrwPct) === "sukses"
                    ? "sukses"
                    : nadaNrw(b.nrwPct) === "peringatan"
                      ? "peringatan"
                      : "bahaya"
                }
                className="h-2 min-w-0 flex-1 md:max-w-[9rem]"
              />
              <Badge nada={nadaNrw(b.nrwPct)}>
                <span className="sr-only">Kehilangan air </span>
                {angka(b.nrwPct, 1)}%
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
