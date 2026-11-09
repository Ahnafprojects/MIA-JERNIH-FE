import { Badge } from "@/components/ui/badge";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import type { MeterArmada } from "../_tipe";

export function TabelArmada({
  rows,
  ids,
  setIds,
}: {
  rows: MeterArmada[];
  ids: string[];
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const kolom: Kolom<MeterArmada>[] = [
    {
      kunci: "node",
      label: "Node / Serial",
      render: (m) => (
        <span className="font-mono text-xs">
          <span className="font-bold text-ink">{m.id}</span>
          <br />
          <span className="text-muted">{m.serial}</span>
        </span>
      ),
    },
    { kunci: "zona", label: "Zona", render: (m) => <span className="text-xs">{m.zona || "—"}</span> },
    {
      kunci: "firmware",
      label: "Firmware",
      sembunyiKecil: true,
      render: (m) => <span className="font-mono text-xs text-muted">{m.versiFirmware}</span>,
    },
    {
      kunci: "status",
      label: "RSSI / Status",
      render: (m) => (
        <Badge nada={m.daring ? "sukses" : "bahaya"} titik>
          {m.daring ? "Online" : "Offline"}
        </Badge>
      ),
    },
    {
      kunci: "pilih",
      label: "Pilih",
      rata: "kanan",
      render: (m) => (
        <input
          type="checkbox"
          className="size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
          checked={ids.includes(m.id)}
          onChange={(e) =>
            setIds((x) => (e.target.checked ? [...x, m.id] : x.filter((y) => y !== m.id)))
          }
        />
      ),
    },
  ];

  return (
    <Tabel
      kolom={kolom}
      data={rows}
      kunciBaris={(m) => m.id}
      kosong={<p className="py-10 text-center text-xs text-muted">Belum ada meter terdaftar.</p>}
      lebarMin="40rem"
    />
  );
}
