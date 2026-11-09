import { rupiah } from "@/lib/format";

export function InputBebas({
  inputLiterBebas,
  inputRupiahBebas,
  handleUbahLiterBebas,
  handleUbahRupiahBebas,
  totalHargaRp,
}: {
  inputLiterBebas: string;
  inputRupiahBebas: string;
  handleUbahLiterBebas: (v: string) => void;
  handleUbahRupiahBebas: (v: string) => void;
  totalHargaRp: number;
}) {
  return (
    <div className="space-y-3 rounded-[3px] border border-line bg-soft p-4">
      <p className="text-xs font-medium text-ink">
        Masukkan jumlah liter atau nominal rupiah (minimal 500 liter):
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-semibold text-muted">
            Volume Air (Liter)
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              inputMode="numeric"
              value={inputLiterBebas}
              onChange={(e) => handleUbahLiterBebas(e.target.value)}
              className="tabular h-10 w-full rounded-[3px] border border-line bg-surface px-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
              L
            </span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted">
            Total Pembayaran (Rupiah)
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={inputRupiahBebas}
              onChange={(e) => handleUbahRupiahBebas(e.target.value)}
              className="tabular h-10 w-full rounded-[3px] border border-line bg-surface pl-9 pr-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted">
        Nominal dibulatkan ke rupiah terdekat: {rupiah(totalHargaRp)}.
      </p>
    </div>
  );
}
