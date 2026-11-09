export interface DataMeterDetail {
  id: string;
  serial: string;
  label?: string | null;
  alamat?: string | null;
  zona?: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: "AKTIF" | "NONAKTIF";
  saklarOn: boolean;
  daring: boolean;
  terakhirTerlihat?: string | null;
  versiFirmware?: string | null;
}

export interface LogMeter {
  ts: string;
  saldoL: number;
  debitLpm: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
}

export interface PesanAksi {
  tipe: "sukses" | "galat";
  teks: string;
}

export type ModalRelay = "buka" | "tutup" | null;
