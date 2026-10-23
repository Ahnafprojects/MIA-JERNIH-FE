import { cn } from "@/lib/cn";

/**
 * Tanda Jernih: tiga tetes/gelombang yang makin jernih ke kanan — dari pekat
 * ke bening. Digambar sebagai SVG, bukan berkas gambar, supaya ikut berganti
 * warna mengikuti tema tanpa menyiapkan dua berkas.
 */
export function LogoJernih({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d="M8 4c3.2 3.6 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 1.8-5.4 5-9Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M20 10c2.8 3.2 4.4 5.8 4.4 8a4.4 4.4 0 0 1-8.8 0c0-2.2 1.6-4.8 4.4-8Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M13 21c2.2 2.5 3.4 4.5 3.4 6.2a3.4 3.4 0 0 1-6.8 0c0-1.7 1.2-3.7 3.4-6.2Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

export function MerekJernih({
  sub,
  className,
}: {
  sub?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoJernih size={30} className="text-brand-500" />
      <span className="leading-tight">
        <span className="block font-display text-[19px] font-semibold tracking-[-0.02em]">
          Jernih
        </span>
        {sub ? (
          <span className="eyebrow block text-[9.5px] opacity-70">{sub}</span>
        ) : null}
      </span>
    </span>
  );
}
