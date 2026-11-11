import { meterKubik, rupiah } from "@/lib/format";
import { Panel } from "@/components/ui/card";
import { GrafikGaris, GrafikBatang } from "@/components/domain/grafik";
import type { Analitik } from "../_tipe";

export function GrafikAnalitik({ data }: { data: Analitik | null }) {
  const series = data?.series || [];
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel judul="Pendapatan & Volume">
          {data && (
            <GrafikGaris
              labels={data.labels}
              deret={series}
              tinggi={250}
              format={(n) => rupiah(n)}
            />
          )}
        </Panel>
        <Panel judul="Konsumsi per Periode">
          {data && (
            <GrafikBatang
              labels={data.labels}
              deret={series.filter((s) => s.name !== "Pendapatan")}
              tinggi={250}
              format={(n) => meterKubik(n)}
            />
          )}
        </Panel>
      </div>

      <Panel judul="NRW dan Efisiensi Jaringan">
        {data && (
          <GrafikGaris
            labels={data.labels}
            deret={series.filter((s) => s.name.includes("Air"))}
            tinggi={240}
            format={(n) => meterKubik(n)}
          />
        )}
      </Panel>
    </>
  );
}
