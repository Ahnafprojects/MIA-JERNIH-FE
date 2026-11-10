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
  /** `null` bila server tidak mengirim saldo. Tampil "—", bukan 0. */
  saldoLiter: number | null;
  statusRelay: "BUKA" | "TUTUP";
  statusKatup?: "NORMAL" | "KUNCI_DARURAT" | "BOCOR";
  zonaId?: string | null;
}

export function normalisasiMeter(data: MeterApi): MeterSingkat {
  /*
   * Saldo yang tidak dikirim menjadi `null`, bukan 0. Nol adalah hasil
   * pengukuran ("saldo Anda habis"), sedangkan yang terjadi di sini adalah
   * ketiadaan data. Menyamakan keduanya menampilkan "0 L" di pemilih meter
   * pada warga yang saldonya sebenarnya penuh.
   */
  const mentah = data.saldoLiter ?? data.saldoL;
  const saldo = mentah === null || mentah === undefined ? NaN : Number(mentah);
  const relay = data.statusRelay ?? data.relay;

  return {
    id: data.id,
    nomorSeri: data.nomorSeri ?? data.serial ?? data.id,
    saldoLiter: Number.isFinite(saldo) ? saldo : null,
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
