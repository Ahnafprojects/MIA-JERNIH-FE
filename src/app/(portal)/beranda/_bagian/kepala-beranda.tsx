import { Droplet, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function KepalaBeranda({
  nama,
  nomorSeri,
  zona,
}: {
  nama: string | null | undefined;
  nomorSeri: string;
  zona: string | null | undefined;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Beranda Pelanggan
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Halo, {nama ?? "Warga"}
        </h1>
        <p className="mt-1 text-xs text-muted">
          Meter aktif:{" "}
          <strong className="font-mono text-ink">{nomorSeri}</strong> &middot;
          Zona {zona ?? "Layanan"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/beli">
          <Button varian="utama" ukuran="sm">
            <Droplet size={14} />
            Beli Token
          </Button>
        </Link>
        <Link href="/token">
          <Button varian="sekunder" ukuran="sm">
            Keypad & Tukar
          </Button>
        </Link>
        <Link href="/bantuan">
          <Button varian="bahaya" ukuran="sm" className="font-bold shadow-sm">
            <LifeBuoy size={14} />
            Laporkan Gangguan
          </Button>
        </Link>
      </div>
    </div>
  );
}
