import Link from "next/link";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KepalaPemakaian() {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Analisis Konsumsi
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Pemakaian & Peta Panas
        </h1>
        <p className="mt-1 text-xs text-muted text-balance">
          Jawaban transparan untuk satu pertanyaan penting: ke mana saja air Anda
          digunakan?
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/beli">
          <Button varian="utama" ukuran="sm">
            <Droplet size={14} />
            Isi Saldo
          </Button>
        </Link>
        <Link href="/meter">
          <Button varian="sekunder" ukuran="sm">
            Kontrol Meter
          </Button>
        </Link>
      </div>
    </div>
  );
}
