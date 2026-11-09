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

export interface MeterApi {
  id: string;
  serial?: string | null;
  nomorSeri?: string | null;
  saldoL?: number | string | null;
  saldoLiter?: number | string | null;
  relay?: string | null;
  statusRelay?: string | null;
  zonaId?: string | null;
}

export interface MeterSingkat {
  id: string;
  nomorSeri: string;
  saldoLiter: number;
  statusRelay: "BUKA" | "TUTUP";
  statusKatup?: "NORMAL" | "KUNCI_DARURAT" | "BOCOR";
  zonaId?: string | null;
}

export function normalisasiMeter(data: MeterApi): MeterSingkat {
  const saldo = Number(data.saldoLiter ?? data.saldoL ?? 0);
  const relay = data.statusRelay ?? data.relay;

  return {
    id: data.id,
    nomorSeri: data.nomorSeri ?? data.serial ?? data.id,
    saldoLiter: Number.isFinite(saldo) ? saldo : 0,
    statusRelay: relay === "AKTIF" || relay === "BUKA" ? "BUKA" : "TUTUP",
    zonaId: data.zonaId ?? null,
  };
}

export function normalisasiDaftarMeter(data: MeterApi[]): MeterSingkat[] {
  return data.map(normalisasiMeter);
}

export interface SesiState {
  pengguna: Pengguna | null;
  meter: MeterSingkat[];
  meterAktif: MeterSingkat | null;
  memuat: boolean;
  accessToken: string | null;
}
