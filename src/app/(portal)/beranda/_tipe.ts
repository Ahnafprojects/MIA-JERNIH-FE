export interface DataLiveMeter {
  meterId: string;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
  daring: boolean;
  ts: string;
}

export interface DeretPemakaian {
  waktu: string;
  volumeL: number;
}

export interface PesanTukar {
  tipe: "sukses" | "galat";
  teks: string;
}
