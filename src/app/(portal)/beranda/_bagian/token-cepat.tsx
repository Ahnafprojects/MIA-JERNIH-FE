import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TokenField } from "@/components/domain/token-field";
import { Button } from "@/components/ui/button";
import type { PesanTukar } from "../_tipe";

export function TokenCepat({
  tokenInput,
  setTokenInput,
  memuatTukar,
  pesanTukar,
  onTukar,
}: {
  tokenInput: string;
  setTokenInput: (nilai: string) => void;
  memuatTukar: boolean;
  pesanTukar: PesanTukar | null;
  onTukar: () => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Isi Token Cepat
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Masukkan 4–10 digit kode token dari struk pembelian.
      </p>

      {pesanTukar ? (
        <div
          role="alert"
          className={`my-3 rounded-[3px] border p-2.5 text-xs font-medium ${
            pesanTukar.tipe === "sukses"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {pesanTukar.teks}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        <TokenField
          nilai={tokenInput}
          onChange={setTokenInput}
          onKirim={onTukar}
          nonaktif={memuatTukar}
        />

        <Button
          type="button"
          varian="utama"
          blok
          memuat={memuatTukar}
          disabled={tokenInput.length < 4}
          onClick={onTukar}
        >
          Tukarkan Token
          {!memuatTukar ? <ArrowRight size={16} /> : null}
        </Button>

        <div className="pt-2 text-center">
          <Link
            href="/token"
            className="text-xs text-brand-700 hover:underline dark:text-accent"
          >
            Buka simulasi keypad & daftar token tersimpan &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
