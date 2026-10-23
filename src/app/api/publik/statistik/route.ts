// SEMENTARA — lihat `../_sementara/data.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { statistik } from "../_sementara/data";

export function GET(req: Request) {
  const hari = Number(new URL(req.url).searchParams.get("rentang") ?? 30);
  return NextResponse.json(statistik([7, 30, 90].includes(hari) ? hari : 30));
}
