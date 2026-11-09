import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModalNomorTiket({
  nomor,
  sudahSalin,
  onSalin,
  onTutup,
  onLihatTiket,
}: {
  nomor: string;
  sudahSalin: boolean;
  onSalin: () => void;
  onTutup: () => void;
  onLihatTiket: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onTutup}
        className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
        aria-label="Tutup popup"
      />

      <div className="relative z-10 w-full max-w-md rounded-[6px] border border-line bg-surface p-6 shadow-2xl text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={28} />
        </div>

        <span className="mt-3 inline-block font-mono text-[11px] font-bold text-success uppercase">
          Laporan Berhasil Terkirim
        </span>
        <h3 className="font-display text-xl font-bold text-ink">
          Tiket Pengaduan Diterbitkan
        </h3>

        <div className="my-5 rounded-[4px] border-2 border-dashed border-brand-500 bg-brand-500/5 p-4">
          <span className="font-mono text-[10px] uppercase text-muted">
            Nomor Tiket Anda
          </span>
          <div className="my-1 font-mono text-2xl font-black tracking-wider text-ink">
            {nomor}
          </div>
          <Button type="button" varian="sekunder" ukuran="sm" onClick={onSalin}>
            <Copy size={13} />
            <span>{sudahSalin ? "Nomor Tersalin!" : "Salin Nomor Tiket"}</span>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted text-balance">
          Simpan nomor ini. Anda dapat melacak perkembangan penanganan di halaman <strong className="text-ink">Lacak Pengaduan</strong> publik tanpa perlu masuk ke akun.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/lacak?nomor=${nomor}`}>
            <Button varian="utama" blok>
              Buka Pelacakan Tiket Publik
              <ExternalLink size={14} />
            </Button>
          </Link>
          <Button varian="halus" blok onClick={onLihatTiket}>
            Tutup & Lihat Tiket Saya
          </Button>
        </div>
      </div>
    </div>
  );
}
