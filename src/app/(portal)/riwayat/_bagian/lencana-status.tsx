import { Badge } from "@/components/ui/badge";

export function LencanaStatus({ status }: { status: string }) {
  switch (status) {
    case "LUNAS":
      return <Badge nada="sukses" titik>Lunas</Badge>;
    case "MENUNGGU":
      return <Badge nada="peringatan" titik>Menunggu</Badge>;
    case "GAGAL":
      return <Badge nada="bahaya" titik>Gagal</Badge>;
    case "KEDALUWARSA":
      return <Badge nada="netral" titik>Kedaluwarsa</Badge>;
    default:
      return <Badge nada="netral">{status}</Badge>;
  }
}
