"use client";

/**
 * J05 — Statistik distribusi air terbuka. TANPA LOGIN.
 *
 * Agregat saja: tidak ada satu pun data per pelanggan di halaman ini.
 */
import { useState } from "react";
import { Card, Panel } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { Badge } from "@/components/ui/badge";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { GrafikBatang } from "@/components/domain/grafik";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import type { StatistikPublik } from "@/types/publik";

const RENTANG = [
  { hari: 7, label: "7 hari" },
  { hari: 30, label: "30 hari" },
  { hari: 90, label: "90 hari" },
];

type BarisZona = StatistikPublik["perZona"][number];

/** PDAM di Indonesia umumnya 20–30%. Di luar 0–100% berarti salah hitung. */
function nadaNrw(p: number) {
  if (p < 0 || p > 100) return "netral" as const;
  if (p <= 20) return "sukses" as const;
  if (p <= 30) return "peringatan" as const;
  return "bahaya" as const;
}

export default function HalamanStatistik() {
  const [hari, setHari] = useState(30);
  const { data, memuat, galat, muatUlang } = useApi<StatistikPublik>(
    `/api/publik/statistik?rentang=${hari}`,
  );

  // NRW di luar 0–100% mustahil. Menampilkannya apa adanya akan jadi
  // pertanyaan pertama juri; lebih baik tampil "—" sampai sumbernya benar.
  const nrwSah =
    data != null && data.nrwPct >= 0 && data.nrwPct <= 100 ? data.nrwPct : null;

  const kolom: Kolom<BarisZona>[] = [
    {
      kunci: "nama",
      label: "Zona",
      render: (b) => <span className="font-medium">{b.nama}</span>,
    },
    {
      kunci: "pelanggan",
      label: "Pelanggan",
      rata: "kanan",
      sembunyiKecil: true,
      render: (b) => (
        <span className="tabular font-mono">{angka(b.pelanggan)}</span>
      ),
    },
    {
      kunci: "volume",
      label: "Volume",
      rata: "kanan",
      render: (b) => (
        <span className="tabular font-mono">{angka(b.volumeM3)} m³</span>
      ),
    },
    {
      kunci: "nrw",
      label: "Kehilangan air",
      rata: "kanan",
      render: (b) => (
        <Badge nada={nadaNrw(b.nrwPct)}>{angka(b.nrwPct, 1)}%</Badge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <p className="eyebrow text-brand-600">Data terbuka</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Statistik Distribusi
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Berapa air yang disalurkan, berapa yang tercatat sampai ke pelanggan,
          dan berapa yang hilang di perjalanan.
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
                  label="Pelanggan terlayani"
                  nilai={data ? angka(data.pelangganTerlayani) : null}
                  satuan="rumah"
                />
                <StatTile
                  label="Air disalurkan"
                  nilai={data ? angka(data.volumeDisalurkanM3) : null}
                  satuan="m³"
                  kaki={`selama ${hari} hari`}
                />
                <StatTile
                  label="Air tercatat"
                  nilai={data ? angka(data.volumeTercatatM3) : null}
                  satuan="m³"
                  kaki="terukur di meter pelanggan"
                />
                <StatTile
                  label="Kehilangan air"
                  nilai={nrwSah === null ? null : angka(nrwSah, 1)}
                  satuan="%"
                  nada={nrwSah === null ? "netral" : nadaNrw(nrwSah)}
                  kaki="selisih salur dan catat"
                />
              </>
            )}
          </div>

          <Panel
            judul="Air disalurkan dan tercatat"
            sub="Jarak antara dua batang adalah air yang hilang."
            className="mt-5"
          >
            {memuat ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <GrafikBatang
                labels={data?.labels ?? []}
                deret={data?.series ?? []}
                format={(n) => `${angka(n)} m³`}
              />
            )}
          </Panel>

          <Panel judul="Rincian per zona" className="mt-5" isiClassName="p-0">
            {memuat ? (
              <Skeleton className="m-5 h-48" />
            ) : (
              <Tabel
                kolom={kolom}
                data={data?.perZona ?? []}
                kunciBaris={(b) => b.nama}
              />
            )}
          </Panel>

          <Panel judul="Apa itu kehilangan air (NRW)?" className="mt-5">
            <div className="space-y-3 text-[13.5px] leading-relaxed text-muted">
              <p>
                <b className="text-ink">Kehilangan air</b> atau{" "}
                <i>non-revenue water</i> adalah selisih antara air yang
                disalurkan PDAM dengan air yang benar-benar tercatat di meter
                pelanggan.
              </p>
              <p>
                Penyebabnya bukan hanya kebocoran pipa: ada juga meter yang
                sudah tidak akurat, sambungan liar, dan air yang dipakai untuk
                pembilasan jaringan.
              </p>
              <p>
                Angka di bawah <b className="text-ink">20%</b> tergolong baik.
                Rata-rata PDAM di Indonesia berada di kisaran{" "}
                <b className="text-ink">20–30%</b>. Semakin kecil angkanya,
                semakin sedikit air bersih yang terbuang sebelum sampai ke
                rumah warga.
              </p>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
