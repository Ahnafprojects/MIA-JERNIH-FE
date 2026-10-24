import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/keadaan";
import { BarMini } from "@/components/domain/grafik";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { jamJanji } from "./durasi";
import type { JanjiKategori } from "./tipe";

/**
 * Janji waktu per kategori — separuh yang hilang dari sebuah "status".
 *
 * "Sedang ditangani" tidak berarti apa-apa tanpa ukuran: sedang ditangani
 * sejak kapan, dan sampai kapan masih boleh disebut wajar. Karena itu tiap
 * baris membawa tiga hal sekaligus — janjinya, alasannya, dan seberapa sering
 * janji itu benar-benar ditepati belakangan ini.
 *
 * Yang MELESET tetap ditampilkan dengan kata, bukan dibuang. Daftar yang
 * seluruhnya hijau justru merusak kepercayaan lebih cepat daripada satu baris
 * yang mengaku di bawah target.
 */

/**
 * Satu susunan grid untuk kepala dan seluruh baris, supaya penggaris di atas
 * benar-benar segaris dengan batang di bawahnya.
 *
 * Di bawah `sm` kolomnya SATU, dan itu disengaja: batang dan penggaris harus
 * selalu sama lebar dan sama awal, kalau tidak sumbunya berbohong. Menaruh
 * batang di kolom sempit di sebelah angka ketepatan akan memutus hubungan itu
 * — penggaris selebar layar di atas batang selebar separuhnya adalah skala
 * yang salah, bukan sekadar tampilan yang padat.
 */
const BARIS =
  "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,14rem)_7rem]";

/** Skala penggaris: kelipatan 12 jam yang mencakup janji terpanjang. */
function skala(janji: JanjiKategori[]): number {
  const terpanjang = janji.reduce(
    (m, j) => (Number.isFinite(j.janjiJam) ? Math.max(m, j.janjiJam) : m),
    0,
  );
  return Math.max(12, Math.ceil(terpanjang / 12) * 12);
}

/**
 * Garis takar mendatar — perangkat yang sama dengan sisi gelas ukur di
 * halaman lain, dipakai di sini sebagai sumbu jam. Batang sepanjang 4 jam
 * memang tampil sebagai sisa yang tipis; itu justru isi pesannya.
 */
function Penggaris({ maks }: { maks: number }) {
  const tik = Array.from({ length: maks / 12 + 1 }, (_, i) => i * 12);

  /*
   * Yang DIBERI ANGKA hanya kelipatan 24; garisnya tetap tiap 12 jam.
   *
   * Kolom batang menyempit sampai 9rem di lebar peralihan, dan di situ label
   * tiap 12 jam saling menindih — "36" menabrak "48 jam". Sumbu yang angkanya
   * bertumpuk lebih buruk daripada sumbu yang bertanda lebih jarang: garis
   * tengahnya masih terbaca sebagai pembagi, dan angkanya tidak pernah
   * berebut tempat di lebar mana pun.
   */
  const label = tik.filter((t) => t % 24 === 0);

  return (
    <div aria-hidden className="select-none">
      <div className="relative h-2 border-b border-line">
        {tik.map((t) => (
          <span
            key={t}
            className={cn(
              "absolute bottom-0 w-px",
              t % 24 === 0 ? "h-2 bg-line-strong" : "h-1 bg-line",
            )}
            style={{ left: `${(t / maks) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-4 text-[10px] text-muted">
        {label.map((t) => (
          <span
            key={t}
            className="tabular absolute top-0 font-mono whitespace-nowrap"
            style={{
              left: `${(t / maks) * 100}%`,
              transform:
                t === 0
                  ? "none"
                  : t === maks
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
            }}
          >
            {t === maks ? `${t} jam` : t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function JanjiWaktu({
  janji,
  targetPct,
  ketepatanPct,
  rentangHari,
  memuat,
  /** Kategori tiket yang sedang dilihat — barisnya ditandai dengan KATA. */
  sorotKategori,
}: {
  janji: JanjiKategori[];
  targetPct: number;
  ketepatanPct: number | null;
  rentangHari: number;
  memuat: boolean;
  sorotKategori: string | null;
}) {
  const maks = skala(janji);
  const meleset = janji.filter((j) => j.ketepatanPct < targetPct).length;

  return (
    /*
     * `-mx-3 px-3` di SEKSINYA, bukan hiasan.
     *
     * Baris yang disorot melebar 12px ke kiri dan kanan supaya sorotnya tidak
     * berhenti tepat di huruf. Tanpa ruang di seksinya, pelebaran itu menjadi
     * luapan 12px di tiap baris: tidak terlihat hari ini karena wadah halaman
     * punya padding 20px yang menampungnya, tapi `scrollWidth` seksinya
     * memang lebih besar dari `clientWidth`, dan begitu ada pembungkus baru
     * yang kebetulan menggulir mendatar, luapan itu berubah jadi bilah gulir.
     * Dengan padding di sini, pelebaran barisnya mendarat di dalam seksi dan
     * seksinya sendiri mendarat di dalam padding wadah — tak satu pun tumbuh.
     * Letak dan lebar isi tidak berubah sedikit pun.
     */
    <section className="-mx-3 mt-12 px-3">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
            Janji waktu tiap kategori
          </h2>
          <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">
            Dihitung sejak laporan diterima, bukan sejak petugas berangkat.
            Urutannya menurut risiko yang ditanggung warga — bukan menurut
            beratnya pekerjaan.
          </p>
        </div>

        {/* Angka ringkas, bukan angka utama: halaman ini punya satu hal yang
            paling penting, dan itu kotak pencarian di atas. */}
        <div className="shrink-0">
          <p className="eyebrow text-muted">Ditepati {rentangHari} hari ini</p>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            {memuat ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <AngkaBergerak
                  nilai={ketepatanPct}
                  desimal={1}
                  className={cn(
                    "tabular font-mono text-[1.75rem] leading-none font-bold",
                    ketepatanPct === null
                      ? "text-muted"
                      : ketepatanPct >= targetPct
                        ? "text-success"
                        : "text-warn",
                  )}
                />
                {ketepatanPct === null ? null : (
                  <span className="font-mono text-[13px] font-semibold text-muted">
                    % · target {targetPct}%
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {memuat ? (
        <div className="mt-7 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Kepala memakai susunan grid yang sama dengan barisnya, jadi
              penggaris jam berdiri tepat di atas kolom batang. Garisnya ikut
              melebar seperti garis antarbaris — tanpa itu ia berhenti 12px
              lebih masuk daripada semua garis di bawahnya, dan tepi kirinya
              terbaca sebagai sudut yang meleset. */}
          <div
            className={cn(BARIS, "-mx-3 mt-7 border-b border-line px-3 pb-1")}
          >
            <p className="eyebrow hidden text-muted sm:block">Kategori</p>
            {/* Di layar sempit penggaris berdiri sendirian — "Kategori" dan
                "Ditepati" tidak ikut tampil — jadi ia harus menyebut dirinya
                sendiri. Sumbu tanpa nama hanya terbaca sebagai garis hias. */}
            <div>
              <p className="eyebrow mb-1.5 text-muted sm:hidden">
                Skala janji waktu
              </p>
              <Penggaris maks={maks} />
            </div>
            <p className="eyebrow hidden text-right text-muted sm:block">
              Ditepati
            </p>
          </div>

          {/* Ruang yang sama seperti di seksinya, supaya pelebaran baris di
              bawah mendarat di dalam daftar dan bukan di luarnya. */}
          <ul className="-mx-3 px-3">
            {janji.map((j) => {
              const tercapai = j.ketepatanPct >= targetPct;
              const sorot = sorotKategori === j.kategori;

              return (
                <li
                  key={j.kategori}
                  aria-current={sorot ? "true" : undefined}
                  className={cn(
                    BARIS,
                    "-mx-3 items-start border-b border-line px-3 py-4",
                    /*
                     * Sorot barisnya SATU kelas, tanpa ragam `dark:`.
                     * `brand-100` sudah ditukar nilainya di dalam `.dark`
                     * (lihat `globals.css`), jadi ia terbaca di dua tema
                     * tanpa bergantung pada bagaimana varian `dark`
                     * disambungkan ke kelas atau ke `prefers-color-scheme`.
                     * Warnanya tetap BUKAN satu-satunya penanda: lencana
                     * "kategori laporan Anda" yang mengatakannya.
                     */
                    sorot && "bg-brand-100",
                  )}
                >
                  <div className="order-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <p className="font-medium">{j.kategori}</p>
                      {sorot ? (
                        <Badge nada="brand">kategori laporan Anda</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 max-w-[52ch] text-[12.5px] leading-relaxed text-muted">
                      {j.alasan}
                    </p>
                  </div>

                  <div className="order-2">
                    <p className="tabular font-mono text-[15px] font-semibold">
                      {jamJanji(j.janjiJam)}
                    </p>
                    <BarMini
                      nilai={j.janjiJam}
                      maks={maks}
                      nada="brand"
                      className="mt-2 h-2"
                    />
                  </div>

                  {/* Di layar sempit angka ketepatan dan hitungannya berjajar
                      mendatar, bukan bertumpuk: keduanya satu pernyataan, dan
                      menumpuknya menambah dua baris di tiap kategori tanpa
                      menambah satu pun keterangan. */}
                  <div className="order-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 sm:block sm:text-right">
                    <p
                      className={cn(
                        "tabular font-mono text-[15px] font-semibold",
                        tercapai ? "text-success" : "text-warn",
                      )}
                    >
                      {angka(j.ketepatanPct, 1)}%
                    </p>
                    <p className="tabular text-[11px] text-muted sm:mt-0.5">
                      {angka(j.tepat)} dari {angka(j.masuk)} laporan
                    </p>
                    {tercapai ? null : (
                      <p className="text-[11px] font-semibold text-warn sm:mt-0.5">
                        di bawah target
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
            {meleset === 0
              ? `Seluruh kategori memenuhi target ${targetPct}% pada ${rentangHari} hari terakhir.`
              : `${angka(meleset)} dari ${angka(janji.length)} kategori masih di bawah target ${targetPct}% — angkanya tidak dikeluarkan dari daftar ini.`}
          </p>
        </>
      )}
    </section>
  );
}
