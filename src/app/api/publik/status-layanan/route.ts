// SEMENTARA — lihat `../_sementara/data.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { ZONA } from "../_sementara/data";

export function GET() {
  const ringkas = { normal: 0, gangguan: 0, perbaikan: 0 };
  for (const z of ZONA) ringkas[z.status] += 1;
  return NextResponse.json({
    zona: ZONA,
    ringkas,
    ts: new Date().toISOString(),
  });
}
