import { Clock } from "lucide-react";
import { liter } from "@/lib/format";
import type { JamBoros } from "../_tipe";

/**
 * Satu kalimat yang menjawab apa yang peta panas butuh 168 sel untuk
 * menyampaikannya: jam berapa rumah ini rutin paling boros.
 */
export function KartuJamBoros({
  jamPalingBoros,
}: {
  jamPalingBoros: JamBoros | null;
}) {
  return (
    <div className="permukaan p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
          <Clock size={16} />
        </span>
        <h2 className="text-sm font-bold text-ink">Jam Paling Boros</h2>
      </div>

      {jamPalingBoros ? (
        <>
          <p className="tabular mt-4 font-mono text-4xl leading-none font-black text-ink">
            {String(jamPalingBoros.jam).padStart(2, "0")}
            <span className="text-xl text-muted">
              :00–{String((jamPalingBoros.jam + 1) % 24).padStart(2, "0")}:00
            </span>
          </p>
          <p className="mt-3 text-sm text-muted">
            Rata-rata{" "}
            <strong className="font-mono text-ink">
              {liter(jamPalingBoros.rataL, 1)}
            </strong>{" "}
            pada jam itu — jam tersibuk air di rumah Anda.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {jamPalingBoros.jam < 5
              ? "Pemakaian terbesar jatuh pada dini hari, saat rumah biasanya tidak memakai air. Periksa kemungkinan rembesan kloset atau sambungan bocor."
              : "Menggeser sebagian pemakaian keluar dari jam ini meratakan tekanan air di jaringan zona Anda."}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Belum ada rekaman per jam dari meter, jadi jam tersibuknya belum bisa
          ditentukan.
        </p>
      )}
    </div>
  );
}
