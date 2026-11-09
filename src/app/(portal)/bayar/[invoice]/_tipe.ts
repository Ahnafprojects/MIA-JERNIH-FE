export interface TransaksiInvoice {
  invoiceId: string;
  meterId: string;
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "MENUNGGU" | "LUNAS" | "KEDALUWARSA" | "DIBATALKAN";
  qrString?: string | null;
  nomorVa?: string | null;
  dibayarPada?: string | null;
  dibuatPada: string;
}
