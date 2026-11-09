import Link from "next/link";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KepalaRiwayat() {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Catatan Publik Warga
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Riwayat Transaksi
        </h1>
        <p className="mt-1 text-xs text-muted text-balance">
          Daftar lengkap pembelian dan penukaran saldo air. Setiap transaksi tersimpan idempoten dan dapat dicocokkan dengan audit log.
        </p>
      </div>

      <Link href="/beli">
        <Button varian="utama" ukuran="sm">
          <Droplet size={14} />
          Beli Token Baru
        </Button>
      </Link>
    </div>
  );
}
