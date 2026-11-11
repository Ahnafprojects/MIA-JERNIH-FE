import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AMBANG, type DetailPelanggan } from "../../_bagian/tipe";

/**
 * Tangga ambang alarm.
 *
 * Ditampilkan sebagai TANGGA MENURUN, bukan tiga lencana sejajar: ketiganya
 * dilalui berurutan saat saldo habis, dan urutan itulah informasinya. Anak
 * tangga yang sedang berlaku ditandai bentuk (garis takar tebal) DAN kata
 * — "Berlaku sekarang" — bukan warna saja.
 */
export function TanggaAlarm({
  saldoL,
  alarm,
}: {
  saldoL: number;
  alarm: DetailPelanggan["alarm"];
}) {
  const anak = [
    {
      ambang: AMBANG.ringan,
      judul: "Peringatan saldo tipis",
      arti: "Meter berbunyi pendek, pelanggan dikirimi notifikasi.",
      aktif: alarm.ringan,
    },
    {
      ambang: AMBANG.berat,
      judul: "Peringatan keras",
      arti: "Bunyi panjang berulang. Air masih mengalir.",
      aktif: alarm.berat,
    },
    {
      ambang: AMBANG.tutup,
      judul: "Relay menutup otomatis",
      arti: "Aliran berhenti sampai token baru ditukarkan.",
      aktif: alarm.tertutup,
    },
  ];

  return (
    <div>
      <p className="text-[12.5px] text-muted">
        Saldo sekarang{" "}
        <span className="tabular font-mono font-semibold text-ink">
          {angka(saldoL, 2)} L
        </span>
      </p>
      <ul className="mt-3">
        {anak.map((a) => (
          <li
            key={a.judul}
            className="flex gap-3 border-t border-line py-3 first:border-0 first:pt-0"
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 w-[3px] shrink-0 self-stretch",
                a.aktif ? "bg-danger" : "bg-line",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold">{a.judul}</p>
                <p className="tabular shrink-0 font-mono text-[12px] text-muted">
                  ≤ {angka(a.ambang)} L
                </p>
              </div>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">
                {a.arti}
              </p>
              <p
                className={cn(
                  "mt-1 text-[11.5px] font-semibold",
                  a.aktif ? "text-danger" : "text-muted",
                )}
              >
                {a.aktif ? "Berlaku sekarang" : "Belum tercapai"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
