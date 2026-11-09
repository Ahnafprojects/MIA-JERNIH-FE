import { Badge } from "@/components/ui/badge";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { liter, tanggal } from "@/lib/format";
import type { TokenRow } from "../_tipe";

const FILTER: [string, string][] = [
  ["", "Semua status"],
  ["AKTIF", "Aktif"],
  ["TERPAKAI", "Terpakai"],
  ["KEDALUWARSA", "Kedaluwarsa"],
];

export function TabelToken({
  rows,
  filter,
  setFilter,
}: {
  rows: TokenRow[];
  filter: string;
  setFilter: (v: string) => void;
}) {
  const kolom: Kolom<TokenRow>[] = [
    {
      kunci: "kode",
      label: "Kode",
      render: (r) => <span className="font-mono text-xs">{r.kodeBertopeng}</span>,
    },
    {
      kunci: "liter",
      label: "Liter",
      rata: "kanan",
      render: (r) => <span className="tabular font-mono text-xs">{liter(r.nilaiL, 0)}</span>,
    },
    {
      kunci: "status",
      label: "Status",
      render: (r) => <Badge>{r.status}</Badge>,
    },
    {
      kunci: "meter",
      label: "Meter",
      sembunyiKecil: true,
      render: (r) => <span className="font-mono text-xs text-muted">{r.meterId || "—"}</span>,
    },
    {
      kunci: "dibuat",
      label: "Dibuat",
      render: (r) => <span className="text-xs text-muted">{tanggal(r.dibuatPada)}</span>,
    },
  ];

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <select
          className="h-9 rounded-input border border-line bg-canvas px-2 text-xs text-ink outline-none focus:border-brand-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {FILTER.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <Tabel
        kolom={kolom}
        data={rows}
        kunciBaris={(r) => r.id}
        kosong={<p className="py-10 text-center text-xs text-muted">Belum ada token pada status ini.</p>}
        lebarMin="34rem"
      />
    </>
  );
}
