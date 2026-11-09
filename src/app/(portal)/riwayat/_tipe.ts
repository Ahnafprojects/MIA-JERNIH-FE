export interface TransaksiBaris {
  id: string;
  meterId: string;
  jenis: "BELI" | "ISI_TOKEN";
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "LUNAS" | "MENUNGGU" | "GAGAL" | "KEDALUWARSA";
  token?: string | null;
  dibuatPada: string;
  dibayarPada?: string | null;
}
