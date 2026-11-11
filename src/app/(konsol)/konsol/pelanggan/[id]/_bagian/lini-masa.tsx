import { KeadaanKosong } from "@/components/ui/keadaan";
import { tanggalJam } from "@/lib/format";
import type { DetailPelanggan } from "../../_bagian/tipe";

/**
 * Lini masa aktivitas.
 *
 * Garis tegaknya memakai motif `takar-tegak` — sisi gelas ukur, sama dengan
 * yang dipakai lencana dan kolom air. Ia pembatas waktu, bukan hiasan.
 */
export function LiniMasa({
  aktivitas,
}: {
  aktivitas: DetailPelanggan["aktivitas"];
}) {
  if (aktivitas.length === 0) {
    return (
      <KeadaanKosong
        judul="Belum ada aktivitas tercatat"
        pesan="Telemetri, penukaran token, dan perubahan relay akan muncul di sini."
      />
    );
  }

  return (
    <ol className="relative">
      <span
        aria-hidden
        className="takar-tegak absolute top-1 bottom-1 left-[5px] w-px"
      />
      {aktivitas.map((a) => (
        <li key={a.pada} className="relative flex gap-4 pb-4 last:pb-0">
          <span
            aria-hidden
            className="mt-1.5 h-3 w-[3px] shrink-0 translate-x-[4px] bg-brand-500"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium">{a.teks}</p>
            <p className="tabular mt-0.5 font-mono text-[11.5px] text-muted">
              {tanggalJam(a.pada)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
