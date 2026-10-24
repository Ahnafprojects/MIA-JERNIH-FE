// SEMENTARA — lihat `../_sementara/data-status.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { riwayatZona } from "../_sementara/data-status";

/*
 * TANPA `"use cache"`, dan itu disengaja.
 *
 * Seluruh jawabannya dihitung relatif terhadap "sekarang": gangguan yang
 * masih berlangsung, strip 30 hari terakhir, dan jadwal pemeliharaan yang
 * AKAN datang. Begitu hasilnya disimpan, tanggalnya membeku — dan beberapa
 * hari kemudian halaman mengumumkan pemeliharaan yang sudah lewat.
 *
 * (`export const dynamic` tidak dipakai: `cacheComponents` di
 * `next.config.ts` menolaknya. Rute tanpa `"use cache"` memang sudah dinamis.)
 */
export function GET() {
  return NextResponse.json(riwayatZona());
}
