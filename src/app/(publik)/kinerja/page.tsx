"use client";

/**
 * J04 — Rapor kinerja penanganan pengaduan. TANPA LOGIN.
 *
 * PDAM memublikasikan nilai rapornya sendiri. Inilah bentuk paling konkret
 * dari "mendorong akuntabilitas publik" pada tema lomba.
 */
import { useState } from "react";
import { Card, Panel } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { GrafikGaris } from "@/components/domain/grafik";
import useApi from "@/lib/use-api";
import { angka, tanggal } from "@/lib/format";
import { nilaiKpi, type KinerjaPublik } from "@/types/publik";

const RENTANG = [
  { hari: 7, label: "7 hari" },
  { hari: 30, label: "30 hari" },
  { hari: 90, label: "90 hari" },
];

type BarisKategori = KinerjaPublik["perKategori"][number];

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

  const kolom: Kolom<BarisKategori>[] = [
    {
      kunci: "kategori",
      label: "Kategori",
      render: (b) => <span className="font-medium">{b.kategori}</span>,
    },
    {
      kunci: "masuk",
      label: "Masuk",
      rata: "kanan",
      render: (b) => <span className="tabular font-mono">{angka(b.masuk)}</span>,
    },
    {
      kunci: "selesai",
      label: "Selesai",
      rata: "kanan",
      render: (b) => (
        <span className="tabular font-mono">{angka(b.selesai)}</span>
      ),
    },
    {
      kunci: "ketepatan",
      label: "Tepat waktu",
      rata: "kanan",
      render: (b) => (
        <span
          className={`tabular font-mono font-semibold ${
            b.ketepatanPct >= 90 ? "text-success" : "text-warn"
          }`}
        >
          {angka(b.ketepatanPct, 1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <p className="eyebrow text-brand-600">Akuntabilitas</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Rapor Kinerja
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Seberapa cepat pengaduan warga ditangani, dihitung dari data
          penanganan yang sebenarnya — termasuk yang terlambat.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {RENTANG.map((r) => (
          <button
            key={r.hari}
            type="button"
            onClick={() => setHari(r.hari)}
            aria-pressed={hari === r.hari}
            className={`rounded-input border px-4 py-2 text-[13px] font-semibold transition-colors ${
              hari === r.hari
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-line-strong hover:bg-soft"
            }`}
          >
            {r.label}
          </button>
        ))}
        {data ? (
          <span className="ml-auto text-[12.5px] text-muted">
            {tanggal(data.periode.mulai)} – {tanggal(data.periode.selesai)}
          </span>
        ) : null}
      </div>

      {galat ? (
        <Card>
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {memuat ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[6.5rem]" />)
            ) : (
              <>
                <StatTile
                  label="Pengaduan masuk"
                  nilai={masuk === null ? null : angka(masuk)}
                  satuan="laporan"
                />
                <StatTile
                  label="Selesai ditangani"
                  nilai={selesai === null ? null : angka(selesai)}
                  satuan="laporan"
                  kaki={
                    masuk && selesai
                      ? `${angka((selesai / masuk) * 100, 1)}% dari yang masuk`
                      : undefined
                  }
                />
                <StatTile
                  label="Tepat waktu"
                  nilai={ketepatan === null ? null : angka(ketepatan, 1)}
                  satuan="%"
                  nada={
                    ketepatan !== null && ketepatan >= 90 ? "sukses" : "peringatan"
                  }
                  kaki="sesuai batas SLA kategorinya"
                />
                <StatTile
                  label="Rata-rata waktu tanggap"
                  nilai={tanggap === null ? null : angka(tanggap)}
                  satuan="menit"
                  kaki="dari laporan masuk sampai ditugaskan"
                />
              </>
            )}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel
              judul="Tren ketepatan waktu"
              sub="Sumbu dimulai dari 80% agar pergerakannya terbaca."
            >
              {memuat ? (
                <Skeleton className="h-60 w-full" />
              ) : (
                <GrafikGaris
                  labels={data?.tren.labels ?? []}
                  deret={data?.tren.series ?? []}
                  format={(n) => `${n}%`}
                  domain={[80, 100]}
                />
              )}
            </Panel>

            <Panel judul="Per kategori pengaduan">
              {memuat ? (
                <Skeleton className="h-60 w-full" />
              ) : (
                <Tabel
                  kolom={kolom}
                  data={data?.perKategori ?? []}
                  kunciBaris={(b) => b.kategori}
                  lebarMin="24rem"
                />
              )}
            </Panel>
          </div>

          {/* Angka tanpa penjelasan tidak memenuhi "informasi jelas dan
              relevan". Bagian ini bukan hiasan — ia yang membuat rapor di
              atas bisa dipahami orang yang bukan petugas PDAM. */}
          <Panel judul="Bagaimana angka ini dihitung" className="mt-5">
            <div className="space-y-3 text-[13.5px] leading-relaxed text-muted">
              <p>
                <b className="text-ink">SLA</b> adalah batas waktu penanganan
                yang dijanjikan untuk tiap jenis pengaduan. Batasnya berbeda
                menurut tingkat kedaruratan: kebocoran pipa ditangani lebih
                cepat daripada keluhan tekanan lemah.
              </p>
              <p>
                <b className="text-ink">Tepat waktu</b> dihitung dari jumlah
                pengaduan yang selesai sebelum batas waktunya, dibagi seluruh
                pengaduan yang masuk pada periode tersebut.
              </p>
              <p>
                <b className="text-ink">Waktu tanggap</b> dihitung sejak laporan
                masuk sampai petugas ditugaskan — bukan sampai pekerjaan
                selesai.
              </p>
              <p>
                Pengaduan yang melewati batas waktu tetap ikut dihitung dan
                tidak dikeluarkan dari laporan.
              </p>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
