// SEMENTARA — lihat `../../_sementara/data.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { TIKET } from "../../_sementara/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nomor: string }> },
) {
  const { nomor } = await params;
  // Nomor boleh diketik dengan atau tanpa tanda hubung, huruf besar atau kecil.
  const cari = decodeURIComponent(nomor).replace(/[\s-]/g, "").toUpperCase();
  const tiket = TIKET.find(
    (t) => t.nomor.replace(/-/g, "").toUpperCase() === cari,
  );

  if (!tiket) {
    // Tidak membedakan "tidak ada" dari "bukan milik Anda": perbedaan itu bisa
    // dipakai menebak nomor tiket orang lain.
    return NextResponse.json(
      {
        error: {
          code: "TIKET_TIDAK_DITEMUKAN",
          message:
            "Nomor pengaduan tidak ditemukan. Periksa kembali nomor pada bukti laporan Anda.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json(tiket);
}
