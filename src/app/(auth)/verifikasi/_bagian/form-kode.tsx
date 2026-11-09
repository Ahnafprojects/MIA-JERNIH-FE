import { ArrowRight } from "lucide-react";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";

export function FormKode({
  kode,
  setKode,
  memuat,
  onSubmit,
}: {
  kode: string;
  setKode: (v: string) => void;
  memuat: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-medium text-ink">
          Kode Verifikasi 6 Digit
        </label>
        <InputDigit panjang={6} nilai={kode} onChange={setKode} disabled={memuat} />
      </div>

      <Button type="submit" varian="utama" blok memuat={memuat} disabled={kode.length < 6}>
        Verifikasi & Lanjut
        {!memuat ? <ArrowRight size={16} /> : null}
      </Button>
    </form>
  );
}
