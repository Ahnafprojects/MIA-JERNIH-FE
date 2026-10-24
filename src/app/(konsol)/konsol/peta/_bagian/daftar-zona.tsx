"use client";

/**
 * Daftar zona — sekaligus penyaring wilayah.
 *
 * Angkanya DITURUNKAN dari `pin[]` yang sama dengan yang digambar peta, bukan
 * dari medan `zona[].meter` yang ikut dikirim API. Keduanya memang sama hari
 * ini; yang dijaga di sini adalah bahwa mereka tidak bisa BERBEDA besok.
 * `zona[]` dipakai hanya untuk daftar nama dan urutannya, supaya zona yang
 * kebetulan belum punya satu pun meter berkoordinat tetap muncul sebagai
 * baris kosong alih-alih hilang diam-diam.
 */

import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { STATUS_METER, URUTAN_METER } from "./status-meter";
import type { StatusMeter } from "./tipe";

export interface RingkasZona {
  id: string;
  nama: string;
  meter: number;
  per: Record<StatusMeter, number>;
}

export function DaftarZona({
  zona,
  aktif,
  total,
  onPilih,
}: {
  zona: RingkasZona[];
  aktif: string | null;
  /** Seluruh pin tergambar — pembanding untuk baris "Semua zona". */
  total: number;
  onPilih: (id: string | null) => void;
}) {
  return (
    <section
      aria-labelledby="judul-zona"
      className="overflow-hidden rounded-card border border-line bg-surface"
    >
      <div className="border-b border-line px-5 py-4">
        <h2
          id="judul-zona"
          className="font-display text-[15px] font-bold tracking-[-0.02em]"
        >
          Zona layanan
        </h2>
        <p className="mt-0.5 text-[12.5px] text-muted">
          Pilih satu zona untuk menyorotnya di peta.
        </p>
      </div>

      <ul>
        <li className="border-b border-line/70">
          <button
            type="button"
            aria-pressed={aktif === null}
            onClick={() => onPilih(null)}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-5 py-3 text-left",
              "transition-colors hover:bg-soft motion-reduce:transition-none",
              aktif === null && "bg-brand-50 dark:bg-brand-900/30",
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "h-5 w-[3px] shrink-0",
                  aktif === null ? "bg-accent" : "bg-transparent",
                )}
              />
              <span className="text-[13.5px] font-semibold">Semua zona</span>
            </span>
            <span className="shrink-0 font-mono text-[13px] tabular">
              {angka(total)}
              <span className="ml-1 font-sans text-[11px] text-muted">
                meter
              </span>
            </span>
          </button>
        </li>

        {zona.map((z) => {
          const terpilih = aktif === z.id;
          const bermasalah = z.meter - z.per.normal;
          return (
            <li key={z.id} className="border-b border-line/70 last:border-b-0">
              <button
                type="button"
                aria-pressed={terpilih}
                onClick={() => onPilih(terpilih ? null : z.id)}
                className={cn(
                  "w-full px-5 py-3 text-left",
                  "transition-colors hover:bg-soft motion-reduce:transition-none",
                  terpilih && "bg-brand-50 dark:bg-brand-900/30",
                )}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "h-5 w-[3px] shrink-0 self-center",
                        terpilih ? "bg-accent" : "bg-line-strong",
                      )}
                    />
                    <span className="truncate text-[13.5px] font-semibold">
                      {z.nama}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[13px] tabular">
                    {angka(z.meter)}
                    <span className="ml-1 font-sans text-[11px] text-muted">
                      meter
                    </span>
                  </span>
                </span>

                {/* Campuran status zona, dengan warna yang sama persis
                    dengan pin di atas peta. */}
                <span className="mt-2 ml-[1.5rem] flex h-1.5 overflow-hidden rounded-[2px]">
                  {URUTAN_METER.map((s) => (
                    <span
                      key={s}
                      style={{
                        width: z.meter > 0 ? `${(z.per[s] / z.meter) * 100}%` : "0%",
                      }}
                      className={cn(
                        "block h-full",
                        STATUS_METER[s].garis,
                        s === "normal" && "opacity-45",
                      )}
                    />
                  ))}
                </span>

                <span className="mt-1.5 ml-[1.5rem] block font-mono text-[11px] text-muted tabular">
                  {bermasalah > 0 ? (
                    <>
                      {angka(z.per.insiden)} insiden · {angka(z.per.alarm)}{" "}
                      saldo menipis · {angka(z.per.offline)} tidak melapor
                    </>
                  ) : (
                    "Seluruh meter normal"
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/*
        Yang TIDAK ada di sini, dan kenapa.
        NRW per zona butuh angka air masuk per zona; `GET /api/admin/peta`
        hanya mengirim meter pelanggan. Menghitungnya dari pin yang ada akan
        menghasilkan angka yang terlihat seperti NRW dan bukan NRW.
      */}
      <p className="border-t border-line bg-silt/60 px-5 py-3 text-[11.5px] leading-relaxed text-muted">
        NRW per zona <span className="text-ink">—</span> belum dikirim{" "}
        <code className="font-mono text-[11px]">/api/admin/peta</code>.
        Menghitungnya dari meter pelanggan saja akan menghasilkan angka yang
        menyerupai NRW tanpa menjadi NRW.
      </p>
    </section>
  );
}
