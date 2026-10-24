"use client";

/**
 * Pemeliharaan terjadwal yang AKAN datang.
 *
 * Satu-satunya bagian halaman ini yang menghadap ke depan, dan bagian yang
 * paling langsung berguna: warga yang tahu airnya mati Kamis pagi bisa
 * menampung semalam sebelumnya. Halaman status yang hanya melaporkan masa
 * lalu membuat orang datang setelah terlambat.
 *
 * Tanggalnya diberi jarak ("2 hari lagi") di samping tanggal penuhnya.
 * "Kamis, 26 Okt" memaksa pembacanya membuka kalender; jaraknya tidak.
 */

import { Badge } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { hariTanggal, jam, jarakHari } from "./waktu";
import type { Pemeliharaan } from "./tipe";

export function SeksiPemeliharaan({
  jadwal,
  memuat,
  dipilih,
}: {
  jadwal: Pemeliharaan[];
  memuat: boolean;
  dipilih: string | null;
}) {
  return (
    <section aria-labelledby="judul-pemeliharaan" className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h2
            id="judul-pemeliharaan"
            className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
          >
            Pemeliharaan terjadwal
          </h2>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Pekerjaan yang sudah direncanakan dan akan menghentikan atau
            menggilir aliran. Diumumkan lebih dulu supaya warga sempat menampung
            air.
          </p>
        </div>
        {!memuat && jadwal.length > 0 ? (
          <Badge nada="peringatan" titik>
            {angka(jadwal.length)} pekerjaan dijadwalkan
          </Badge>
        ) : null}
      </div>

      {memuat ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : jadwal.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <KeadaanKosong
            judul="Belum ada jadwal pemeliharaan"
            pesan="Tidak ada pekerjaan terencana yang akan menghentikan aliran dalam waktu dekat."
          />
        </div>
      ) : (
        <ul className="mt-6 border-t border-line">
          {jadwal.map((p) => (
            <li
              key={p.id}
              className={cn(
                "grid gap-x-6 gap-y-2.5 border-b border-line px-1 py-4",
                "sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] sm:items-baseline",
                // Baris zona terpilih disorot seperti di daftar lain, jadi
                // memilih satu zona di peta langsung menunjukkan jadwalnya.
                p.zonaId === dipilih && "bg-brand-50 dark:bg-brand-900/25",
              )}
            >
              <div className="min-w-0">
                <p className="tabular font-mono text-[13px] font-semibold">
                  {hariTanggal(p.mulai)}
                </p>
                <p className="tabular mt-0.5 font-mono text-[12.5px] text-muted">
                  {jam(p.mulai)} – {jam(p.selesai)} WIB
                </p>
              </div>

              <div className="min-w-0">
                <p className="font-display font-bold tracking-[-0.01em]">
                  {p.zonaNama}
                </p>
                <p className="mt-0.5 max-w-[56ch] text-[13.5px] leading-relaxed text-muted">
                  {p.pekerjaan}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-col sm:items-end">
                <Badge nada="info">{jarakHari(p.mulai)}</Badge>
                <span className="tabular font-mono text-[12px] whitespace-nowrap text-muted">
                  {angka(p.durasiJam)} jam · {angka(p.pelangganTerdampak)}{" "}
                  pelanggan
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
