/**
 * Definisi tipe data sesi dan pengguna terautentikasi.
 */

export type PeranPengguna = "WARGA" | "OPERATOR" | "SUPERVISOR" | "TEKNISI";

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  peran: PeranPengguna;
  hp?: string | null;
  alamat?: string | null;
  zonaId?: string | null;
  golonganId?: string | null;
  ambangPeringatanL?: number;
}

export interface MeterSingkat {
  id: string;
  nomorSeri: string;
  saldoLiter: number;
  statusRelay: "BUKA" | "TUTUP";
  statusKatup?: "NORMAL" | "KUNCI_DARURAT" | "BOCOR";
  zonaId?: string | null;
}

export interface SesiState {
  pengguna: Pengguna | null;
  meter: MeterSingkat[];
  meterAktif: MeterSingkat | null;
  memuat: boolean;
  accessToken: string | null;
}
