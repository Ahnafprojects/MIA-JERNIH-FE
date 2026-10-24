// SEMENTARA — lihat `../_sementara/data.ts`. Hapus setelah backend siap.
//
// Lapisan yang membuat angka di halaman statistik bisa diperiksa: rincian
// kehilangan air sampai ke komponennya, pembanding terhadap tolok ukur,
// pemakaian per orang, tren dua belas bulan, dan keterangan asal datanya.
//
// Totalnya DITURUNKAN dari `statistik()` yang sama dengan endpoint
// `/api/publik/statistik`, jadi rincian di sini selalu berjumlah persis sama
// dengan kehilangan yang tampil di sana.
import { NextResponse } from "next/server";
import { KEPALA_TERBUKA, OPTIONS_TERBUKA } from "../_terbuka";
import { neracaAir } from "../_sementara/data-statistik";

export function GET(req: Request) {
  const hari = Number(new URL(req.url).searchParams.get("rentang") ?? 30);
  return NextResponse.json(neracaAir(hari), { headers: KEPALA_TERBUKA });
}

export const OPTIONS = OPTIONS_TERBUKA;
