// SEMENTARA — lihat `../_sementara/data.ts`. Hapus setelah backend siap.
//
// Alamat endpoint ini diumumkan di halaman `/statistik` supaya orang lain bisa
// memakai datanya sendiri. Karena itu jawabannya membawa kepala CORS terbuka
// (lihat `../_terbuka.ts`): tanpa itu janji "API terbuka" hanya berlaku untuk
// alat baris perintah, dan gagal di peramban mana pun.
import { NextResponse } from "next/server";
import { KEPALA_TERBUKA, OPTIONS_TERBUKA } from "../_terbuka";
import { statistik } from "../_sementara/data";

export function GET(req: Request) {
  const hari = Number(new URL(req.url).searchParams.get("rentang") ?? 30);
  return NextResponse.json(
    statistik([7, 30, 90].includes(hari) ? hari : 30),
    { headers: KEPALA_TERBUKA },
  );
}

export const OPTIONS = OPTIONS_TERBUKA;
