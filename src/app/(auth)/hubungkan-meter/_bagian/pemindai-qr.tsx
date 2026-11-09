import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IzinKamera } from "../_tipe";

export function PemindaiQr({
  izinKamera,
  onMintaIzin,
  onSimulasi,
}: {
  izinKamera: IzinKamera;
  onMintaIzin: () => void;
  onSimulasi: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      {izinKamera === "belum" || izinKamera === "minta" ? (
        <div className="rounded-[3px] border border-dashed border-line p-6">
          <QrCode size={36} className="mx-auto text-brand-600 dark:text-accent" />
          <p className="mt-3 text-xs font-medium text-ink">
            Akses Kamera untuk Pemindai QR
          </p>
          <p className="mt-1 text-[11px] text-muted text-balance">
            Kamera hanya dipakai untuk membaca kode QR pada stiker fisik
            meter. Jernih tidak pernah merekam atau menyimpan video.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              varian="utama"
              ukuran="sm"
              onClick={onMintaIzin}
              memuat={izinKamera === "minta"}
            >
              Izinkan Kamera & Pindai
            </Button>
          </div>
        </div>
      ) : izinKamera === "diberikan" ? (
        <div className="rounded-[3px] border border-line bg-surface p-4 text-center">
          <div className="mx-auto flex size-44 items-center justify-center rounded-[3px] border-2 border-dashed border-brand-500 bg-brand-500/5">
            <div className="text-center p-3">
              <div className="inline-block animate-pulse text-xs font-semibold text-brand-700 dark:text-accent">
                Arahkan kamera ke stiker QR meter
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={onSimulasi}
                  className="rounded-[2px] bg-brand-500/10 px-2 py-1 font-mono text-[11px] font-bold text-brand-700 hover:bg-brand-500/20 dark:text-accent"
                >
                  Simulasi Deteksi: P0001
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[3px] border border-warn/30 bg-warn/10 p-4 text-xs text-ink text-left">
          <p className="font-semibold text-warn">Izin kamera tidak tersedia</p>
          <p className="mt-1 text-muted">
            Silakan beralih ke tab <strong>Ketik ID Pelanggan</strong> di
            atas untuk memasukkan nomor meter secara manual.
          </p>
        </div>
      )}
    </div>
  );
}
