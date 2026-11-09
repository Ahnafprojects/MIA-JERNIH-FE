import Link from "next/link";
import { Clock, QrCode } from "lucide-react";
import { liter, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { TransaksiInvoice } from "../_tipe";

export function StrukMenunggu({
  invoiceId,
  transaksi,
}: {
  invoiceId: string;
  transaksi: TransaksiInvoice | null;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs text-center">
        <span className="font-mono text-xs font-bold text-warn uppercase tracking-wider">
          Menunggu Pembayaran
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">
          Selesaikan Pembayaran
        </h1>
        <p className="mt-1 font-mono text-xs text-muted">Invoice: {invoiceId}</p>

        <div className="my-6 border-y border-line py-4">
          <p className="text-xs text-muted">Total Pembayaran</p>
          <p className="tabular font-mono text-3xl font-black text-ink">
            {rupiah(transaksi?.jumlahRp ?? 0)}
          </p>
          <p className="mt-1 font-mono text-xs text-brand-700 dark:text-accent">
            {liter(transaksi?.volumeL ?? 0, 0)} Air Bersih
          </p>
        </div>

        {transaksi?.metode === "QRIS" ? (
          <div className="mx-auto flex flex-col items-center">
            <div className="grid size-48 place-items-center rounded-[3px] border border-line bg-white p-4 shadow-xs">
              <QrCode size={160} className="text-black" />
            </div>
            <p className="mt-3 text-xs text-muted">
              Pindai QR di atas menggunakan aplikasi pembayaran apa saja (GoPay, OVO, BCA, Livin, dll).
            </p>
          </div>
        ) : (
          <div className="rounded-[3px] border border-line bg-soft p-4">
            <p className="text-xs text-muted">Nomor Virtual Account</p>
            <p className="my-1 font-mono text-xl font-bold text-ink">
              {transaksi?.nomorVa ?? "88081234567890"}
            </p>
            <p className="text-[11px] text-muted">Bank Mandiri / BCA / BNI</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 font-mono text-xs text-muted">
          <Clock size={14} className="animate-pulse text-warn" />
          <span>Menunggu konfirmasi server... (Pengecekan tiap 5 detik)</span>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <Link href="/beranda">
            <Button varian="halus" blok type="button">
              Bayar Nanti (Kembali ke Beranda)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
