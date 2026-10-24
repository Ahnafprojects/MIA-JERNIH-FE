// SEMENTARA — lihat `../_sementara/data-admin.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import {
  hitungStatus,
  semuaPelanggan,
  statusMeter,
  ZONA_KONSOL,
} from "../_sementara/data-admin";

export function GET() {
  const semua = semuaPelanggan();

  /*
   * Meter tanpa koordinat DIKELUARKAN dari daftar pin, dan jumlahnya
   * dilaporkan tersendiri.
   *
   * Menaruhnya di 0,0 menempatkannya di Teluk Guinea — satu gumpalan pin di
   * tengah laut yang langsung terlihat salah. Menghilangkannya diam-diam
   * lebih buruk lagi: jumlah pin tidak akan pernah cocok dengan jumlah
   * pelanggan, dan tidak ada yang bisa menjelaskan selisihnya.
   */
  const berkoordinat = semua.filter((p) => p.koordinat !== null);

  return NextResponse.json({
    pin: berkoordinat.map((p) => ({
      id: p.id,
      nama: p.nama,
      zonaId: p.zonaId,
      zona: p.zona,
      koordinat: p.koordinat,
      status: statusMeter(p),
      saldoL: p.saldoL,
      debitLpm: p.debitLpm,
      relayOn: p.relayOn,
    })),
    // Dihitung dari himpunan yang SAMA dengan pin di atas, supaya angka
    // legenda tidak pernah berselisih dengan jumlah pin yang tergambar.
    jumlahStatus: hitungStatus(berkoordinat),
    tanpaKoordinat: semua.length - berkoordinat.length,
    totalMeter: semua.length,
    zona: ZONA_KONSOL.map((z) => {
      const isi = berkoordinat.filter((p) => p.zonaId === z.id);
      return {
        id: z.id,
        nama: z.nama,
        meter: isi.length,
        alarm: isi.filter((p) => statusMeter(p) === "alarm").length,
        offline: isi.filter((p) => statusMeter(p) === "offline").length,
      };
    }),
  });
}
