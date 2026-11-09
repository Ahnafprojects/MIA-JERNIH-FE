export interface TokenBelumDipakai {
  id: string;
  kodeBertopeng: string;
  nilaiL: number;
  meterId?: string | null;
  kedaluwarsaPada: string;
  dibuatPada: string;
}

export interface HasilSukses {
  nilaiL: number;
  saldoBaruL: number;
  lcd?: { baris1: string; baris2: string };
}

export interface HasilGalat {
  pesan: string;
  lcdBaris1: string;
  lcdBaris2: string;
}
