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
          Pemakaian &amp; Peta Panas
        </h1>
        <p className="mt-1 text-xs text-balance text-muted">
          Jawaban transparan untuk satu pertanyaan penting: ke mana saja air
          Anda digunakan?
        </p>
      </div>

      {/*
        `shrink-0` pada wadahnya dan `whitespace-nowrap` pada tiap labelnya.

        Tanpa keduanya, "Isi Saldo" dan "Kontrol Meter" adalah bagian paling
        lentur di baris ini: begitu judul halaman memakan lebar, merekalah
        yang mengalah, dan labelnya pecah menjadi "Isi" / "Saldo" dua baris
        di dalam tombol setinggi satu baris. Tombol yang teksnya terbelah
        terbaca rusak, bukan sempit.

        Pada ponsel keduanya melebar penuh dan berbagi baris rata — lebih
        mudah disentuh daripada dua tombol kecil yang berdempetan di tepi.
      */}
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/beli" className="flex-1 sm:flex-none">
          <Button
            varian="utama"
            ukuran="sm"
            className="w-full whitespace-nowrap"
          >
            <Droplet size={14} />
            Isi Saldo
          </Button>
        </Link>
        <Link href="/meter" className="flex-1 sm:flex-none">
          <Button
            varian="sekunder"
            ukuran="sm"
            className="w-full whitespace-nowrap"
          >
            Kontrol Meter
          </Button>
        </Link>
      </div>
    </div>
  );
}
