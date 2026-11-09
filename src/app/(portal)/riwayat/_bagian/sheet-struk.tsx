import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransaksiBaris } from "../_tipe";
import { Struk } from "./struk";

/**
 * Struk versi ponsel: lembar yang naik dari dasar layar.
 *
 * Seperti panel desktop, isinya DIDELEGASIKAN ke `<Struk>`. Dua salinan
 * tampilan struk yang ditulis terpisah adalah cara paling pelan untuk
 * membuat keduanya berbeda — dan itu sudah terjadi sekali: salinan di sini
 * tertinggal dengan kode token karangan dan tanpa `data-struk`.
 *
 * Lembar ini yang membawa `data-struk` selama terbuka, karena di lebar
 * ponsel dialah struk yang benar-benar dilihat orang saat menekan cetak.
 */
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
        className="tirai-masuk motion-aware fixed inset-0 bg-brand-900/40 backdrop-blur-xs print:hidden"
        aria-label="Tutup struk"
      />

      <div className="lembar-masuk motion-aware relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-sheet border-t border-line bg-surface p-5 shadow-[var(--kedalaman-4)] print:static print:max-h-none print:overflow-visible">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <h3 className="font-display text-base font-bold text-ink">
            Struk pembayaran
          </h3>
          <button
            type="button"
            onClick={onTutup}
            className="grid size-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-soft hover:text-ink"
            aria-label="Tutup struk"
          >
            <X size={18} />
          </button>
        </div>

        <Struk
          key={transaksiTerpilih.id}
          data={transaksiTerpilih}
          penandaCetak
        />

        <div className="mt-4 print:hidden">
          <Button varian="utama" blok ukuran="sm" onClick={onUnduhStrukPdf}>
            <Download size={14} />
            Cetak / Unduh Struk
          </Button>
        </div>
      </div>
    </div>
  );
}
