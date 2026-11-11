import { KOLOM_STATUS } from "../_tipe";
import type { TiketKanban } from "../_tipe";
import { KartuTiket } from "./kartu-tiket";

interface Props {
  tiket: TiketKanban[];
  aksiId: string | null;
  onUbahStatus: (id: string, status: string) => void;
}

export function PapanKanban({ tiket, aksiId, onUbahStatus }: Props) {
  return (
    <div className="berjenjang grid gap-4 lg:grid-cols-3">
      {KOLOM_STATUS.map((status) => {
        const isi = tiket.filter((item) => item.status === status);
        return (
          <section
            key={status}
            className="min-h-80 rounded-card border border-line bg-silt/40 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[13px] font-bold tracking-wider uppercase text-muted">
                {status}
              </h2>
              <span className="tabular font-mono text-xs text-muted">{isi.length}</span>
            </div>
            <div className="space-y-3">
              {isi.map((item) => (
                <KartuTiket
                  key={item.id}
                  item={item}
                  status={status}
                  sibuk={aksiId === item.id}
                  onUbahStatus={onUbahStatus}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
