"use client";

import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { BarMini } from "@/components/domain/grafik";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { JudulSeksi } from "./judul-seksi";
import type { KelompokKunci, KelompokNeraca } from "./tipe";

/**
 * Neraca air — kehilangan dipecah sampai ke komponennya.
 *
 * Di bagian atas halaman, kehilangan air adalah SATU gumpalan: sekian ribu
 * meter kubik "hilang di perjalanan". Satu angka besar yang tidak bisa
 * ditindaklanjuti siapa pun. Neraca air adalah cara standar industri
 * membongkarnya, dan membongkarnya mengubah artinya: "bocor" dan "salah
 * catat" dan "dipakai untuk membilas pipa" menuntut tiga pekerjaan yang
 * sama sekali berbeda, dan hanya dua di antaranya layak disebut kerugian.
 *
 * Satu hal yang menentukan apakah seksi ini dipercaya: jumlah seluruh
 * komponen HARUS sama persis dengan kehilangan yang sudah tampil di atas.
 * Karena itu penjumlahannya dihitung ulang DI SINI, di depan pembaca, dan
 * dicocokkan dengan angka yang datang dari endpoint statistik — bukan
 * diakui benar begitu saja. Kalau suatu hari keduanya berbeda, halaman ini
 * mengakuinya sendiri alih-alih diam.
 */

const GAYA: Record<
  KelompokKunci,
  {
    batang: string;
    titik: string;
    nada: "peringatan" | "brand" | "netral";
  }
> = {
  // Sama dengan ruas berarsir pada pipa di atas: inilah yang benar-benar
  // terbuang.
  fisik: { batang: "bg-warn", titik: "bg-warn", nada: "peringatan" },
  // Air ini sampai ke pemakainya. Ia memakai warna air, bukan warna
  // peringatan — yang hilang catatannya, bukan airnya.
  komersial: { batang: "bg-brand-500", titik: "bg-brand-500", nada: "brand" },
  // Disengaja dan perlu. Netral, karena ia bukan kegagalan.
  resmi: { batang: "bg-line-strong", titik: "bg-line-strong", nada: "netral" },
};

export function SeksiNeracaAir({
  kelompok,
  /** Kehilangan menurut endpoint statistik — pembanding untuk mencocokkan. */
  kehilanganDiLayar,
  hari,
  memuat,
  galat,
  onCoba,
}: {
  kelompok: KelompokNeraca[];
  kehilanganDiLayar: number | null;
  hari: number;
  memuat: boolean;
  galat: string | null;
  onCoba: () => void;
}) {
  const komponen = kelompok.flatMap((g) => g.komponen);
  const jumlahKomponen = komponen.reduce((a, k) => a + k.volumeM3, 0);
  const cocok =
    kehilanganDiLayar !== null && jumlahKomponen === kehilanganDiLayar;

  /*
   * Skala batang komponen DIPATOK ke komponen terbesar, dibulatkan ke
   * kelipatan 5. Di sini memakai skala penuh 100% justru salah: tidak ada
   * satu komponen pun yang mendekatinya, dan seluruh batang akan jadi
   * potongan pendek yang tak terbandingkan.
   */
  const maksPorsi = Math.max(
    10,
    Math.ceil(komponen.reduce((m, k) => Math.max(m, k.porsiPct), 0) / 5) * 5,
  );

  return (
    <section className="mt-12">
      <JudulSeksi judul="Ke mana perginya air yang hilang">
        Kehilangan air bukan satu hal. Neraca air membaginya menjadi air yang
        benar-benar keluar dari pipa, air yang sampai tetapi tidak tercatat,
        dan air yang memang dipakai untuk merawat jaringan. Porsinya berasal
        dari audit triwulanan; volumenya mengikuti rentang {hari} hari yang
        Anda pilih.
      </JudulSeksi>

      {galat ? (
        <div className="mt-5 rounded-card border border-line bg-surface">
          <KeadaanGalat pesan={galat} onCoba={onCoba} />
        </div>
      ) : memuat ? (
        <div className="mt-5 space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <>
          {/* ── Satu batang: tiga kelompok, dibaca sekali lihat ───────── */}
          <div
            className="motion-aware mt-6 flex h-12 w-full overflow-hidden rounded-[0.5rem] border border-line bg-canvas"
            role="img"
            aria-label={kelompok
              .map(
                (g) =>
                  `${g.nama} ${angka(g.volumeM3)} meter kubik atau ${angka(g.porsiPct, 1)} persen`,
              )
              .join(", ")}
          >
            {kelompok.map((g) => (
              <div
                key={g.kunci}
                className={cn(
                  "border-r border-surface/40 transition-[width] duration-700 ease-out last:border-r-0",
                  GAYA[g.kunci].batang,
                )}
                style={{ width: `${g.porsiPct}%` }}
              />
            ))}
          </div>

          {/*
           * Persennya ditulis DI LEGENDA, bukan di dalam ruas batangnya.
           * Teks putih di atas `warn` dan `brand-500` pada tema terang hanya
           * mencapai sekitar 2,5–3,5:1 — di bawah ambang mana pun, dan tidak
           * ada satu warna teks yang terbaca di kedua tema sekaligus. Di
           * legenda angkanya duduk di atas permukaan halaman, jadi selalu
           * terbaca, dan nama kelompoknya ikut terbawa.
           */}
          <ul className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {kelompok.map((g) => (
              <li
                key={g.kunci}
                className="flex items-center gap-2 text-[12px] text-muted"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    GAYA[g.kunci].titik,
                  )}
                />
                {g.nama}
                <span className="tabular font-mono font-semibold text-ink">
                  {angka(g.porsiPct, 1)}%
                </span>
              </li>
            ))}
          </ul>

          {/* ── Rincian per kelompok ──────────────────────────────────── */}
          <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            {kelompok.map((g, gi) => (
              <div key={g.kunci} className={cn(gi > 0 && "border-t border-line")}>
                <div className="bg-soft/60 px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="flex items-center gap-2.5 font-display text-[15px] font-bold tracking-tight">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          GAYA[g.kunci].titik,
                        )}
                      />
                      {g.nama}
                    </h3>
                    <p className="tabular font-mono text-[13.5px] font-bold whitespace-nowrap">
                      <AngkaBergerak nilai={g.volumeM3} /> m³
                      <span className="ml-2 font-semibold text-muted">
                        {angka(g.porsiPct, 1)}%
                      </span>
                    </p>
                  </div>
                  <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
                    {g.ringkas}
                  </p>
                </div>

                <ul className="px-5">
                  {g.komponen.map((k, i) => (
                    <li
                      key={k.kunci}
                      className={cn("py-3.5", i > 0 && "border-t border-line")}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-[13.5px] leading-snug">{k.nama}</p>
                        <p className="tabular shrink-0 font-mono text-[13px] font-semibold whitespace-nowrap">
                          <AngkaBergerak nilai={k.volumeM3} /> m³
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <BarMini
                          nilai={k.porsiPct}
                          maks={maksPorsi}
                          nada={GAYA[g.kunci].nada}
                          className="h-1.5 flex-1"
                        />
                        <span className="tabular w-[3.25rem] shrink-0 text-right font-mono text-[12px] text-muted">
                          {angka(k.porsiPct, 1)}%
                        </span>
                      </div>
                      <p className="mt-1.5 max-w-[60ch] text-[12.5px] leading-relaxed text-muted">
                        {k.catatan}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* ── Baris cocok: penjumlahan yang bisa diperiksa sendiri ─── */}
            <div className="border-t-2 border-line-strong bg-soft/60 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="eyebrow text-muted">
                  Jumlah seluruh komponen
                </p>
                <p className="tabular font-mono text-[1.05rem] leading-none font-bold whitespace-nowrap">
                  <AngkaBergerak nilai={jumlahKomponen} /> m³
                </p>
              </div>
              <p className="mt-2 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
                {cocok ? (
                  <>
                    Sama persis dengan{" "}
                    <b className="text-ink">
                      {angka(kehilanganDiLayar)} m³
                    </b>{" "}
                    kehilangan air yang ditampilkan di bagian atas halaman.
                    Rinciannya membagi habis angka itu, tanpa sisa dan tanpa
                    tambahan.
                  </>
                ) : (
                  <>
                    Angka ini belum cocok dengan kehilangan air yang
                    ditampilkan di bagian atas halaman
                    {kehilanganDiLayar === null
                      ? ""
                      : ` (${angka(kehilanganDiLayar)} m³)`}
                    . Selisihnya ditampilkan apa adanya alih-alih ditutup —
                    salah satu dari kedua sumbernya sedang tidak sinkron.
                  </>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
