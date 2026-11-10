"use client";

import { useAnalitik } from "./_hooks/use-analitik";
import { KepalaAnalitik } from "./_bagian/kepala-analitik";
import { KpiAnalitik } from "./_bagian/kpi-analitik";
import { GrafikAnalitik } from "./_bagian/grafik-analitik";

export default function HalamanAnalitik() {
  const a = useAnalitik();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <KepalaAnalitik
        rentang={a.rentang}
        setRentang={a.setRentang}
        zona={a.zona}
        setZona={a.setZona}
        zonaList={a.data?.zonaList}
        onUnduh={a.unduh}
      />
      <KpiAnalitik kpi={a.data?.kpi} />
      <GrafikAnalitik data={a.data} />
    </main>
  );
}
