"use client";

import { useEffect, useState } from "react";
import { angka } from "@/lib/format";

const MAKS_L = 6000;

/**
 * Kolom air — tabung ukur yang terisi setinggi saldo meter.
 *
 * Ini thesis halaman, bukan hiasan. Produk ini menjual satu hal: warga bisa
 * MELIHAT sisa airnya, bukan menunggu tagihan. Kolom ini memperlihatkan
 * persis itu — angka yang sama dengan yang dilihat petugas, bergerak turun
 * di depan mata.
 *
 * Garis takar di sisinya diambil dari gelas ukur, benda paling biasa di
 * dunia air. Permukaannya bergoyang pelan; meniskusnya melengkung seperti
 * air sungguhan di tabung sempit.
 */
export function KolomAir() {
  const [saldoL, setSaldoL] = useState(4820.5);
  const [debit, setDebit] = useState(2.4);

  // Air berkurang di depan mata — satu detik sekali, sebesar debitnya.
  useEffect(() => {
    const jam = setInterval(() => {
      setSaldoL((s) => {
        const berikut = s - debit / 60;
        return berikut < 120 ? 4820.5 : berikut;
      });
      setDebit((d) => {
        const n = d + (Math.random() - 0.5) * 0.6;
        return Math.min(4.2, Math.max(0.8, n));
      });
    }, 1000);
    return () => clearInterval(jam);
  }, [debit]);

  const persen = Math.min(100, (saldoL / MAKS_L) * 100);
  const takar = [6000, 4500, 3000, 1500, 0];

  return (
    <figure className="motion-aware relative mx-auto flex items-end gap-5">
      {/* Skala liter di sisi kiri tabung. */}
      <div className="relative h-[clamp(18rem,42vw,25rem)] w-14 shrink-0">
        {takar.map((t) => (
          <div
            key={t}
            className="absolute right-0 flex w-full items-center justify-end gap-1.5"
            style={{ bottom: `${(t / MAKS_L) * 100}%`, transform: "translateY(50%)" }}
          >
            <span className="tabular font-mono text-[10px] text-muted">
              {angka(t)}
            </span>
            <span aria-hidden className="h-px w-2.5 bg-line-strong" />
          </div>
        ))}
      </div>

      {/* Tabung. */}
      <div className="relative h-[clamp(18rem,42vw,25rem)] w-[clamp(9rem,22vw,12.5rem)] overflow-hidden rounded-t-sm rounded-b-[1.75rem] border-2 border-b-[6px] border-line-strong bg-surface">
        {/* Garis takar halus di dalam dinding tabung. */}
        <div
          aria-hidden
          className="takar-tegak absolute inset-0 opacity-45"
        />

        {/* Badan air. */}
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-1000 ease-linear"
          style={{
            height: `${persen}%`,
            background:
              "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-600))",
          }}
        >
          {/* Meniskus: permukaan air melengkung ke atas di tabung sempit. */}
          <div
            aria-hidden
            className="absolute -top-2.5 left-0 h-5 w-[150%] rounded-[100%] bg-brand-300/80"
            style={{ animation: "riak 4.5s ease-in-out infinite" }}
          />
          {/* Pantulan cahaya di dinding dalam. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-[12%] w-[6%] rounded-full bg-white/25"
          />
        </div>

        {/* Angka dibaca MENEMBUS air — persis arti nama produknya. */}
        <figcaption className="absolute inset-x-0 bottom-6 px-4 text-center">
          <p
            className="tabular font-mono text-[clamp(1.9rem,6vw,2.6rem)] leading-none font-bold text-white"
            style={{ textShadow: "0 1px 12px rgba(8,34,44,.45)" }}
          >
            {angka(saldoL, 1)}
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-widest text-white/85 uppercase">
            liter tersisa
          </p>
        </figcaption>
      </div>

      {/* Debit — ditempel di sisi kanan seperti label alat ukur. */}
      <div className="absolute -right-1 top-2 flex items-center gap-2 rounded-full border border-line bg-surface/90 py-1 pr-3 pl-2 backdrop-blur sm:-right-6">
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-accent"
          style={{ animation: "denyut 1.8s ease-in-out infinite" }}
        />
        <span className="tabular font-mono text-[12px] font-semibold">
          {angka(debit, 1)}
        </span>
        <span className="text-[11px] text-muted">L/mnt</span>
      </div>
    </figure>
  );
}
