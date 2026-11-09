/** Baris meter pada tabel armada `GET /api/admin/perangkat`. */
export interface MeterArmada {
  id: string;
  serial: string;
  label: string;
  zona: string | null;
  pelanggan: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: string;
  saklarOn: boolean;
  daring: boolean;
  versiFirmware: string;
}

/** Satu ubin KPI. Bentuknya dari server; label milik klien. */
export interface KpiPerangkat {
  key: string;
  label: string;
  value: number;
  unit?: string;
}

/** Meter yang butuh perhatian: saldo kritis atau luring. */
export interface PerluPerhatian {
  meterId: string;
  serial: string;
  masalah: string;
}

/** Formulir konfigurasi massal yang dikirim ke `/api/admin/konfigurasi-meter`. */
export interface FormKonfigurasi {
  ambangPeringatanL: number;
  ambangKritisL: number;
  kalibrasi: number;
  panjangToken: number;
  alasan: string;
}

/** Bentuk jawaban `GET /api/admin/perangkat`. */
export interface JawabanPerangkat {
  kpi: KpiPerangkat[];
  versiTerbaru: string;
  rows: MeterArmada[];
  perluPerhatian: PerluPerhatian[];
}
