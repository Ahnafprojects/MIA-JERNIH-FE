import { liter, rupiah } from "@/lib/format";
import type { ModePilihan, PaketOpsi } from "../_tipe";
import { InputBebas } from "./input-bebas";

export function PilihanNominal({
  golonganNama,
  tarifPerLiter,
  daftarPaket,
  modePilihan,
  setModePilihan,
  literTerpilih,
  setLiterTerpilih,
  inputLiterBebas,
  inputRupiahBebas,
  handleUbahLiterBebas,
  handleUbahRupiahBebas,
  totalHargaRp,
}: {
  golonganNama: string;
  tarifPerLiter: number;
  daftarPaket: PaketOpsi[];
  modePilihan: ModePilihan;
  setModePilihan: (m: ModePilihan) => void;
  literTerpilih: number;
  setLiterTerpilih: (v: number) => void;
  inputLiterBebas: string;
  inputRupiahBebas: string;
  handleUbahLiterBebas: (v: string) => void;
  handleUbahRupiahBebas: (v: string) => void;
  totalHargaRp: number;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-ink">Nominal Air</h2>
          <p className="text-[11px] text-muted">
            Golongan: <strong className="text-ink">{golonganNama}</strong> &middot; Tarif {rupiah(tarifPerLiter, 1)}/L
          </p>
        </div>

        <div className="flex rounded-[3px] border border-line bg-soft p-0.5">
          <button
            type="button"
            onClick={() => setModePilihan("paket")}
            className={`rounded-[2px] px-2.5 py-1 text-xs font-semibold ${
              modePilihan === "paket" ? "bg-surface text-ink shadow-xs" : "text-muted"
            }`}
          >
            Paket Pilihan
          </button>
          <button
            type="button"
            onClick={() => setModePilihan("bebas")}
            className={`rounded-[2px] px-2.5 py-1 text-xs font-semibold ${
              modePilihan === "bebas" ? "bg-surface text-ink shadow-xs" : "text-muted"
            }`}
          >
            Nominal Bebas
          </button>
        </div>
      </div>

      {modePilihan === "paket" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {daftarPaket.map((p) => {
            const aktif = literTerpilih === p.volumeL;
            return (
              <button
                key={p.volumeL}
                type="button"
                onClick={() => setLiterTerpilih(p.volumeL)}
                className={`flex flex-col items-start rounded-[3px] border p-3 text-left transition-colors ${
                  aktif
                    ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                    : "border-line bg-surface hover:border-line-strong hover:bg-soft"
                }`}
              >
                <span className="font-mono text-sm font-bold text-ink">
                  {liter(p.volumeL, 0)}
                </span>
                <span className="font-mono text-xs text-brand-700 dark:text-accent font-semibold">
                  {rupiah(p.hargaRp)}
                </span>
                <span className="mt-1 text-[10px] text-muted">
                  {(p.volumeL / 1000).toFixed(1)} m³
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <InputBebas
          inputLiterBebas={inputLiterBebas}
          inputRupiahBebas={inputRupiahBebas}
          handleUbahLiterBebas={handleUbahLiterBebas}
          handleUbahRupiahBebas={handleUbahRupiahBebas}
          totalHargaRp={totalHargaRp}
        />
      )}
    </div>
  );
}
