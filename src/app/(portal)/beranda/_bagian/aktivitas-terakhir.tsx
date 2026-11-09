import Link from "next/link";
import { CheckCircle2, Droplet, ExternalLink } from "lucide-react";
import { liter, rupiah } from "@/lib/format";
import type { TransaksiRingkas } from "../_tipe";

/**
 * Empat baris terakhir, bukan daftar penuh.
 *
 * Halaman ini menjawab "apa yang sedang terjadi", bukan "apa saja yang
 * pernah terjadi". Riwayat lengkapnya punya halamannya sendiri, dan
 * tautannya ada di sini.
 */
export function AktivitasTerakhir({
  transaksi,
}: {
  transaksi: TransaksiRingkas[];
}) {
  return (
    <div className="permukaan p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-ink">
          Aktivitas terakhir
        </h2>
        <Link
          href="/riwayat"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold whitespace-nowrap text-brand-700 hover:underline dark:text-accent"
        >
          <span>Semua riwayat</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {transaksi.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted">
          Belum ada pembelian atau penukaran token.
        </p>
      ) : (
        <ul className="berjenjang space-y-2">
          {transaksi.map((t) => (
            <li
              key={t.id}
              className="permukaan-rata flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
                  {t.jenis === "BELI" ? (
                    <Droplet size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {t.jenis === "BELI" ? "Beli paket" : "Isi token"}{" "}
                    {liter(t.volumeL, 0)}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    {new Date(t.dibuatPada).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {t.metode ? ` · ${t.metode}` : null}
                  </p>
                </div>
              </div>
              <span className="tabular shrink-0 font-mono text-xs font-black text-ink">
                {rupiah(t.jumlahRp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
