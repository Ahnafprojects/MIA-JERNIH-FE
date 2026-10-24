// SEMENTARA — lihat `../_sementara/data-lacak.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { panduanAduan } from "../_sementara/data-lacak";

/**
 * Pendamping `/api/publik/lacak/[nomor]`: semua yang dibutuhkan halaman
 * pelacakan SELAIN tiketnya sendiri — janji waktu, tahapan, kanal
 * pelaporan, nomor contoh, dan pengaduan yang baru ditutup.
 *
 * Sengaja SATU permintaan, bukan lima: halaman ini hanya punya satu keadaan
 * memuat dan satu keadaan galat, dan lima permintaan yang gagal sebagian
 * akan menghasilkan halaman yang separuhnya kosong tanpa ada yang
 * menjelaskannya.
 */
export function GET() {
  return NextResponse.json(panduanAduan());
}
