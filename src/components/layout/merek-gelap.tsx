import { Droplets } from "lucide-react";

/**
 * Tanda Jernih untuk panel berlatar gelap.
 *
 * `MerekJernih` mewarnai dirinya dengan tinta halaman terang, jadi di atas
 * panel `bg-console` ia nyaris tidak terbaca. Varian ini memakai `accent`
 * dan `on-console` — dua token yang memang disiapkan untuk latar itu.
 *
 * Ditulis sebagai komponen tersendiri, bukan prop tambahan pada
 * `MerekJernih`, karena bentuknya pun berbeda: tetes di dalam lingkaran
 * lembut, bukan tiga tetes bertingkat. Pada panel gelap tiga tetes
 * beropasitas 0,95 / 0,6 / 0,3 kehilangan dua tetes terakhirnya — yang
 * paling redup larut ke latar dan yang tersisa terbaca sebagai noda, bukan
 * sebagai tanda.
 *
 * Menerima `sub` supaya satu komponen melayani portal warga maupun halaman
 * publik tanpa salah satunya menyalin ulang.
 */
export function MerekGelap({ sub }: { sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
        <Droplets size={17} aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[18px] font-semibold tracking-[-0.02em]">
          Jernih
        </span>
        {sub ? (
          <span className="eyebrow block text-[9.5px] whitespace-nowrap text-on-console-muted">
            {sub}
          </span>
        ) : null}
      </span>
    </span>
  );
}
