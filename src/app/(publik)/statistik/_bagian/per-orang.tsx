"use client";

import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { BarMini } from "@/components/domain/grafik";
import { Badge } from "@/components/ui/badge";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { JudulSeksi } from "./judul-seksi";
import type { PemakaianPerOrang } from "./tipe";

/**
 * Meter kubik diterjemahkan menjadi liter per orang per hari.
 *
 * "28.797 m³" adalah angka yang tidak bisa dirasakan siapa pun. Dibagi
 * jumlah jiwa dan jumlah hari, ia berubah menjadi sesuatu yang bisa ditimbang
 * terhadap pengalaman sendiri — dan terhadap satu angka yang sudah disepakati
 * dunia: 60 liter per orang per hari untuk kebutuhan pokok.
 *
 * Hasilnya TIDAK menyanjung jaringan ini, dan itu dipertahankan apa adanya.
 * Angka yang jujur tetapi tidak menyenangkan jauh lebih berguna daripada
 * pembagi yang disetel sampai hasilnya terlihat bagus — dan asumsi yang
 * dipakai ikut ditulis di halaman supaya bisa dibantah.
 */

/** Satu ember rumah tangga, untuk menerjemahkan liter jadi benda. */
const EMBER_L = 15;

export function SeksiPerOrang({
  perOrang,
  hari,
  memuat,
  galat,
  onCoba,
}: {
  perOrang: PemakaianPerOrang | null;
  hari: number;
  memuat: boolean;
  galat: string | null;
  onCoba: () => void;
}) {
  const standar = perOrang?.kebutuhanDasarLOrangHari ?? 60;
  const tercatat = perOrang?.tercatatLOrangHari ?? null;
  const disalurkan = perOrang?.disalurkanLOrangHari ?? null;

  const baris: {
    kunci: string;
    nama: string;
    nilai: number | null;
    nada: "brand" | "peringatan" | "netral";
    tebal: boolean;
    bergerak: boolean;
  }[] = [
    {
      kunci: "standar",
      nama: "Kebutuhan pokok menurut WHO",
      nilai: standar,
      nada: "netral",
      tebal: false,
      bergerak: false,
    },
    {
      kunci: "disalurkan",
      nama: "Disalurkan ke jaringan per orang",
      nilai: disalurkan,
      nada: "peringatan",
      tebal: false,
      bergerak: true,
    },
    {
      kunci: "tercatat",
      nama: "Tercatat sampai di meter pelanggan",
      nilai: tercatat,
      nada: "brand",
      tebal: true,
      bergerak: true,
    },
  ];

  return (
    <section className="mt-12">
      <JudulSeksi judul="Berapa artinya untuk satu orang">
        Volume jaringan dibagi perkiraan jumlah jiwa dan jumlah hari, lalu
        ditimbang terhadap kebutuhan pokok air minum 60 liter per orang per
        hari.
      </JudulSeksi>

      {galat ? (
        <div className="mt-5 rounded-card border border-line bg-surface">
          <KeadaanGalat pesan={galat} onCoba={onCoba} />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface">
          <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
            <div className="bg-surface p-6 sm:p-7">
              {memuat || !perOrang ? (
                <div className="space-y-4">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ) : (
                <>
                  <p className="eyebrow text-muted">
                    Tercatat per orang per hari
                  </p>
                  <p className="mt-3.5 flex items-baseline gap-1.5">
                    <AngkaBergerak
                      nilai={tercatat}
                      desimal={1}
                      className="tabular font-mono text-[2.75rem] leading-[0.9] font-bold text-brand-600"
                    />
                    <span className="font-mono text-[1.05rem] font-semibold text-muted">
                      liter
                    </span>
                  </p>
                  <div className="mt-4">
                    {/* Hanya dua keadaan: memenuhi kebutuhan pokok, atau
                        belum. Ambang ketiga di 50% akan membuat lencananya
                        berganti warna karena selisih sepersepuluh poin, dan
                        warna yang berbalik di angka sedekat itu terbaca
                        sebagai penilaian, bukan pengukuran. */}
                    <Badge
                      nada={
                        perOrang.pemenuhanPct >= 100 ? "sukses" : "peringatan"
                      }
                      titik
                    >
                      {angka(perOrang.pemenuhanPct, 1)}% dari kebutuhan pokok
                    </Badge>
                  </div>
                  <p className="mt-4 max-w-[36ch] text-[13px] leading-relaxed text-muted">
                    Kira-kira{" "}
                    <b className="text-ink">
                      {tercatat === null
                        ? "—"
                        : angka(tercatat / EMBER_L, 1)}{" "}
                      ember {EMBER_L} liter
                    </b>{" "}
                    per orang per hari, rata-rata selama {hari} hari terakhir.
                  </p>
                </>
              )}
            </div>

            <div className="bg-surface p-6 sm:p-7">
              {memuat || !perOrang ? (
                <div className="space-y-5">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <ul>
                    {baris.map((b, i) => (
                      <li
                        key={b.kunci}
                        className={cn("py-3.5", i > 0 && "border-t border-line")}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <p
                            className={cn(
                              "text-[13.5px] leading-snug",
                              b.tebal ? "font-semibold text-ink" : "text-ink/85",
                            )}
                          >
                            {b.nama}
                          </p>
                          <p className="tabular shrink-0 font-mono text-[13px] font-semibold whitespace-nowrap">
                            {b.bergerak ? (
                              <AngkaBergerak nilai={b.nilai} desimal={1} />
                            ) : (
                              angka(b.nilai ?? 0, 1)
                            )}{" "}
                            L
                          </p>
                        </div>
                        <BarMini
                          nilai={b.nilai}
                          maks={standar}
                          nada={b.nada}
                          className={cn("mt-2", b.tebal ? "h-2.5" : "h-1.5")}
                        />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted">
                    Jarak antara dua batang bawah adalah kehilangan air yang
                    sama dengan yang dirinci di neraca air — dinyatakan per
                    orang, bukan per jaringan.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {perOrang ? (
        <p className="mt-5 max-w-[66ch] text-[13px] leading-relaxed text-muted">
          Angka ini hanya menghitung air PDAM yang <b>tercatat di meter</b>.
          Banyak rumah tangga masih menambah dari sumur atau air kemasan, dan
          pemakaian yang tidak tercatat — termasuk sambungan liar pada neraca
          air di atas — tidak masuk hitungan. Pembaginya adalah perkiraan{" "}
          <span className="tabular font-mono">
            {angka(perOrang.jiwaTerlayani)}
          </span>{" "}
          jiwa, dari {angka(perOrang.jiwaPerSambungan, 1)} jiwa per sambungan.
          Itu rata-rata nasional, bukan hasil pendataan per rumah; kalau
          angkanya meleset, seluruh bagian ini ikut meleset sebesar yang sama.
        </p>
      ) : null}
    </section>
  );
}
