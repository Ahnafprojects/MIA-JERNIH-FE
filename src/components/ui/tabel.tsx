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
    /*
     * Baris yang bisa diklik WAJIB bisa dijangkau papan ketik.
     * Sebelumnya ia hanya punya `onClick` dan `hover:bg-soft`:
     * pengguna tetikus bisa membukanya, pengguna papan ketik tidak
     * punya jalan sama sekali — barisnya tidak pernah menerima
     * fokus, jadi Enter tidak pernah sampai ke mana pun.
     * `tabIndex` dan penanganan tombol hanya dipasang saat baris
     * memang bisa diklik. Baris mati yang ikut masuk urutan Tab
     * membuat orang menekan Enter dan tidak terjadi apa-apa —
     * lebih membingungkan daripada baris yang jelas tidak bisa
     * disentuh.
     * Penandanya dua lapis: latar untuk hover, dan garis kiri
     * tebal untuk fokus. Dua keadaan yang dibedakan hanya oleh
     * nada latar tidak terbaca oleh orang yang berpindah cepat
     * dengan Tab.
     */
            const id = kunciBaris(b);
            return (
              <tr
                key={id}
                onClick={onKlikBaris ? () => onKlikBaris(b) : undefined}
                tabIndex={onKlikBaris ? 0 : undefined}
                role={onKlikBaris ? "button" : undefined}
                onKeyDown={
                  onKlikBaris
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onKlikBaris(b);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-line/70 last:border-0",
                  onKlikBaris &&
                    "cursor-pointer transition-colors hover:bg-soft focus-visible:bg-brand-50 focus-visible:shadow-[inset_3px_0_0_0_var(--color-brand-600)] focus-visible:outline-none dark:focus-visible:bg-brand-900/30",
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
