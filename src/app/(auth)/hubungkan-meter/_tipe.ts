export interface DataMeterDitemukan {
  id: string;
  serial: string;
  label?: string | null;
  alamat?: string | null;
  zona?: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: string;
  saklarOn: boolean;
}

export type Metode = "ketik" | "pindai";

export type IzinKamera = "belum" | "minta" | "diberikan" | "ditolak";
