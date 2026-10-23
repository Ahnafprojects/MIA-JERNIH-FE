import { cn } from "@/lib/cn";

/**
 * Layar LCD 16×2 meter air.
 *
 * Teks di sini meniru layar perangkat, BUKAN teks aplikasi. Karena itu
 * angkanya memakai titik desimal (`S=4820.50L`) sementara seluruh UI lain
 * memakai koma. Jangan "diperbaiki" agar seragam — justru bedanya itu yang
 * membuat tampilannya terbaca sebagai layar mesin.
 */
export function LcdDisplay({
  baris1,
  baris2,
  label,
  className,
}: {
  baris1: string;
  baris2?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-block", className)}>
      <div className="lcd-screen rounded-lg border-4 border-neutral-700 px-3 py-2 font-mono text-[13px] leading-[1.45] tracking-tight">
        {/* 16 karakter per baris, persis seperti layar aslinya. */}
        <div className="whitespace-pre">{baris1.padEnd(16).slice(0, 16)}</div>
        <div className="whitespace-pre">
          {(baris2 ?? "").padEnd(16).slice(0, 16)}
        </div>
      </div>
      {label ? (
        <p className="mt-1.5 text-center text-[11px] text-muted">{label}</p>
      ) : null}
    </div>
  );
}
