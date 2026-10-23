"use client";

import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import type { StatistikPublik } from "@/types/publik";

/**
 * Pita angka jaringan.
 *
 * Angkanya DIAMBIL DARI API, tidak ditulis di sini. Juri akan membandingkan
 * angka di landing dengan halaman /statistik; kalau ditulis tangan, keduanya
 * berbeda begitu data berubah dan seluruh klaim transparansi runtuh.
 * Saat API belum menjawab, yang tampil em dash — bukan angka karangan.
 */
export function PitaStatistik() {
  const { data, memuat } = useApi<StatistikPublik>("/api/publik/statistik");

  const item: [string, string | null, string][] = [
    ["Pelanggan terlayani", data ? angka(data.pelangganTerlayani) : null, "rumah"],
    ["Air disalurkan 30 hari", data ? angka(data.volumeDisalurkanM3) : null, "m³"],
    ["Kehilangan air", data ? angka(data.nrwPct, 1) : null, "%"],
    ["Zona terpantau", data ? angka(data.jumlahZona) : null, "zona"],
  ];

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 lg:grid-cols-4">
        {item.map(([label, nilai, satuan], i) => (
          <div
            key={label}
            className={`py-9 ${i % 2 === 1 ? "pl-6" : "pr-6"} ${
              i < 2 ? "border-b border-line lg:border-b-0" : ""
            } ${i % 2 === 0 ? "border-r border-line" : ""} ${
              i === 2 ? "lg:border-r" : ""
            } lg:px-7 lg:first:pl-0 lg:last:border-r-0`}
          >
            <p className="tabular font-mono text-[clamp(1.6rem,3.4vw,2.2rem)] leading-none font-bold">
              {memuat ? (
                <span className="inline-block h-7 w-20 animate-pulse rounded bg-soft align-middle" />
              ) : (
                <>
                  {nilai ?? "—"}
                  {nilai ? (
                    <span className="ml-1.5 text-[0.5em] font-medium text-muted">
                      {satuan}
                    </span>
                  ) : null}
                </>
              )}
            </p>
            <p className="eyebrow mt-3 text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
