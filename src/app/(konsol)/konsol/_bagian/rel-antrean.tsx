import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { angka } from "@/lib/format";
import { StatusJaringan } from "./status-jaringan";
import { DaftarBerbunyi, DaftarInsiden } from "./antrian";
import { TokenHariIni } from "./token-hari-ini";
import { angkaSah, type Dashboard } from "./tipe";

interface Props {
  data: Dashboard | null;
  memuat: boolean;
  jumlahBerbunyi: number | null;
  jumlahInsiden: number | null;
}

/** Rel kanan dashboard: status meter, meter berbunyi, insiden, token hari ini. */
export function RelAntrean({ data, memuat, jumlahBerbunyi, jumlahInsiden }: Props) {
  return (
    <aside className="min-w-0 space-y-5">
      <Panel judul="Status seluruh meter" sub="Dihitung dari laporan terakhir tiap meter">
        <StatusJaringan jumlah={data?.jumlahStatus} memuat={memuat} />
      </Panel>

      <Panel
        judul="Meter berbunyi"
        sub="Saldo paling tipis di atas"
        aksi={
          jumlahBerbunyi === null ? null : (
            <Badge nada={jumlahBerbunyi > 0 ? "peringatan" : "netral"}>
              <span className="tabular font-mono">{angka(jumlahBerbunyi)}</span>
            </Badge>
          )
        }
        isiClassName="p-0"
      >
        <DaftarBerbunyi daftar={data?.meterBerbunyi} total={jumlahBerbunyi} memuat={memuat} />
      </Panel>

      <Panel
        judul="Insiden terbaru"
        sub="Laporan yang belum ditutup"
        aksi={
          jumlahInsiden === null ? null : (
            <Badge nada={jumlahInsiden > 0 ? "bahaya" : "netral"}>
              <span className="tabular font-mono">{angka(jumlahInsiden)}</span>
            </Badge>
          )
        }
        isiClassName="p-0"
      >
        <DaftarInsiden daftar={data?.insiden} total={jumlahInsiden} memuat={memuat} />
      </Panel>

      <Panel judul="Token hari ini" sub="Sejak tengah malam" isiClassName="p-0">
        <TokenHariIni
          total={data ? angkaSah(data.tokenHariIni) : null}
          rincian={data?.tokenHariIniDetail}
          memuat={memuat}
        />
      </Panel>
    </aside>
  );
}
