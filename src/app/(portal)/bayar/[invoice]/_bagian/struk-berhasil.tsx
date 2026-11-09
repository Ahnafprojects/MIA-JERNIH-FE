import Link from "next/link";
import { CheckCircle2, Copy, ArrowRight, ShieldAlert } from "lucide-react";
import { token, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { TransaksiInvoice } from "../_tipe";

export function StrukBerhasil({
  invoiceId,
  transaksi,
  kodeToken,
  sudahSalin,
  onSalinKode,
}: {
  invoiceId: string;
  transaksi: TransaksiInvoice | null;
  kodeToken: string | null;
  sudahSalin: boolean;
  onSalinKode: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[4px] border border-success/40 bg-surface p-6 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={32} />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-bold tracking-wider text-success uppercase">
          Pembayaran Berhasil
        </span>
        <h1 className="font-display text-2xl font-bold text-ink">
          Token Air Diterbitkan
        </h1>
        <p className="mt-1 text-xs text-muted">
          Invoice #{invoiceId} &middot; {tanggalJam(transaksi?.dibayarPada || new Date())}
        </p>

        <div className="my-6 rounded-[3px] border-2 border-dashed border-brand-500/50 bg-brand-500/5 p-5">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
            Kode Token Meter (Sekali Pakai)
          </span>
          <div className="my-2 select-all font-mono text-2xl font-black tracking-[0.2em] text-ink sm:text-3xl">
            {kodeToken ? token(kodeToken) : "55120 •••••"}
          </div>

          {kodeToken ? (
            <Button type="button" varian="sekunder" ukuran="sm" onClick={onSalinKode}>
              <Copy size={14} />
              <span>{sudahSalin ? "Kode Tersalin!" : "Salin Kode Token"}</span>
            </Button>
          ) : null}

          <p className="mt-3 text-[11px] text-muted">
            Catat kodenya sekarang — kode utuh hanya ditampilkan sekali di layar ini dan dikirim ke email terdaftar Anda.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-[2px] border border-warn/30 bg-warn/10 p-3 text-left text-xs leading-relaxed text-ink">
          <ShieldAlert size={16} className="shrink-0 text-warn mt-0.5" />
          <span>
            <strong>Perhatian:</strong> Pembelian ini tidak otomatis menambah saldo fisik meter Anda.
            Token baru diterbitkan; masukkan kode di atas melalui keypad meter air atau halaman <strong>Isi Token</strong> untuk mengaktifkan pasokan liter air.
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/token" className="flex-1">
            <Button varian="utama" blok>
              Tukarkan ke Meter Sekarang
              <ArrowRight size={14} />
            </Button>
          </Link>
          <Link href="/beranda" className="flex-1">
            <Button varian="halus" blok type="button">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
