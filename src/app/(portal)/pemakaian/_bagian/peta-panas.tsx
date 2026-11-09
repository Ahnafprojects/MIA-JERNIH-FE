import { Info } from "lucide-react";
import { HARI_LABEL, JAM_LABEL, warnaSelPetaPanas } from "./_skala-warna";
import { LegendaPanas } from "./legenda-panas";

function GridPetaPanas({ gridPetaPanas }: { gridPetaPanas: (number | null)[][] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[48rem]">
        <div className="grid grid-cols-[3.5rem_repeat(24,1fr)] gap-1 text-center font-mono text-[10px] text-muted">
          <div className="text-left font-semibold">Hari</div>
          {JAM_LABEL.map((jam) => (
            <div key={jam} className="py-1">
              {jam}
            </div>
          ))}
        </div>

        <div className="mt-1 space-y-1">
          {HARI_LABEL.map((namaHari, idxHari) => (
            <div
              key={namaHari}
              className="grid grid-cols-[3.5rem_repeat(24,1fr)] items-center gap-1"
            >
              <div className="font-mono text-xs font-semibold text-muted">
                {namaHari}
              </div>
              {JAM_LABEL.map((_, idxJam) => {
                const vol = gridPetaPanas[idxHari]?.[idxJam] ?? null;
                const tooltipTeks =
                  vol !== null
                    ? `${namaHari}, Jam ${idxJam}:00 — ${vol} Liter`
                    : `${namaHari}, Jam ${idxJam}:00 — Belum ada data`;

                return (
                  <div
                    key={idxJam}
                    title={tooltipTeks}
                    className={`aspect-square w-full rounded-[2px] border transition-transform hover:scale-110 ${warnaSelPetaPanas(
                      vol,
                    )}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PetaPanas({ gridPetaPanas }: { gridPetaPanas: (number | null)[][] }) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Peta Panas Pemakaian (7 Hari × 24 Jam)
          </h2>
          <p className="text-xs text-muted">
            Warna menunjukkan volume air per jam. Bergulir mendatar untuk
            melihat jam lengkap di ponsel.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Info size={13} />
          <span>Pembaruan tiap pergantian jam</span>
        </div>
      </div>

      <GridPetaPanas gridPetaPanas={gridPetaPanas} />

      <LegendaPanas />
    </div>
  );
}
