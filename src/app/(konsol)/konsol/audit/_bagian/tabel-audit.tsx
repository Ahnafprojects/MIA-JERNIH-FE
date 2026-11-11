import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import type { BarisAudit } from "../_tipe";

const kolom: Kolom<BarisAudit>[] = [
  {
    kunci: "waktu",
    label: "Waktu",
    render: (r) => <span className="font-mono text-xs">{tanggalJam(r.ts)}</span>,
  },
  {
    kunci: "aktor",
    label: "Aktor",
    render: (r) => (
      <span className="text-xs">
        <span className="text-ink">{r.aktorNama}</span>
        <br />
        <span className="text-muted">{r.aktorPeran || "—"}</span>
      </span>
    ),
  },
  {
    kunci: "tipe",
    label: "Tipe",
    render: (r) => <Badge>{r.tipe}</Badge>,
  },
  {
    kunci: "aksi",
    label: "Aksi",
    render: (r) => <span className="font-mono text-xs">{r.aksi}</span>,
  },
  {
    kunci: "detail",
    label: "Detail",
    render: (r) => <span className="block max-w-md text-xs text-muted">{r.detail}</span>,
  },
  {
    kunci: "ip",
    label: "IP",
    sembunyiKecil: true,
    render: (r) => <span className="font-mono text-xs text-muted">{r.ip}</span>,
  },
];

export function TabelAudit({ rows }: { rows: BarisAudit[] }) {
  return (
    <Panel isiClassName="p-0">
      <Tabel
        kolom={kolom}
        data={rows}
        kunciBaris={(r) => r.id}
        kosong={<p className="py-10 text-center text-xs text-muted">Belum ada catatan audit.</p>}
        lebarMin="54rem"
      />
    </Panel>
  );
}
