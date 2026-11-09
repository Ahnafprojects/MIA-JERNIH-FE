import { ArrowRight } from "lucide-react";
import { InputDigit } from "@/components/auth/input-digit";
import { Button } from "@/components/ui/button";

export function FormOtp({
  kodeDigit,
  setKodeDigit,
  memuat,
  onSubmit,
  onKembali,
}: {
  kodeDigit: string;
  setKodeDigit: (v: string) => void;
  memuat: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKembali: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <InputDigit panjang={6} nilai={kodeDigit} onChange={setKodeDigit} disabled={memuat} />

      <p className="text-[11px] text-muted text-center leading-relaxed">
        Kode keamanan 6 digit telah dikirimkan ke email Anda. Cek kotak masuk atau folder spam.
      </p>

      <Button type="submit" varian="utama" blok memuat={memuat} disabled={kodeDigit.length < 6}>
        Lanjutkan Masuk
        {!memuat ? <ArrowRight size={16} /> : null}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onKembali}
          className="text-xs text-muted hover:text-ink hover:underline"
        >
          Kembali ke formulir masuk
        </button>
      </div>
    </form>
  );
}
