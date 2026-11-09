/** Baris riwayat token `GET /api/admin/token`. */
export interface TokenRow {
  id: string;
  kodeBertopeng: string;
  nilaiL: number;
  status: string;
  meterId: string | null;
  kedaluwarsaPada: string;
  dibuatPada: string;
}

/** Kode yang baru diterbitkan — hanya tampil sekali. */
export interface TokenTerbit {
  kode: string;
  nilaiL: number;
}

/** Bentuk jawaban `GET /api/admin/token`. */
export interface JawabanToken {
  kpi: { key: string; value: number }[];
  rows: TokenRow[];
}
