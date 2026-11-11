export interface BarisAudit {
  id: string;
  aktorNama: string;
  aktorPeran: string | null;
  aksi: string;
  detail: string;
  tipe: string;
  ip: string;
  ts: string;
}

export const TIPE_AUDIT = ["RELAY", "TOKEN", "AKSES", "KONFIGURASI", "BROADCAST"];
