import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TiketKanban } from "../_tipe";

interface Props {
  item: TiketKanban;
  /** Kolom tempat kartu ini berada; menentukan tombol aksi yang tampil. */
  status: string;
  sibuk: boolean;
  onUbahStatus: (id: string, status: string) => void;
}

export function KartuTiket({ item, status, sibuk, onUbahStatus }: Props) {
  return (
    <article
      className={`rounded-card border bg-surface p-4 ${item.slaTerlampaui ? "border-danger/50" : "border-line"}`}
    >
      <div className="flex justify-between gap-2">
        <span className="font-mono text-xs font-bold text-ink">{item.nomor}</span>
        <Badge nada={item.slaTerlampaui ? "bahaya" : "netral"}>
          {item.slaTerlampaui ? "Lewat SLA" : item.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm font-bold text-ink">{item.kategori}</p>
      <p className="mt-1 text-xs text-muted">
        {item.pelapor.nama} · {item.zona || "—"}
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted">
        SLA: {tanggalJam(item.slaJatuhTempo)}
      </p>
      <div className="mt-3 flex gap-1">
        {status !== "DIPROSES" ? (
          <Button
            ukuran="sm"
            varian="sekunder"
            disabled={sibuk}
            onClick={() => onUbahStatus(item.id, "DIPROSES")}
          >
            Proses
          </Button>
        ) : null}
        {status !== "SELESAI" ? (
          <Button ukuran="sm" disabled={sibuk} onClick={() => onUbahStatus(item.id, "SELESAI")}>
            Selesai
          </Button>
        ) : null}
      </div>
    </article>
  );
}
