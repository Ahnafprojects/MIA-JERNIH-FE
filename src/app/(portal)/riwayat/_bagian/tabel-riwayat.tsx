import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabel } from "@/components/ui/tabel";
import { KeadaanKosong } from "@/components/ui/keadaan";
import type { TransaksiBaris } from "../_tipe";
import { buatKolom } from "./kolom-tabel";

export function TabelRiwayat({
  memuat,
  dataTersaring,
  transaksiTerpilihId,
  onKlikBaris,
}: {
  memuat: boolean;
  dataTersaring: TransaksiBaris[];
  transaksiTerpilihId?: string;
  onKlikBaris: (item: TransaksiBaris) => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface shadow-xs">
      {!memuat && dataTersaring.length === 0 ? (
        <div className="py-12">
          <KeadaanKosong
            judul="Belum Ada Transaksi"
            pesan="Anda belum memiliki catatan transaksi pembelian token air."
            aksi={
              <Link href="/beli">
                <Button varian="utama">Beli Token Air Pertama</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <Tabel
          kolom={buatKolom()}
          data={dataTersaring}
          kunciBaris={(t) => t.id}
          onKlikBaris={onKlikBaris}
          terpilih={transaksiTerpilihId}
          lebarMin="32rem"
        />
      )}
    </div>
  );
}
