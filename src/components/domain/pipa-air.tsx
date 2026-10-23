"use client";

import { angka } from "@/lib/format";
import { AngkaBergerak } from "./angka-bergerak";

/**
 * Pipa air — satu ruas yang dibagi menjadi air yang sampai dan air yang
 * hilang.
 *
 * Inilah cerita halaman statistik. Dua batang berdampingan memaksa pembaca
 * mengurangi sendiri di kepalanya; di sini SELISIHNYA yang digambar.
 *
 * Ruas yang hilang memakai arsir diagonal berwarna `warn` yang digambar
 * langsung di sini, bukan latar `warn-soft`. Di tema gelap `warn-soft` adalah
 * coklat pekat yang terbaca sebagai lumpur, bukan sebagai air yang hilang —
 * arsir di atas latar bening membawa arti "tidak terhitung" jauh lebih jelas
 * dan bekerja sama baiknya di kedua tema.
 *
 * Lebar kedua ruas dianimasikan: saat rentang waktu diganti, perpindahan
 * batasnya yang memberi tahu angkanya berubah.
 */
export function PipaAir({
  disalurkan,
  tercatat,
  satuan = "m³",
  keterangan,
}: {
  disalurkan: number | null;
  tercatat: number | null;
  satuan?: string;
  keterangan?: React.ReactNode;
}) {
  const sah = (v: number | null): v is number =>
    typeof v === "number" && Number.isFinite(v);

  /*
   * Tercatat yang melebihi yang disalurkan mustahil secara fisik. Kalau itu
   * terjadi, yang benar adalah menolak menggambarnya — bukan membalik
   * batangnya dan berpura-pura semuanya masuk akal.
   */
  const utuh =
    sah(disalurkan) &&
    sah(tercatat) &&
    disalurkan > 0 &&
    tercatat >= 0 &&
    tercatat <= disalurkan;

  const hilang = utuh ? disalurkan - tercatat : null;
  const pctTercatat = utuh ? (tercatat / disalurkan) * 100 : 0;
  const pctHilang = utuh ? 100 - pctTercatat : 0;

  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="eyebrow text-muted">Air disalurkan</span>
        <span className="tabular font-mono text-[15px] font-semibold">
          <AngkaBergerak nilai={disalurkan} />
          {sah(disalurkan) ? ` ${satuan}` : null}
        </span>
      </figcaption>

      <div
        className="motion-aware mt-3 flex h-16 w-full overflow-hidden rounded-[0.5rem] border border-line bg-canvas sm:h-[4.5rem]"
        role="img"
        aria-label={
          utuh
            ? `Dari ${angka(disalurkan)} ${satuan} air yang disalurkan, ${angka(tercatat)} ${satuan} tercatat di meter pelanggan dan ${angka(hilang ?? 0)} ${satuan} hilang di perjalanan.`
            : "Perbandingan air disalurkan dan tercatat belum bisa ditampilkan."
        }
      >
        {utuh ? (
          <>
            <div
              className="flex items-center justify-end transition-[width] duration-700 ease-out"
              style={{
                width: `${pctTercatat}%`,
                backgroundImage:
                  "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-600))",
              }}
            >
              {/* Label hanya ditulis DI DALAM ruas kalau benar-benar muat.
                  Teks yang terpotong lebih buruk daripada tanpa teks. */}
              {pctTercatat >= 26 ? (
                <span className="tabular px-3 font-mono text-[13px] font-semibold text-white">
                  <AngkaBergerak nilai={pctTercatat} desimal={1} />%
                </span>
              ) : null}
            </div>
            <div
              className="flex items-center border-l-2 border-dashed border-warn transition-[width] duration-700 ease-out"
              style={{
                width: `${pctHilang}%`,
                // Arsir diagonal warn di atas latar bening — "tidak terhitung",
                // bukan blok warna pekat yang terbaca sebagai zat lain.
                backgroundImage:
                  "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-warn) 55%, transparent) 0 2px, transparent 2px 9px)",
              }}
            >
              {pctHilang >= 26 ? (
                <span className="tabular px-3 font-mono text-[13px] font-semibold text-warn">
                  <AngkaBergerak nilai={pctHilang} desimal={1} />%
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="takar w-full opacity-60" />
        )}
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div className="border-t-2 border-brand-500 pt-3">
          <p className="eyebrow text-muted">Sampai ke meter pelanggan</p>
          <p className="tabular mt-1.5 font-mono text-[1.15rem] leading-none font-bold">
            <AngkaBergerak nilai={tercatat} />
            {sah(tercatat) ? ` ${satuan}` : null}
          </p>
        </div>
        <div className="border-t-2 border-warn pt-3">
          <p className="eyebrow text-warn">Hilang di perjalanan</p>
          <p className="tabular mt-1.5 font-mono text-[1.15rem] leading-none font-bold text-warn">
            <AngkaBergerak nilai={hilang} />
            {sah(hilang) ? ` ${satuan}` : null}
          </p>
        </div>
      </div>

      {keterangan ? (
        <p className="mt-5 max-w-[62ch] text-[13px] leading-relaxed text-muted">
          {keterangan}
        </p>
      ) : null}
    </figure>
  );
}
