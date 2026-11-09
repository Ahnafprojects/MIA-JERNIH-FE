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
  /**
   * Id token, bukan kodenya.
   *
   * Kode utuh TIDAK pernah ikut di daftar transaksi — server hanya
   * mengirimkannya lewat `GET /api/token/:id/kode`, satu per satu, dan
   * hanya kepada pemiliknya selama token belum dipakai. Tanpa id ini struk
   * tidak punya cara meminta kodenya.
   */
  tokenId?: string | null;
}
