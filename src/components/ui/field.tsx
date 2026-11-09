"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function TextField({
  label,
  hint,
  galat,
  kananLabel,
  depan,
  belakang,
  className,
  ...sisa
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  galat?: string | null;
  kananLabel?: React.ReactNode;
  depan?: React.ReactNode;
  belakang?: React.ReactNode;
}) {
  const id = useId();
  const idPesan = `${id}-pesan`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        {kananLabel}
      </div>
      {/*
        Cincinnya PENUH dan bernada `brand-600`, bukan `brand-500/30`.
        Terukur: `brand-500` pada 30% di atas putih hanya 1,38:1, sementara
        penanda non-teks butuh 3:1 — jadi cincin lama praktis tidak terlihat.
        `brand-600` penuh mencapai 6,08:1.

        Garis tepinya ikut berubah saat fokus, dan itu bukan hiasan: cincin
        sendirian mudah tertukar dengan bayangan pada kolom yang sudah
        cekung. Garis yang ikut menegas memastikan kolom yang sedang diketik
        tetap terbaca berbeda walaupun cincinnya terpotong wadah di luarnya.

        Hover memakai garis tepi, BUKAN cincin. Kalau keduanya memakai
        cincin, pengguna papan ketik kehilangan satu-satunya tanda posisinya.
      */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-input border bg-surface px-3",
          "transition-[border-color,box-shadow] duration-150",
          "hover:border-brand-500/60",
          "focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600",
          galat ? "border-danger" : "border-line-strong",
        )}
      >
        {depan ? <span className="text-muted">{depan}</span> : null}
        <input
          id={id}
          // Hubungkan pesan galat ke input supaya pembaca layar ikut
          // membacakannya; tanpa ini pengguna buta hanya tahu "ada yang merah".
          aria-invalid={galat ? true : undefined}
          aria-describedby={galat || hint ? idPesan : undefined}
          className={cn(
            "h-11 w-full bg-transparent text-[15px] outline-none",
            "placeholder:text-muted/70",
          )}
          {...sisa}
        />
        {belakang}
      </div>
      {galat || hint ? (
        <p
          id={idPesan}
          className={cn(
            "mt-1.5 text-[12.5px]",
            galat ? "text-danger" : "text-muted",
          )}
        >
          {galat || hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  className,
  children,
  ...sisa
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const id = useId();
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
          {label}
        </label>
      ) : null}
      {/*
        `focus-visible`, bukan `focus`. Dengan `focus:` cincinnya menyala
        tiap kali daftar ini diklik tetikus — orang membacanya sebagai cacat
        tampilan, lalu berhenti memperhatikan cincin yang sama ketika ia
        benar-benar menandai posisi papan ketik.

        `outline-none` dipertahankan karena cincin pengganti digambar lewat
        `ring`; tanpa itu outline bawaan peramban dan cincin ini tergambar
        bertumpuk sebagai dua garis sejajar.
      */}
      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-input border border-line-strong bg-surface px-3",
          "text-[15px] outline-none transition-[border-color,box-shadow] duration-150",
          "hover:border-brand-500/60",
          "focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600",
        )}
        {...sisa}
      >
        {children}
      </select>
    </div>
  );
}

export function Switch({
  aktif,
  onChange,
  label,
}: {
  aktif: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aktif}
      onClick={() => onChange(!aktif)}
      /*
       * Sakelar ini sebelumnya TIDAK punya hover maupun cincin fokus sama
       * sekali — padahal ia `<button>`. Pengguna papan ketik bisa men-Tab ke
       * sini dan menekan spasi tanpa pernah tahu bahwa fokusnya ada di sini,
       * dan sakelar yang terbalik tanpa disadari adalah jenis kesalahan yang
       * baru ketahuan jauh belakangan.
       *
       * Cincinnya dipasang di tombolnya, bukan di alurnya, supaya ia
       * melingkupi alur BESERTA labelnya — label itu bagian dari target
       * klik, jadi ia juga bagian dari yang sedang difokus.
       */
      className="cincin-fokus group inline-flex items-center gap-2.5 rounded-[8px] text-left text-sm"
    >
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          /* Hover menggelapkan alurnya — satu-satunya petunjuk bahwa benda
             ini bisa ditekan, karena bentuk kapsulnya sendiri sudah dipakai
             lencana di tempat lain. */
          aktif
            ? "bg-brand-600 group-hover:bg-brand-700"
            : "bg-line-strong group-hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-[left]",
            aktif ? "left-[1.125rem]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
