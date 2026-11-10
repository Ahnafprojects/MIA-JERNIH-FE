import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { TARGET, kanalRiwayat } from "../_tipe";
import type { RiwayatBroadcast } from "../_tipe";

export function RiwayatPengiriman({ riwayat }: { riwayat: RiwayatBroadcast[] }) {
  return (
    <Panel judul="Riwayat Pengiriman">
      <div className="berjenjang divide-y divide-line">
        {riwayat.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">Belum ada broadcast terkirim.</p>
        ) : (
          riwayat.map((item) => (
            <div className="py-3 text-xs" key={item.id}>
              <div className="flex justify-between gap-2">
                <b className="text-ink">{item.judul}</b>
                <Badge>{TARGET[item.target]?.label ?? item.target}</Badge>
              </div>
              <p className="mt-1 text-muted">
                <span className="tabular font-mono">
                  {item.penerima.toLocaleString("id-ID")}
                </span>{" "}
                penerima ·{" "}
                <span className="tabular font-mono">
                  {item.dibuka.toLocaleString("id-ID")}
                </span>{" "}
                dibuka
                {kanalRiwayat(item)}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {tanggalJam(item.dibuatPada)}
              </p>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
