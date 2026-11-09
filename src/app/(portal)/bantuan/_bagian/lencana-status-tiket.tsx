import { Badge } from "@/components/ui/badge";

export function LencanaStatusTiket({
  status,
  slaTerlampaui,
}: {
  status: string;
  slaTerlampaui?: boolean;
}) {
  if (status === "SELESAI") {
    return <Badge nada="sukses" titik>Selesai</Badge>;
  }
  if (slaTerlampaui) {
    return <Badge nada="bahaya" titik>Melewati SLA</Badge>;
  }
  if (status === "DIPROSES") {
    return <Badge nada="brand" titik>Diproses</Badge>;
  }
  return <Badge nada="peringatan" titik>Laporan Baru</Badge>;
}
