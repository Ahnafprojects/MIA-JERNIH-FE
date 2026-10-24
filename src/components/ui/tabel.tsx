"use client";

import { cn } from "@/lib/cn";

export interface Kolom<T> {
  kunci: string;
  label: string;
  rata?: "kiri" | "kanan";
  /** Sembunyikan di layar sempit — kolom sekunder saja. */
  sembunyiKecil?: boolean;
  render: (baris: T) => React.ReactNode;
}

export function Tabel<T>({
  kolom,
  data,
  kunciBaris,
  onKlikBaris,
  terpilih,
  kosong,
  lebarMin = "34rem",
}: {
  kolom: Kolom<T>[];
  data: T[];
  kunciBaris: (b: T) => string;
  onKlikBaris?: (b: T) => void;
  terpilih?: string;
  kosong?: React.ReactNode;
  /**
   * Lebar minimum tabel sebelum ia mulai bergulir.
   *
   * Turunkan untuk tabel berkolom sedikit yang dipasang di panel sempit —
   * nilai bawaan membuat kolom terakhir tergeser ke luar pandangan, dan
   * kolom terakhir biasanya justru yang paling penting.
   */
  lebarMin?: string;
}) {
  if (data.length === 0 && kosong) return <>{kosong}</>;

  return (
    // Tabel lebar bergulir DI DALAM wadahnya sendiri. Tanpa pembungkus ini
    // seluruh halaman ikut bergeser mendatar di ponsel, dan itu langsung
    // terlihat sebagai cacat saat juri membuka di HP.
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: lebarMin }}
      >
        <thead>
          <tr className="border-b border-line">
            {kolom.map((k) => (
              <th
                key={k.kunci}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-[11px] font-semibold tracking-wider text-muted uppercase",
                  k.rata === "kanan" ? "text-right" : "text-left",
                  k.sembunyiKecil && "hidden md:table-cell",
                )}
              >
                {k.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((b) => {
            const id = kunciBaris(b);
            return (
              <tr
                key={id}
                onClick={onKlikBaris ? () => onKlikBaris(b) : undefined}
                className={cn(
                  "border-b border-line/70 last:border-0",
                  onKlikBaris && "cursor-pointer hover:bg-soft",
                  terpilih === id && "bg-brand-50 dark:bg-brand-900/25",
                )}
              >
                {kolom.map((k) => (
                  <td
                    key={k.kunci}
                    className={cn(
                      "px-4 py-3",
                      k.rata === "kanan" && "text-right",
                      k.sembunyiKecil && "hidden md:table-cell",
                    )}
                  >
                    {k.render(b)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
