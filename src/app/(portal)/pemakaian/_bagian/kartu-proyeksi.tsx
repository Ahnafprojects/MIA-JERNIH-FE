import { Clock } from "lucide-react";

export function KartuProyeksi({
  sisaHariProyeksi,
}: {
  sisaHariProyeksi: number | null;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-[2px] bg-brand-500/10 text-brand-600 dark:text-accent">
          <Clock size={16} />
        </span>
        <h2 className="text-sm font-bold text-ink">Perkiraan Saldo Habis</h2>
      </div>
      <div className="mt-3">
        {sisaHariProyeksi ? (
          <p className="text-base font-medium text-ink">
            Dengan pola pemakaian saat ini, saldo air Anda diperkirakan habis
            dalam{" "}
            <strong className="font-mono text-lg font-bold text-brand-700 dark:text-accent">
              ± {sisaHariProyeksi} hari
            </strong>
            .
          </p>
        ) : (
          <p className="text-sm text-muted">
            Saldo Anda 0 liter atau data riwayat pemakaian belum cukup untuk
            membentuk proyeksi.
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-muted">
          *Angka di atas adalah perkiraan berdasarkan debit rata-rata, bukan
          jaminan kepastian.
        </p>
      </div>
    </div>
  );
}
