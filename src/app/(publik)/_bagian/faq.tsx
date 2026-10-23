const ISI = [
  {
    t: "Apa bedanya dengan tagihan PDAM biasa?",
    j: "Pada sistem pascabayar, Anda baru tahu pemakaian di akhir bulan dan sulit memeriksanya. Di sini air dibeli lebih dulu dalam satuan liter, dan sisa saldo terlihat setiap saat — di aplikasi maupun di layar meter.",
  },
  {
    t: "Kalau saldo habis, air langsung mati?",
    j: "Meter memberi peringatan bertingkat lebih dulu: bunyi tiap 10 detik saat saldo tinggal 5 liter, tiap 2 detik saat 2 liter. Baru ketika benar-benar nol, aliran ditutup. Anda juga menerima pemberitahuan sebelum itu terjadi.",
  },
  {
    t: "Saya bukan pelanggan. Bisa lihat apa?",
    j: "Status layanan tiap zona, pelacakan pengaduan lewat nomor tiket, rapor kinerja penanganan, dan statistik distribusi air. Semuanya tanpa akun.",
  },
  {
    t: "Nomor pengaduan saya bisa dilacak orang lain?",
    j: "Halaman pelacakan hanya menampilkan status dan kronologi penanganan. Nama, alamat, dan kontak pelapor tidak pernah ditampilkan.",
  },
  {
    t: "Bagaimana kode token sampai ke meter?",
    j: "Setelah pembayaran lunas, kode token terbit dan dikirim ke email Anda. Kode itu diketik di keypad meter — tekan bintang, masukkan angkanya, lalu tekan A.",
  },
];

export function Faq() {
  return (
    <div className="mt-8 divide-y divide-line border-y border-line">
      {ISI.map((f) => (
        // <details> dipakai agar accordion tetap berfungsi tanpa JavaScript
        // dan sudah bisa dinavigasi papan ketik tanpa kode tambahan.
        <details key={f.t} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[15px] font-bold">
            {f.t}
            <span
              aria-hidden
              className="shrink-0 text-xl leading-none text-muted transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{f.j}</p>
        </details>
      ))}
    </div>
  );
}
