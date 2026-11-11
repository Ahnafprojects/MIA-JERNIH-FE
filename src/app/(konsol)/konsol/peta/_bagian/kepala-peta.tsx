import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { angka } from "@/lib/format";
import type { PetaKonsol } from "./tipe";

interface Props {
  data: PetaKonsol | null;
  jumlahZona: number;
  jumlahPin: number;
  menyegarkan: boolean;
  onMuatUlang: () => void;
}

export function KepalaPeta({ data, jumlahZona, jumlahPin, menyegarkan, onMuatUlang }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="eyebrow text-brand-600">Sebaran jaringan</p>
        <h2 className="mt-1.5 font-display text-[clamp(1.35rem,3.2vw,1.85rem)] leading-[1.12] font-extrabold tracking-[-0.02em]">
          Seluruh meter pada satu bidang yang sama
        </h2>
        {data ? (
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            <span className="font-mono text-ink tabular">{angka(data.totalMeter)}</span>{" "}
            meter terdaftar di {angka(jumlahZona)} zona layanan.{" "}
            <span className="font-mono text-ink tabular">{angka(jumlahPin)}</span>{" "}
            di antaranya punya koordinat dan digambar di peta;{" "}
            <span className="font-mono text-ink tabular">{angka(data.tanpaKoordinat)}</span>{" "}
            belum dipetakan dan tetap ikut dihitung.
          </p>
        ) : (
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            Sebaran meter pelanggan, diwarnai menurut status yang dilaporkan
            perangkat.
          </p>
        )}
      </div>

      <Button
        varian="sekunder"
        onClick={onMuatUlang}
        memuat={menyegarkan}
        aria-label="Muat ulang data peta"
      >
        <RefreshCw size={15} aria-hidden />
        Perbarui
      </Button>
    </header>
  );
}
