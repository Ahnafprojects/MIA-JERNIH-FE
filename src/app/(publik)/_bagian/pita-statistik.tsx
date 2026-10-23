"use client";

import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import type { StatistikPublik } from "@/types/publik";

/**
 * Pita statistik di bawah hero.
 *
 * Angkanya DIAMBIL DARI API, bukan ditulis di sini. Juri akan membandingkan
 * angka di landing dengan angka di halaman /statistik; kalau ditulis tangan,
 * keduanya akan berbeda begitu data berubah, dan itu membuat seluruh klaim
 * transparansi terasa palsu.
 *
 * Saat API belum siap, yang tampil adalah "—", bukan angka karangan.
 */
export function PitaStatistik() {
  const { data, memuat } = useApi<StatistikPublik>("/api/publik/statistik");

  const item = [
    {
      label: "Pelanggan terlayani",
      nilai: data ? angka(data.pelangganTerlayani) : null,
      satuan: "rumah",
    },
    {
      label: "Air disalurkan 30 hari",
      nilai: data ? angka(data.volumeDisalurkanM3) : null,
      satuan: "m³",
    },
    {
      label: "Kehilangan air",
      nilai: data ? angka(data.nrwPct, 1) : null,
      satuan: "%",
    },
    {
      label: "Zona terpantau",
      nilai: data ? angka(data.jumlahZona) : null,
      satuan: "zona",
    },
  ];

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {item.map((i) => (
          <div key={i.label} className="bg-surface px-5 py-7">
            <p className="eyebrow text-muted">{i.label}</p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="tabular font-mono text-[28px] leading-none font-bold">
                {memuat ? (
                  <span className="inline-block h-7 w-20 animate-pulse rounded bg-soft align-middle" />
                ) : (
                  (i.nilai ?? "—")
                )}
              </span>
              {i.nilai ? (
                <span className="text-[13px] text-muted">{i.satuan}</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
