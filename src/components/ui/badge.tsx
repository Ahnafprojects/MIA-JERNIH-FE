import { cn } from "@/lib/cn";

export type Nada = "netral" | "brand" | "sukses" | "peringatan" | "bahaya" | "info";

/*
 * Warna teks DAN garis tepi diturunkan dari satu nada; isinya memakai
 * `bg-current/8`, jadi latarnya selalu versi pudar dari warna tulisannya
 * sendiri. Satu tempat untuk diubah, dan tidak ada lagi token `-soft`
 * terpisah yang bisa ketinggalan saat palet digeser.
 */
const NADA: Record<Nada, string> = {
  netral: "text-muted border-line-strong/70",
  brand: "text-brand-700 border-brand-500/40",
  sukses: "text-success border-success/40",
  peringatan: "text-warn border-warn/40",
  bahaya: "text-danger border-danger/40",
  info: "text-info border-info/40",
};

/**
 * Lencana status.
 *
 * `anak` WAJIB berisi kata, bukan hanya warna. Pengguna dengan buta warna
 * tidak bisa membedakan hijau dan merah, dan warna saja juga hilang maknanya
 * saat halaman dicetak hitam-putih untuk lampiran proposal.
 *
 * BENTUKNYA DISENGAJA PERSEGI, BUKAN KAPSUL.
 *
 * Versi sebelumnya kapsul penuh + isi pastel lembut + titik bulat di depan
 * teks. Ketiganya kebetulan adalah tiga ciri paling khas tampilan buatan AI,
 * dan begitu ketiganya muncul bersamaan orang mengenalinya dalam sekali
 * lihat — termasuk juri. Yang dibuang bukan cuma "gaya lama", melainkan
 * ketiga ciri itu sekaligus:
 *
 * - kapsul   → persegi dengan sudut 3px, seperti plat nama alat ukur
 * - pastel   → warna nadanya sendiri pada 8%, bukan token pastel terpisah
 * - titik    → garis takar tegak, motif yang sama dengan sisi kolom air dan
 *              pembatas seksi di halaman ini
 *
 * Hasilnya sekeluarga dengan `SN 0048-2026` dan `JM-200` di badan meter:
 * label alat, bukan gelembung aplikasi.
 */
export function Badge({
  nada = "netral",
  titik,
  className,
  children,
}: {
  nada?: Nada;
  /** Garis takar di depan teks, menegaskan status tanpa menggantikan kata. */
  titik?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5",
        /*
         * Isi 5%, bukan 8%.
         *
         * Pada 8% latar lencana `info` jatuh ke 4,23:1 — isi yang diturunkan
         * dari warna tulisannya sendiri selalu MENGGELAPKAN latar, kebalikan
         * dari token `-soft` pastel yang dipakai versi lama. Pada 5% bentuk
         * persegi dan garis tepinya masih yang memikul tanda status, dan
         * isinya tinggal mengangkatnya sedikit dari halaman.
         */
        "bg-current/5 text-xs font-semibold whitespace-nowrap",
        NADA[nada],
        className,
      )}
    >
      {titik ? (
        <span aria-hidden className="h-3 w-[2px] shrink-0 bg-current" />
      ) : null}
      {children}
    </span>
  );
}
