import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { NotifRingkas } from "../_tipe";

export function InfoPdam({ notifikasi }: { notifikasi: NotifRingkas[] }) {
  return (
    <div className="permukaan p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-ink">Info PDAM</h2>
        <Link
          href="/notifikasi"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold whitespace-nowrap text-brand-700 hover:underline dark:text-accent"
        >
          <span>Semua</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {notifikasi.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">
          Belum ada pengumuman dari PDAM untuk Anda.
        </p>
      ) : (
        <ul className="berjenjang space-y-2">
          {notifikasi.map((n) => (
            <li key={n.id} className="cekung p-3">
              <p className="text-xs font-bold text-ink">{n.judul}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">
                {n.teks}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {new Date(n.dibuatPada).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
