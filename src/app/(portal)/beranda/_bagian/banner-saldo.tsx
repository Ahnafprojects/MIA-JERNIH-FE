import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { liter } from "@/lib/format";

export function BannerSaldo({ saldo }: { saldo: number }) {
  return (
    <aside
      role="alert"
      className="flex flex-col gap-3 rounded-[3px] border border-danger/40 bg-danger/10 p-4 text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[2px] bg-danger text-white">
          <AlertTriangle size={18} />
        </span>
        <div>
          <p className="font-mono text-xs font-bold tracking-wider text-danger uppercase">
            Peringatan Saldo Kritis
          </p>
          <h2 className="text-sm font-bold text-ink">
            Saldo air tersisa {liter(saldo, 1)} — meter sudah berbunyi tiap 10
            detik.
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Katup relay akan menutup otomatis saat saldo 0 liter. Segera isi
            token untuk menjaga pasokan air.
          </p>
        </div>
      </div>
      <Link href="/beli" className="shrink-0">
        <Button varian="bahaya" ukuran="sm" className="w-full sm:w-auto">
          Beli Token Sekarang
          <ArrowRight size={14} />
        </Button>
      </Link>
    </aside>
  );
}
