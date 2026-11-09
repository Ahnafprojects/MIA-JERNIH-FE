import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransaksiBaris } from "../_tipe";
import { Struk } from "./struk";

/**
 * Struk versi desktop: panel lengket di kolom kanan.
 *
 * Isinya DIDELEGASIKAN ke `<Struk>`, tidak ditulis ulang di sini. Versi
 * sebelumnya menyalin seluruh daftar baris struk, dan salinan itu tertinggal
 * saat perbaikan mendarat di tempat lain: kode token kembali menjadi teks
 * karangan "55120 •••••", dan atribut `data-struk` — satu-satunya pegangan
 * aturan `@media print` — hilang sama sekali, sehingga mencetak struk
 * kembali mencetak seluruh halaman.
 *
 * ── Kenapa `print:block`, bukan sekadar `hidden lg:block` ─────────────
 *
 * Dialog cetak peramban menata ulang halaman pada lebar KERTAS (A4 ≈ 794px),
 * yang berada di bawah ambang `lg` (1024px). Jadi panel ini `display: none`
 * tepat pada saat ia satu-satunya yang boleh tercetak — dan `visibility:
 * visible` di aturan cetak tidak bisa menghidupkan elemen yang sudah
 * dimatikan `display`.
 */
export function PanelStruk({
  transaksiTerpilih,
  pesanEmail,
  sheetBuka,
  onUnduhStrukPdf,
  onKirimEmailStruk,
}: {
  transaksiTerpilih: TransaksiBaris | null;
  pesanEmail: string | null;
  /**
   * Saat lembar bawah terbuka, DIA yang membawa `data-struk`. Dua elemen
   * bertanda sekaligus membuat hasil cetaknya menumpuk dua struk di posisi
   * yang sama — aturan cetaknya memaksa `position: absolute; inset: 0`.
   */
  sheetBuka: boolean;
  onUnduhStrukPdf: () => void;
  onKirimEmailStruk: () => void;
}) {
  if (!transaksiTerpilih) {
    return (
      <div className="cekung p-8 text-center text-xs text-muted">
        Pilih salah satu transaksi untuk melihat strukrnya.
      </div>
    );
  }

  return (
    <div className="sticky top-28 space-y-3 print:static">
      {pesanEmail ? (
        <p className="rounded-[10px] border border-success/40 bg-success-soft p-2.5 text-center text-xs font-medium text-success print:hidden">
          {pesanEmail}
        </p>
      ) : null}

      {/* `key`: memilih baris lain MEMASANG ULANG struk, jadi kode token yang
          sudah diminta untuk transaksi sebelumnya tidak ikut terbawa. */}
      <Struk
        key={transaksiTerpilih.id}
        data={transaksiTerpilih}
        penandaCetak={!sheetBuka}
      />

      <div className="space-y-2 print:hidden">
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
