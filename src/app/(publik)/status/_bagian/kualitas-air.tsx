"use client";

/**
 * Kualitas air per zona.
 *
 * Nama produknya berarti tembus pandang, dan yang dilacak halaman ini adalah
 * AIR — bukan sekadar ada-tidaknya aliran. Air yang mengalir tapi keruh tetap
 * layanan yang gagal, dan keandalan 99% tidak memberi tahu apa pun soal itu.
 *
 * Tiap nilai diukur terhadap ambang Permenkes yang DIKIRIM SERVER, bukan
 * ditulis di halaman: kalau regulasinya berubah, penandaan "di luar ambang"
 * ikut benar tanpa satu baris pun diubah di sini.
 *
 * Nilai di luar ambang tidak disembunyikan dan tidak dihaluskan. Halaman
 * transparansi yang hanya berani menampilkan angka bagus tidak transparan.
 *
 * ── Kenapa daftar bergaris, bukan `<Tabel>` ────────────────────────────
 *
 * Versi pertamanya memakai `<Tabel>`. Lima kolom tidak muat di 390px, jadi
 * tabelnya bergulir di dalam wadahnya sendiri — dan yang tergeser ke luar
 * pandangan justru kolom kekeruhan, satu-satunya nilai yang sedang di luar
 * ambang. Bergulir mendatar itu sah secara teknis, tetapi ia menyembunyikan
 * kabar terpenting halaman ini dari pembaca di ponsel.
 *
 * Sebagai daftar, tiap zona menjadi satu blok dan ketiga ukurannya berdiri
 * sejajar di bawah namanya. Tidak ada yang tergeser, dan tiap angka tetap
 * punya label dan satuannya sendiri.
 */

import { Badge } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { angka, tanggalJam } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AmbangMutu, KeandalanZona } from "./tipe";

type Posisi = "aman" | "rendah" | "tinggi" | "kosong";

function posisi(
  nilai: number | null,
  bawah: number | null,
  atas: number | null,
): Posisi {
  if (nilai === null || !Number.isFinite(nilai)) return "kosong";
  if (bawah !== null && nilai < bawah) return "rendah";
  if (atas !== null && nilai > atas) return "tinggi";
  return "aman";
}

interface Ukuran {
  label: string;
  nilai: number | null;
  desimal: number;
  satuan: string;
  posisi: Posisi;
  /** Ambang yang disebut saat nilainya menyimpang, mis. "3 NTU". */
  batas: string;
}

function ukuranZona(z: KeandalanZona, a: AmbangMutu | null): Ukuran[] {
  const k = z.kualitas;
  return [
    {
      label: "Sisa klor",
      nilai: k.klorMgL,
      desimal: 2,
      satuan: "mg/L",
      posisi: a ? posisi(k.klorMgL, a.klor[0], a.klor[1]) : "kosong",
      batas: a ? `${angka(a.klor[0], 1)}–${angka(a.klor[1], 1)} mg/L` : "—",
    },
    {
      label: "Kekeruhan",
      nilai: k.kekeruhanNtu,
      desimal: 1,
      satuan: "NTU",
      posisi: a ? posisi(k.kekeruhanNtu, null, a.kekeruhanMaks) : "kosong",
      batas: a ? `${angka(a.kekeruhanMaks)} NTU` : "—",
    },
    {
      label: "pH",
      nilai: k.ph,
      desimal: 1,
      // pH memang tak bersatuan. Dibiarkan kosong, bukan diisi "pH" lagi.
      satuan: "",
      posisi: a ? posisi(k.ph, a.ph[0], a.ph[1]) : "kosong",
      batas: a ? `${angka(a.ph[0], 1)}–${angka(a.ph[1], 1)}` : "—",
    },
  ];
}

const menyimpang = (u: Ukuran) => u.posisi === "rendah" || u.posisi === "tinggi";

const ISTILAH: [string, (a: AmbangMutu) => React.ReactNode][] = [
  [
    "Sisa klor",
    (a) => (
      <>
        Klor yang masih tersisa di pipa sampai ke rumah. Terlalu sedikit berarti
        air tidak lagi terlindungi dari bakteri di sepanjang jaringan; terlalu
        banyak membuat air berbau kaldu. Ambangnya{" "}
        <b className="text-ink">
          {angka(a.klor[0], 1)}–{angka(a.klor[1], 1)} mg/L
        </b>
        .
      </>
    ),
  ],
  [
    "Kekeruhan",
    (a) => (
      <>
        Seberapa banyak partikel melayang di dalam air, diukur dalam NTU. Naik
        setelah hujan deras dan setelah pipa dibongkar. Ambangnya maksimum{" "}
        <b className="text-ink">{angka(a.kekeruhanMaks)} NTU</b>.
      </>
    ),
  ],
  [
    "pH",
    (a) => (
      <>
        Tingkat keasaman. Di luar rentang{" "}
        <b className="text-ink">
          {angka(a.ph[0], 1)}–{angka(a.ph[1], 1)}
        </b>{" "}
        air mulai menggerus pipa atau meninggalkan kerak.
      </>
    ),
  ],
  [
    "Kapan diuji",
    () => (
      <>
        Sampel diambil dari kran pelanggan, bukan dari instalasi pengolahan.
        Yang diukur adalah air yang benar-benar sampai ke rumah, bukan air saat
        baru keluar dari sumbernya.
      </>
    ),
  ],
];

export function SeksiKualitasAir({
  zona,
  ambang,
  memuat,
  dipilih,
  onPilih,
}: {
  zona: KeandalanZona[];
  ambang: AmbangMutu | null;
  memuat: boolean;
  dipilih: string | null;
  onPilih: (id: string) => void;
}) {
  const diLuarAmbang = zona.filter((z) =>
    ukuranZona(z, ambang).some(menyimpang),
  ).length;

  return (
    <section aria-labelledby="judul-mutu" className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h2
            id="judul-mutu"
            className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
          >
            Kualitas air per zona
          </h2>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Hasil uji terakhir dari kran pelanggan, diukur terhadap ambang{" "}
            {ambang ? ambang.acuan : "mutu air minum"}. Air yang mengalir tapi
            tidak layak minum tetap layanan yang belum selesai.
          </p>
        </div>
        {!memuat && diLuarAmbang > 0 ? (
          <Badge nada="peringatan" titik>
            {angka(diLuarAmbang)} zona di luar ambang
          </Badge>
        ) : null}
      </div>

      {memuat ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : zona.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <KeadaanKosong
            judul="Belum ada hasil uji"
            pesan="Laboratorium belum mengirimkan hasil pemeriksaan mutu air untuk periode ini."
          />
        </div>
      ) : (
        <ul className="mt-6 border-t border-line">
          {zona.map((z) => (
            <li key={z.id} className="border-b border-line">
              <BarisMutu
                zona={z}
                ukuran={ukuranZona(z, ambang)}
                terpilih={z.id === dipilih}
                onPilih={() => onPilih(z.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
        {ISTILAH.map(([judul, isi]) => (
          <div key={judul} className="border-b border-line py-4">
            <dt className="font-display text-[14px] font-bold tracking-tight">
              {judul}
            </dt>
            <dd className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-muted">
              {ambang ? (
                isi(ambang)
              ) : (
                <span className="text-muted">
                  Ambang belum dikirim server untuk parameter ini.
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BarisMutu({
  zona,
  ukuran,
  terpilih,
  onPilih,
}: {
  zona: KeandalanZona;
  ukuran: Ukuran[];
  terpilih: boolean;
  onPilih: () => void;
}) {
  const perhatian = ukuran.some(menyimpang);

  return (
    <button
      type="button"
      onClick={onPilih}
      aria-pressed={terpilih}
      className={cn(
        "relative block w-full px-4 py-4 text-left transition-colors sm:px-5",
        terpilih ? "bg-brand-50 dark:bg-brand-900/25" : "hover:bg-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          terpilih ? "bg-brand-500" : "bg-transparent",
        )}
      />

      <div className="grid gap-x-7 gap-y-3 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display font-bold tracking-[-0.01em]">
              {zona.nama}
            </span>
            {perhatian ? (
              <Badge nada="peringatan" titik>
                Perlu perhatian
              </Badge>
            ) : (
              <Badge nada="sukses">Seluruh parameter aman</Badge>
            )}
          </div>
          <p className="tabular mt-1.5 font-mono text-[12px] text-muted">
            {zona.kualitas.diujiPada
              ? `diuji ${tanggalJam(zona.kualitas.diujiPada)}`
              : "belum diuji"}
            {zona.kualitas.titikUji ? (
              <span className="font-sans"> · {zona.kualitas.titikUji}</span>
            ) : null}
          </p>
        </div>

        {/*
         * Tiga ukuran berdiri sejajar — tetapi TIDAK di bawah 400px.
         *
         * Kening "KEKERUHAN" (huruf besar, jarak huruf 0,16em) butuh ±85px.
         * Pada 320px tiap kolom hanya menyisakan ±75px, dan hasilnya kening
         * kekeruhan menabrak kening pH di sebelahnya — dua label berbeda
         * terbaca menyatu. Menyempitkan jarak hurufnya akan memutus keluarga
         * `.eyebrow` yang dipakai seluruh situs, jadi yang diubah adalah
         * SUSUNANNYA: di layar paling sempit tiap ukuran jadi satu baris
         * bergaris sendiri — label di kiri, angka di kanan, keterangan ambang
         * di bawahnya. Tidak ada yang tergeser dan tidak ada yang bertumpuk.
         */}
        <dl className="grid gap-y-2 border-t border-line/70 pt-3 min-[400px]:grid-cols-3 min-[400px]:gap-x-3 lg:border-t-0 lg:pt-0">
          {ukuran.map((u) => (
            <div
              key={u.label}
              className={cn(
                "grid min-w-0 grid-cols-[1fr_auto] items-baseline gap-x-3",
                "border-b border-line/50 pb-2 last:border-0 last:pb-0",
                "min-[400px]:block min-[400px]:border-0 min-[400px]:pb-0",
              )}
            >
              {/*
               * Gaya `.eyebrow` ditulis ulang dengan utilitas, BUKAN dipakai
               * sebagai kelas.
               *
               * "pH" adalah notasi, bukan kata: dibesarkan seluruhnya ia jadi
               * "PH", yang bukan besaran yang sama. Menimpanya dengan
               * `normal-case` tidak bisa — `.eyebrow` ditulis di
               * `@layer utilities` SETELAH utilitas Tailwind, jadi ia menang
               * pada spesifisitas yang sama. Jadi huruf besarnya dipasang per
               * label, bukan dimatikan belakangan.
               */}
              <dt
                className={cn(
                  "text-[0.6875rem] font-semibold tracking-[0.16em] text-muted",
                  u.label !== "pH" && "uppercase",
                )}
              >
                {u.label}
              </dt>
              <dd className="tabular font-mono text-[15px] leading-none whitespace-nowrap min-[400px]:mt-1.5">
                <span
                  className={cn(
                    "font-bold",
                    u.posisi === "kosong"
                      ? "text-muted"
                      : menyimpang(u)
                        ? "text-warn"
                        : "text-ink",
                  )}
                >
                  {u.nilai === null ? "—" : angka(u.nilai, u.desimal)}
                </span>
                {u.satuan && u.nilai !== null ? (
                  <span className="ml-1 text-[11.5px] text-muted">
                    {u.satuan}
                  </span>
                ) : null}
              </dd>
              {/* Warna tidak pernah sendirian: penyimpangan selalu punya kata,
                  dan katanya menyebut ARAH penyimpangannya. */}
              <dd
                className={cn(
                  "col-span-2 mt-1 text-[11px] leading-tight min-[400px]:col-span-1",
                  menyimpang(u) ? "font-semibold text-warn" : "text-muted",
                )}
              >
                {u.posisi === "kosong"
                  ? "belum ada hasil"
                  : menyimpang(u)
                    ? `${u.posisi === "rendah" ? "di bawah" : "di atas"} ambang ${u.batas}`
                    : `dalam ambang ${u.batas}`}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </button>
  );
}
