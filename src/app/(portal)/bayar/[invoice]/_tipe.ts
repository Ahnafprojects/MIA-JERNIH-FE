export interface TransaksiInvoice {
  invoiceId: string;
  meterId: string;
  volumeL: number;
  jumlahRp: number;
  metode: string;
  /*
   * Persis empat nilai `StatusTransaksi` di `prisma/schema.prisma`.
   *
   * Sebelumnya berisi "DIBATALKAN" — yang TIDAK ADA di enum backend —
   * sekaligus melewatkan "GAGAL" yang benar-benar dikirim. Jadi pembayaran
   * yang gagal jatuh ke cabang yang tidak pernah diperhitungkan, sementara
   * satu nilai yang mustahil terus dijaga. Ketidakcocokan yang sama pernah
   * diperbaiki di halaman riwayat, lalu tertinggal lagi di sini.
   */
  status: "MENUNGGU" | "LUNAS" | "GAGAL" | "KEDALUWARSA";
  qrString?: string | null;
  nomorVa?: string | null;
  dibayarPada?: string | null;
  dibuatPada: string;
  /** Id token, untuk meminta kode utuhnya saat tab ini bukan tab pembelian. */
  tokenId?: string | null;
}
