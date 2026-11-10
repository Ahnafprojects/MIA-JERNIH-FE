/**
 * Peran petugas yang sedang masuk, dibaca dari sesi.
 *
 * ──────────────────────────────────────────────────────────────────────
 * INI BUKAN KEAMANAN. Jangan pernah memperlakukannya sebagai keamanan.
 * ──────────────────────────────────────────────────────────────────────
 *
 * Sebelumnya nilainya konstanta `"ADMIN"` untuk semua orang, ditulis saat
 * sesi belum ada. Akibatnya teknisi melihat tombol tutup aliran massal, dan
 * dialog konfirmasi menulis "(peran Admin)" untuk petugas mana pun. Sesi
 * sungguhan sudah lama tersedia lewat `useAuth()`, jadi peran diambil dari
 * sana.
 *
 * Yang dilakukan berkas ini hanya MENYEMBUNYIKAN tombol, supaya petugas
 * tidak menyiapkan aksi untuk belasan pelanggan lalu baru ditolak server.
 * Penolakan yang berlaku tetap di backend (`wajibPeran` di
 * src/middleware/sesi.ts).
 */
import { useAuth } from "@/lib/auth-context";
import type { PeranPengguna } from "@/lib/auth-tipe";

export type Peran = PeranPengguna;

export const LABEL_PERAN: Record<Peran, string> = {
  WARGA: "Warga",
  OPERATOR: "Operator",
  SUPERVISOR: "Supervisor",
  TEKNISI: "Teknisi",
};

/** Peran petugas dari sesi, atau `null` saat sesi belum termuat. */
export function usePeranPetugas(): Peran | null {
  return useAuth().pengguna?.peran ?? null;
}

/**
 * Teknisi mengerjakan perangkat di lapangan, bukan keputusan layanan.
 * Menutup aliran belasan rumah sekaligus adalah keputusan layanan.
 */
export const bolehTutupRelayMassal = (peran: Peran | null): boolean =>
  peran === "OPERATOR" || peran === "SUPERVISOR";
