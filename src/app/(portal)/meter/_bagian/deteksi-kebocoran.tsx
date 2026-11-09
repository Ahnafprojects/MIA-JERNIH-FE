import { Badge } from "@/components/ui/badge";
import { GrafikGaris } from "@/components/domain/grafik";
import { debit } from "@/lib/format";

export function DeteksiKebocoran({
  dataDeteksiKebocoran,
}: {
  dataDeteksiKebocoran: {
    labels: string[];
    deret: { name: string; unit: string; points: number[] }[];
    ambangBocor: number;
  };
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Deteksi Kebocoran Dini Hari
          </h3>
          <p className="text-xs text-muted">
            Pemantauan aliran statis pada pukul 01:00 – 04:00 saat rumah tangga beristirahat.
          </p>
        </div>
        <Badge nada="sukses" titik>
          Saluran Rapat
        </Badge>
      </div>

      <GrafikGaris
        labels={dataDeteksiKebocoran.labels}
        deret={dataDeteksiKebocoran.deret}
        tinggi={160}
        ambang={dataDeteksiKebocoran.ambangBocor}
        labelAmbang="Ambang Bocor (0,2 L/mnt)"
        format={(v) => debit(v)}
      />

      <p className="mt-3 text-[11px] text-muted leading-relaxed">
        Jika debit air malam terus bergerak di atas garis putus-putus tanpa ada keran yang dinyalakan, sistem menandai kemungkinan kebocoran pipa tersembunyi.
      </p>
    </div>
  );
}
