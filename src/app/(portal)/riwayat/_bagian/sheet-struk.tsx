import { Download, X } from "lucide-react";
import { liter, rupiah, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { TransaksiBaris } from "../_tipe";
import { LencanaStatus } from "./lencana-status";

export function SheetStruk({
  transaksiTerpilih,
  onTutup,
  onUnduhStrukPdf,
}: {
  transaksiTerpilih: TransaksiBaris | null;
  onTutup: () => void;
  onUnduhStrukPdf: () => void;
}) {
  if (!transaksiTerpilih) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      <button
        type="button"
        onClick={onTutup}
        className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
        aria-label="Tutup struk"
      />

      <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[8px] border-t border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <span className="font-mono text-[11px] font-bold text-brand-600 uppercase">
              Rincian Struk
            </span>
            <h3 className="font-mono text-base font-bold text-ink">
              {transaksiTerpilih.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="grid size-8 place-items-center rounded-[3px] text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Status</span>
            <span>
              <LencanaStatus status={transaksiTerpilih.status} />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Meter</span>
            <span className="font-mono text-ink">{transaksiTerpilih.meterId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Waktu</span>
            <span className="font-mono text-muted">
              {tanggalJam(transaksiTerpilih.dibuatPada)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Volume Air</span>
            <span className="font-mono font-bold text-brand-700 dark:text-accent">
              {liter(transaksiTerpilih.volumeL, 0)}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-2">
            <span className="text-muted">Total Bayar</span>
            <span className="font-mono text-base font-black text-ink">
              {rupiah(transaksiTerpilih.jumlahRp)}
            </span>
          </div>

          <div className="mt-4 rounded-[3px] border border-dashed border-line bg-soft p-3 text-center">
            <span className="font-mono text-[10px] text-muted uppercase">
              Kode Token Air (Bertopeng)
            </span>
            <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-none">
              {transaksiTerpilih.token || "55120 •••••"}
            </div>
            <p className="text-[10px] text-muted">
              Kode utuh hanya dikirim sekali saat transaksi ke email Anda.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-line pt-4">
          <Button varian="utama" blok onClick={onUnduhStrukPdf}>
            <Download size={14} />
            Cetak / Simpan Struk
          </Button>
        </div>
      </div>
    </div>
  );
}
