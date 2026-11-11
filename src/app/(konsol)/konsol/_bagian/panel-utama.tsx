import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import type { Deret } from "@/types/publik";
import { GrafikSuplai } from "./grafik-suplai";
import { TabelLive } from "./tabel-live";
import { DaftarNrwZona } from "./nrw-zona";
import type { Dashboard } from "./tipe";

interface Props {
  data: Dashboard | null;
  memuat: boolean;
  nrwRata: number | null;
  labels: string[];
  atas: Deret | null;
  bawah: Deret | null;
}

/** Kolom kiri dashboard: grafik suplai, pelanggan live, NRW per zona. */
export function PanelUtama({ data, memuat, nrwRata, labels, atas, bawah }: Props) {
  return (
    <div className="min-w-0 space-y-5">
      <Panel
        judul="Air disuplai dan air tercatat"
        sub="30 hari terakhir · meter kubik per hari"
        aksi={
          nrwRata === null ? null : (
            <Badge
              nada={nrwRata <= 20 ? "sukses" : nrwRata <= 30 ? "peringatan" : "bahaya"}
              titik
            >
              <span className="tabular font-mono">{angka(nrwRata, 1)}%</span>
              <span className="ml-1 font-semibold">hilang</span>
            </Badge>
          )
        }
      >
        {memuat ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <GrafikSuplai labels={labels} atas={atas} bawah={bawah} />
        )}
      </Panel>

      <Panel
        judul="Pelanggan yang sedang mengalir"
        sub="Diurutkan dari debit terbesar"
        isiClassName="p-0"
      >
        <TabelLive baris={data?.pelangganLive} memuat={memuat} />
      </Panel>

      <Panel
        judul="Kehilangan air per zona"
        sub="Penanda tipis pada batang adalah ambang 20%"
        isiClassName="p-0"
      >
        <DaftarNrwZona zona={data?.nrwPerZona} memuat={memuat} />
      </Panel>
    </div>
  );
}
