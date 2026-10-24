"use client";

import { Badge, type Nada } from "@/components/ui/badge";
import { BarMini } from "@/components/domain/grafik";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { JudulSeksi } from "./judul-seksi";
import type { TolokUkur } from "./tipe";

/**
 * Angka NRW dibandingkan terhadap pembanding yang disebut namanya.
 *
 * "19%" tidak berarti apa-apa bagi pembaca yang belum pernah mengurus
 * jaringan air. Bagus? Buruk? Dibanding apa? Seksi ini menjawabnya dengan
 * menaruh angka kita dan tiga acuan pada SATU sumbu yang sama, lengkap
 * dengan dari mana tiap acuan berasal.
 *
 * Bentuknya daftar bergaris di atas satu sumbu bersama, bukan empat kartu.
 * Kartu menyamaratakan; daftar di satu sumbu memaksa mata membandingkan
 * panjang, dan perbandingan panjang itulah seluruh isi seksi ini.
 *
 * Skalanya DIPATOK 0–40%, bukan diskalakan ke nilai terbesar. Skala yang
 * mengikuti data membuat baris terburuk selalu tampak penuh, dan itu
 * menyembunyikan seberapa buruk angkanya sebenarnya.
 */
const SKALA_MAKS = 40;
const TOMBAK = [0, 10, 20, 30, 40];

interface Baris {
  kunci: string;
  nama: string;
  sumber: string;
  nilaiPct: number;
  kita: boolean;
  nada: "brand" | "sukses" | "peringatan" | "bahaya" | "netral";
}

function cariNilai(daftar: TolokUkur[], kunci: string): number | null {
  const t = daftar.find((x) => x.kunci === kunci);
  return t && Number.isFinite(t.nilaiPct) ? t.nilaiPct : null;
}

/** "1,0 poin lebih rendah" / "3,5 poin lebih tinggi" / "setara". */
function beda(nrw: number, lawan: number): string {
  const d = Math.round((nrw - lawan) * 10) / 10;
  if (d === 0) return "setara";
  return `${angka(Math.abs(d), 1)} poin lebih ${d < 0 ? "rendah" : "tinggi"}`;
}

export function SeksiTolokUkur({
  tolokUkur,
  nrwPct,
  nada,
  hari,
  memuat,
  galat,
  onCoba,
}: {
  tolokUkur: TolokUkur[];
  /** NRW kita pada rentang yang sedang dipilih. `null` bila belum sah. */
  nrwPct: number | null;
  /** Nada untuk baris kita. Datang dari halaman supaya ambangnya satu sumber. */
  nada: Nada;
  hari: number;
  memuat: boolean;
  galat: string | null;
  onCoba: () => void;
}) {
  const target = cariNilai(tolokUkur, "target");
  const nasional = cariNilai(tolokUkur, "nasional");
  const terbaik = cariNilai(tolokUkur, "terbaik");

  const baris: Baris[] = [
    ...tolokUkur.map((t) => ({
      kunci: t.kunci,
      nama: t.nama,
      sumber: t.sumber,
      nilaiPct: t.nilaiPct,
      kita: false,
      nada: "netral" as const,
    })),
    ...(nrwPct === null
      ? []
      : [
          {
            kunci: "jernih",
            nama: "Jernih — jaringan ini",
            sumber: `Terukur selama ${hari} hari terakhir`,
            nilaiPct: nrwPct,
            kita: true,
            nada: (nada === "sukses"
              ? "sukses"
              : nada === "peringatan"
                ? "peringatan"
                : nada === "bahaya"
                  ? "bahaya"
                  : "brand") as Baris["nada"],
          },
        ]),
  ].sort((a, b) => a.nilaiPct - b.nilaiPct);

  return (
    <section className="mt-12">
      <JudulSeksi judul="Bagus atau buruk, dibanding apa">
        Angka kehilangan air baru berarti kalau ada pembandingnya. Keempatnya
        diletakkan pada satu sumbu yang sama, dipatok 0–40% supaya panjangnya
        bisa dibandingkan langsung. Garis tipis pada tiap batang adalah target
        pemerintah.
      </JudulSeksi>

      <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface">
        {galat ? (
          <KeadaanGalat pesan={galat} onCoba={onCoba} />
        ) : memuat ? (
          <div className="space-y-4 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <ul className="px-5">
              {baris.map((b, i) => (
                <li
                  key={b.kunci}
                  className={cn(
                    "grid gap-x-6 gap-y-2.5 py-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center",
                    i > 0 && "border-t border-line",
                  )}
                >
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-[13.5px] leading-snug",
                        b.kita ? "font-semibold text-ink" : "text-ink/85",
                      )}
                    >
                      {b.nama}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">
                      {b.sumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <BarMini
                      nilai={b.nilaiPct}
                      maks={SKALA_MAKS}
                      tanda={target ?? undefined}
                      nada={b.nada}
                      className={cn("flex-1", b.kita ? "h-3" : "h-2")}
                    />
                    <span
                      className={cn(
                        "tabular w-[4.25rem] shrink-0 text-right font-mono text-[13.5px]",
                        b.kita ? "font-bold text-ink" : "text-muted",
                      )}
                    >
                      {b.kita ? (
                        <>
                          <AngkaBergerak nilai={b.nilaiPct} desimal={1} />%
                        </>
                      ) : (
                        `${angka(b.nilaiPct, 1)}%`
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Sumbu bersama. Lebarnya sengaja disusun dengan struktur yang
                SAMA PERSIS dengan baris di atas — batang `flex-1` lalu kolom
                angka selebar tetap — supaya tombaknya benar-benar jatuh di
                tempat yang sama, bukan kira-kira. */}
            <div
              aria-hidden
              className="grid gap-x-6 border-t border-line px-5 pt-3 pb-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
            >
              <div className="hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="flex flex-1 justify-between">
                  {TOMBAK.map((t) => (
                    <span
                      key={t}
                      className="tabular font-mono text-[11px] text-muted"
                    >
                      {t}%
                    </span>
                  ))}
                </div>
                <span className="w-[4.25rem] shrink-0" />
              </div>
            </div>
          </>
        )}
      </div>

      {nrwPct !== null && target !== null && nasional !== null && terbaik !== null ? (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Badge nada={nrwPct <= target ? "sukses" : "peringatan"} titik>
            {beda(nrwPct, target)} dari target
          </Badge>
          <Badge nada={nrwPct <= nasional ? "sukses" : "peringatan"} titik>
            {beda(nrwPct, nasional)} dari rata-rata nasional
          </Badge>
          <Badge nada={nrwPct <= terbaik ? "sukses" : "netral"} titik>
            {beda(nrwPct, terbaik)} dari praktik terbaik
          </Badge>
        </div>
      ) : null}
    </section>
  );
}
