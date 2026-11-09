import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KeadaanKosong as KeadaanKosongUi } from "@/components/ui/keadaan";

export function KeadaanKosong() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <KeadaanKosongUi
        judul="Meter Belum Terhubung"
        pesan="Sambungkan meter fisik Anda terlebih dahulu untuk melihat catatan konsumsi air."
        aksi={
          <Link href="/hubungkan-meter">
            <Button varian="utama">Hubungkan Meter Sekarang</Button>
          </Link>
        }
      />
    </div>
  );
}
