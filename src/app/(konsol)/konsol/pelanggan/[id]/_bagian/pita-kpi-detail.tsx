import type { ComponentProps } from "react";
import { angka } from "@/lib/format";
import { TabungSaldo } from "../../_bagian/tabung";
import { SelKpi } from "./sel-kpi";

interface Props {
  saldoL: number;
  nada: ComponentProps<typeof SelKpi>["nada"];
  debitLpm: number;
  mengalir: boolean;
  total30: number;
  rata: number | null;
}

export function PitaKpiDetail({ saldoL, nada, debitLpm, mengalir, total30, rata }: Props) {
  return (
        <section aria-label="Angka utama pelanggan" className="mt-7">
          <div aria-hidden className="takar h-1.5" />
          <dl className="grid border-y border-line sm:grid-cols-4">
            <SelKpi
              label="Saldo tersisa"
              nilai={angka(saldoL, 2)}
              satuan="L"
              nada={nada}
              kaki={
                <span className="mt-2 block">
                  <TabungSaldo saldoL={saldoL} />
                </span>
              }
            />
            <SelKpi
              label="Debit saat ini"
              nilai={angka(mengalir ? debitLpm : 0, 1)}
              satuan="L/mnt"
              nada={mengalir ? "brand" : "netral"}
              kaki={mengalir ? "Air sedang mengalir" : "Tidak ada aliran"}
              garisKiri
            />
            <SelKpi
              label="Pemakaian 30 hari"
              nilai={angka(total30)}
              satuan="L"
              kaki={`Setara ${angka(total30 / 1000, 2)} m³`}
              garisKiri
            />
            <SelKpi
              label="Rata-rata harian"
              nilai={rata === null ? null : angka(rata, 1)}
              satuan="L/hari"
              kaki="Dari 30 hari terakhir"
              garisKiri
            />
          </dl>
        </section>
  );
}
