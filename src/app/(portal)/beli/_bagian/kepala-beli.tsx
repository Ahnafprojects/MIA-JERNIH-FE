import { AlertCircle } from "lucide-react";

export function KepalaBeli({ pesanGalat }: { pesanGalat: string | null }) {
  return (
    <>
      <div className="border-b border-line pb-4">
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Isi Ulang Saldo
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Beli Token Air
        </h1>
        <p className="mt-1 text-xs text-muted">
          Pilih paket liter atau isi nominal bebas. Tarif dihitung sesuai golongan pelanggan Anda.
        </p>
      </div>

      {pesanGalat ? (
        <aside
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger"
        >
          <div className="flex gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{pesanGalat}</span>
          </div>
        </aside>
      ) : null}
    </>
  );
}
