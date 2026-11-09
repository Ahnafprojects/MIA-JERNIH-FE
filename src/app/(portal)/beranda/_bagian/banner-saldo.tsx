import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { liter } from "@/lib/format";

/**
 * Peringatan saldo kritis.
 *
 * Ambangnya mengikuti firmware, bukan pilihan tampilan: pada 5 L meter
 * sudah membunyikan buzzer tiap 10 detik. Jadi saat banner ini muncul,
 * warga kemungkinan besar SUDAH mendengarnya di rumah — teksnya menyebut
 * bunyi itu supaya keduanya terbaca sebagai satu kejadian, bukan dua
 * peringatan yang kebetulan bersamaan.
 */
export function BannerSaldo({ saldo }: { saldo: number }) {
  return (
    <aside
      role="alert"
      className="permukaan flex flex-col gap-3 border-danger/40 bg-danger-soft p-4 text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-danger text-white shadow-[var(--kedalaman-2)] ring-1 ring-white/25 ring-inset">
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
          <span className="whitespace-nowrap">Beli Token Sekarang</span>
          <ArrowRight size={14} />
        </Button>
      </Link>
    </aside>
  );
}
