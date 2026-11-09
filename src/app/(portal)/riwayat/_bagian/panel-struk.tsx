import { Download, FileText, Mail } from "lucide-react";
import { liter, rupiah, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { TransaksiBaris } from "../_tipe";
import { LencanaStatus } from "./lencana-status";

export function PanelStruk({
  transaksiTerpilih,
  pesanEmail,
  onUnduhStrukPdf,
  onKirimEmailStruk,
}: {
  transaksiTerpilih: TransaksiBaris | null;
  pesanEmail: string | null;
  onUnduhStrukPdf: () => void;
  onKirimEmailStruk: () => void;
}) {
  if (!transaksiTerpilih) {
    return (
      <div className="rounded-[4px] border border-dashed border-line p-8 text-center text-xs text-muted">
        Pilih baris pada tabel untuk melihat struk pembayaran.
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-brand-600 dark:text-accent" />
          <h3 className="font-display text-sm font-bold text-ink">Struk Pembayaran</h3>
        </div>
        <LencanaStatus status={transaksiTerpilih.status} />
      </div>

      {pesanEmail ? (
        <div className="my-3 rounded-[3px] bg-success/10 p-2 text-center text-xs text-success">
          {pesanEmail}
        </div>
      ) : null}

      <div className="my-4 space-y-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted">Nomor Invoice</span>
          <span className="font-mono font-bold text-ink">{transaksiTerpilih.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">ID Meter Tujuan</span>
          <span className="font-mono text-ink">{transaksiTerpilih.meterId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Waktu Transaksi</span>
          <span className="font-mono text-muted">{tanggalJam(transaksiTerpilih.dibuatPada)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Metode Pembayaran</span>
          <span className="font-semibold text-ink">{transaksiTerpilih.metode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Volume Air</span>
          <span className="font-mono font-bold text-brand-700 dark:text-accent">
            {liter(transaksiTerpilih.volumeL, 0)}
          </span>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <span className="text-muted">Total Bayar</span>
          <span className="tabular font-mono text-base font-black text-ink">
            {rupiah(transaksiTerpilih.jumlahRp)}
          </span>
        </div>

        <div className="mt-4 rounded-[3px] border border-dashed border-line bg-soft p-3 text-center">
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            Kode Token Air (Bertopeng)
          </span>
          <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-none">
            {transaksiTerpilih.token || "55120 •••••"}
          </div>
          <p className="text-[10px] text-muted">
            Kode utuh hanya dikirim sekali saat pembayaran dan tersimpan di email Anda.
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <Button varian="utama" blok ukuran="sm" onClick={onUnduhStrukPdf}>
          <Download size={14} />
          Cetak / Unduh Struk
        </Button>
        <Button varian="sekunder" blok ukuran="sm" onClick={onKirimEmailStruk}>
          <Mail size={14} />
          Kirim ke Email Saya
        </Button>
      </div>
    </div>
  );
}
