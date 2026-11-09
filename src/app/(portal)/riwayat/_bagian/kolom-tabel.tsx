import { liter, rupiah, tanggalJam } from "@/lib/format";
import type { Kolom } from "@/components/ui/tabel";
import type { TransaksiBaris } from "../_tipe";
import { LencanaStatus } from "./lencana-status";

export function buatKolom(): Kolom<TransaksiBaris>[] {
  return [
    {
      kunci: "tanggal",
      label: "Tanggal & Waktu",
      render: (t) => (
        <span className="font-mono text-xs text-muted">{tanggalJam(t.dibuatPada)}</span>
      ),
    },
    {
      kunci: "invoice",
      label: "Invoice",
      render: (t) => <span className="font-mono text-xs font-bold text-ink">{t.id}</span>,
    },
    {
      kunci: "volume",
      label: "Volume",
      rata: "kanan",
      render: (t) => (
        <span className="font-mono text-xs font-bold text-brand-700 dark:text-accent">
          {liter(t.volumeL, 0)}
        </span>
      ),
    },
    {
      kunci: "nominal",
      label: "Nominal",
      rata: "kanan",
      render: (t) => (
        <span className="tabular font-mono text-xs font-bold text-ink">
          {rupiah(t.jumlahRp)}
        </span>
      ),
    },
    {
      kunci: "status",
      label: "Status",
      render: (t) => <LencanaStatus status={t.status} />,
    },
  ];
}
