import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { tanggalJam } from "@/lib/format";
import type { TiketItem } from "../_tipe";
import { LencanaStatusTiket } from "./lencana-status-tiket";

export function TiketSaya({
  daftarTiketSaya,
  memuatTiket,
  onBuatPertama,
}: {
  daftarTiketSaya: TiketItem[];
  memuatTiket: boolean;
  onBuatPertama: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
        <h2 className="font-display text-base font-bold text-ink">
          Daftar Tiket Pengaduan Saya
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Pantau status penanganan teknisi PDAM dan sisa waktu jatuh tempo SLA.
        </p>

        {memuatTiket ? (
          <div className="py-12 text-center text-xs text-muted">Memuat daftar tiket...</div>
        ) : daftarTiketSaya.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-muted">Belum ada tiket pengaduan yang dibuat.</p>
            <button
              type="button"
              onClick={onBuatPertama}
              className="mt-3 text-xs font-bold text-brand-700 hover:underline dark:text-accent"
            >
              Buat Pengaduan Pertama &rarr;
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {daftarTiketSaya.map((t) => (
              <div key={t.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-ink">{t.nomor}</span>
                    <LencanaStatusTiket status={t.status} slaTerlampaui={t.slaTerlampaui} />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink capitalize">{t.kategori}</p>
                  <p className="mt-0.5 text-xs text-muted line-clamp-1">{t.deskripsi}</p>
                  <span className="mt-1 block font-mono text-[10px] text-muted">
                    Dilaporkan: {tanggalJam(t.dibuatPada)}
                  </span>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="text-left sm:text-right">
                    <span className="font-mono text-[11px] text-muted">Batas SLA:</span>
                    <p className={`font-mono text-xs font-bold ${t.slaTerlampaui ? "text-danger" : "text-ink"}`}>
                      {tanggalJam(t.slaJatuhTempo)}
                    </p>
                  </div>
                  <Link
                    href={`/lacak?nomor=${t.nomor}`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
                  >
                    <span>Lacak Publik</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
