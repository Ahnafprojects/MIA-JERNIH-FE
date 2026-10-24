// SEMENTARA — lihat `../../_sementara/data-admin.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import { semuaPelanggan, statusMeter } from "../../_sementara/data-admin";

const JAM = 3600_000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const p = semuaPelanggan().find((x) => x.id === id);

  if (!p) {
    // Bentuk galat yang SAMA dengan rute publik: `{ error: { code, message } }`.
    return NextResponse.json(
      { error: { code: "TIDAK_DITEMUKAN", message: "Pelanggan tidak ditemukan." } },
      { status: 404 },
    );
  }

  // Deret 30 hari diturunkan dari id-nya, bukan diacak ulang tiap permintaan:
  // grafik yang berubah bentuk setiap kali halaman dimuat terbaca sebagai data
  // karangan, dan memang begitu adanya.
  const benih = [...p.id].reduce((t, c) => t + c.charCodeAt(0), 0);
  const pakai30 = Array.from({ length: 30 }, (_, i) =>
    Math.max(0, Math.round(140 + Math.sin((i + benih) / 3.4) * 55 + ((i * benih) % 37) - 18)),
  );

  return NextResponse.json({
    ...p,
    status: statusMeter(p),
    firmware: "1.4.2",
    kalibrasiTerakhir: new Date(Date.now() - 86 * 24 * JAM).toISOString(),
    alarm: {
      // Ambang ini milik firmware, bukan pilihan tampilan — lihat FE#20.
      ringan: p.saldoL <= 5 && p.saldoL > 2,
      berat: p.saldoL <= 2 && p.saldoL > 0,
      tertutup: p.saldoL <= 0,
    },
    pakaiHarian: { labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`), points: pakai30 },
    token: Array.from({ length: 5 }, (_, i) => ({
      kode: `${String(10000 + ((benih * (i + 7)) % 89999)).slice(0, 5)} ${String(10000 + ((benih * (i + 13)) % 89999)).slice(0, 5)}`,
      liter: [1000, 2500, 5000, 1000, 2500][i],
      pada: new Date(Date.now() - (i * 9 + 2) * 24 * JAM).toISOString(),
      dipakai: i > 0,
    })),
    aktivitas: [
      { pada: new Date(Date.now() - 2 * JAM).toISOString(), teks: "Telemetri diterima" },
      { pada: new Date(Date.now() - 26 * JAM).toISOString(), teks: "Token ditukar, +2.500 L" },
      { pada: new Date(Date.now() - 73 * JAM).toISOString(), teks: "Relay dibuka otomatis setelah saldo terisi" },
      { pada: new Date(Date.now() - 75 * JAM).toISOString(), teks: "Relay ditutup otomatis, saldo habis" },
    ],
  });
}
