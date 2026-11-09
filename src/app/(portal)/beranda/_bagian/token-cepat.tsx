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
    <div className="permukaan p-5">
      <h2 className="font-display text-base font-bold text-ink">
        Isi Token Cepat
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Masukkan 4–10 digit kode token dari struk pembelian.
      </p>

      {pesanTukar ? (
        <div
          role="alert"
          className={`my-3 rounded-[10px] border p-2.5 text-xs font-medium shadow-[var(--kedalaman-1)] ${
            pesanTukar.tipe === "sukses"
              ? "border-success/40 bg-success-soft text-success"
              : "border-danger/40 bg-danger-soft text-danger"
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
          <span className="whitespace-nowrap">Tukarkan Token</span>
          {!memuatTukar ? <ArrowRight size={16} /> : null}
        </Button>

        {/*
          Aturan jeda ditulis DI DEPAN, bukan muncul sebagai pesan galat
          setelah percobaan kelima. Orang yang sudah terkunci sepuluh menit
          tidak bisa berbuat apa-apa dengan keterangan itu; orang yang sedang
          mengetik ulang kode masih bisa.
        */}
        <p className="text-[11px] leading-relaxed text-muted">
          Salah 5 kali berturut-turut, pengisian token dijeda 10 menit demi
          keamanan.
        </p>

        <div className="pt-1 text-center">
          <Link
            href="/token"
            className="text-xs text-brand-700 hover:underline dark:text-accent"
          >
            Buka simulasi keypad &amp; daftar token tersimpan &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
