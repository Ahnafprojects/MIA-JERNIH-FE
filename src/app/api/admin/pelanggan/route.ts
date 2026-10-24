// SEMENTARA — lihat `../_sementara/data-admin.ts`. Hapus setelah backend siap.
//
// TIDAK memakai kepala CORS terbuka seperti `/api/publik/*`. Daftar pelanggan
// berisi nama orang; yang terbuka di proyek ini hanya data agregat.
import { NextResponse } from "next/server";
import {
  hitungStatus,
  semuaPelanggan,
  statusMeter,
  ZONA_KONSOL,
  type PelangganKonsol,
  type StatusMeter,
} from "../_sementara/data-admin";

const SARING: Record<string, (p: PelangganKonsol) => boolean> = {
  aktif: (p) => p.saklarOn && p.saldoL > 0,
  nonaktif: (p) => !p.saklarOn || p.saldoL <= 0,
  "saldo-menipis": (p) => p.saldoL <= 5,
  offline: (p) => !p.online,
  insiden: (p) => p.adaInsiden,
};

const URUT: Record<string, (a: PelangganKonsol, b: PelangganKonsol) => number> =
  {
    nama: (a, b) => a.nama.localeCompare(b.nama, "id"),
    saldo: (a, b) => a.saldoL - b.saldoL,
    debit: (a, b) => b.debitLpm - a.debitLpm,
    zona: (a, b) => a.zona.localeCompare(b.zona, "id"),
  };

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const cari = (q.get("cari") ?? "").trim().toLowerCase();
  const zona = q.get("zona") ?? "";
  const saring = q.get("saring") ?? "";
  const urut = q.get("urut") ?? "nama";
  const arah = q.get("arah") === "turun" ? -1 : 1;
  const halaman = Math.max(1, Number(q.get("halaman") ?? 1) || 1);
  const perHalaman = Math.min(100, Math.max(10, Number(q.get("per") ?? 25) || 25));

  let hasil = semuaPelanggan();

  if (cari) {
    hasil = hasil.filter(
      (p) =>
        p.nama.toLowerCase().includes(cari) || p.id.toLowerCase().includes(cari),
    );
  }
  if (zona) hasil = hasil.filter((p) => p.zonaId === zona);
  if (saring && SARING[saring]) hasil = hasil.filter(SARING[saring]);

  /*
   * Jumlah keping penyaring dihitung dari hasil SETELAH pencarian dan zona,
   * tapi SEBELUM penyaring status itu sendiri.
   *
   * Kalau dihitung setelahnya, keping yang sedang aktif akan menampilkan
   * jumlahnya sendiri dan keping lain menampilkan nol — pengguna kehilangan
   * satu-satunya petunjuk ke mana harus pindah.
   */
  let dasar = semuaPelanggan();
  if (cari) {
    dasar = dasar.filter(
      (p) =>
        p.nama.toLowerCase().includes(cari) || p.id.toLowerCase().includes(cari),
    );
  }
  if (zona) dasar = dasar.filter((p) => p.zonaId === zona);

  const jumlahSaring = Object.fromEntries(
    Object.entries(SARING).map(([k, f]) => [k, dasar.filter(f).length]),
  );

  const pembanding = URUT[urut] ?? URUT.nama;
  hasil = [...hasil].sort((a, b) => pembanding(a, b) * arah);

  const total = hasil.length;
  const halamanTerakhir = Math.max(1, Math.ceil(total / perHalaman));
  const aman = Math.min(halaman, halamanTerakhir);
  const mulai = (aman - 1) * perHalaman;

  return NextResponse.json({
    baris: hasil.slice(mulai, mulai + perHalaman).map((p) => ({
      ...p,
      status: statusMeter(p) satisfies StatusMeter,
    })),
    total,
    halaman: aman,
    perHalaman,
    halamanTerakhir,
    jumlahSaring,
    jumlahStatus: hitungStatus(dasar),
    zona: ZONA_KONSOL.map((z) => ({ id: z.id, nama: z.nama })),
  });
}
