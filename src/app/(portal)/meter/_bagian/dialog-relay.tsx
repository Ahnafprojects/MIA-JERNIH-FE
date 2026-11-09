import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import type { ModalRelay } from "../_tipe";

export function DialogRelay({
  modalRelay,
  alasanRelay,
  setAlasanRelay,
  memuatAksi,
  onTutup,
  onEksekusi,
}: {
  modalRelay: ModalRelay;
  alasanRelay: string;
  setAlasanRelay: (v: string) => void;
  memuatAksi: boolean;
  onTutup: () => void;
  onEksekusi: () => void;
}) {
  if (!modalRelay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onTutup}
        className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
        aria-label="Tutup dialog"
      />

      <div className="relative z-10 w-full max-w-md rounded-[6px] border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <ShieldAlert size={18} className="text-warn" />
            <span>Konfirmasi {modalRelay === "tutup" ? "Tutup" : "Buka"} Katup</span>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="grid size-8 place-items-center rounded-[3px] text-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Tindakan pengubahan relay adalah aksi kritis yang mempengaruhi suplai air fisik.
          Perintah ini akan dikirim ke firmware meter dan dicatat di <strong className="text-ink">Audit Log</strong> PDAM.
        </p>

        <div className="my-4">
          <label className="mb-1 block text-xs font-semibold text-ink">
            Alasan Pengubahan (Wajib):
          </label>
          <input
            type="text"
            placeholder="Contoh: Perbaikan keran wastafel bocor"
            value={alasanRelay}
            onChange={(e) => setAlasanRelay(e.target.value)}
            className="h-10 w-full rounded-[3px] border border-line bg-canvas px-3 text-xs text-ink outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-3 pt-2">
          <SlideToConfirm
            onKonfirmasi={onEksekusi}
            memuat={memuatAksi}
            disabled={alasanRelay.trim().length < 3 || memuatAksi}
            teks={`Geser untuk ${modalRelay === "tutup" ? "tutup" : "buka"} relay`}
            teksBerhasil="Perintah Terkirim"
          />
          <Button varian="halus" blok ukuran="sm" onClick={onTutup}>
            Batalkan
          </Button>
        </div>
      </div>
    </div>
  );
}
