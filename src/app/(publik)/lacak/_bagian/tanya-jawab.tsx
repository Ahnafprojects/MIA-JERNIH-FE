/**
 * Pertanyaan yang betul-betul muncul di meja pengaduan — bukan daftar fitur
 * yang disamarkan jadi pertanyaan.
 *
 * `<details>` dipertahankan apa adanya: tanpa JavaScript pun tetap membuka dan
 * sudah bisa dinavigasi papan ketik. Kelas `faq-isi` hanya menambahkan
 * transisi tinggi (lihat `globals.css`); mesin render yang belum mengenal
 * `::details-content` hanya kehilangan transisinya, bukan isinya.
 *
 * Nomor telepon sengaja TIDAK ditulis ulang di sini. Ia hanya ada di satu
 * tempat — data kanal pelaporan — supaya tidak ada dua nomor berbeda di satu
 * halaman saat salah satunya terlupa diperbarui.
 */
const ISI: { t: string; j: string }[] = [
  {
    t: "Nomor pengaduan saya hilang, bagaimana?",
    j: "Hubungi kanal yang sama dengan tempat Anda melapor dan sebutkan nomor sambungan pelanggan atau alamat rumah — petugas akan membacakan kembali nomor pengaduannya. Nomor tidak pernah terbit dua kali untuk laporan yang sama, jadi melapor ulang justru memperlambat: laporan kembar digabung dan waktunya tetap dihitung sejak laporan pertama.",
  },
  {
    t: "Kenapa laporan saya belum ditangani?",
    j: 'Periksa kronologinya lebih dulu. Status "Sedang ditangani" berarti petugas sudah ditugaskan meskipun belum ada orang yang terlihat di depan rumah — pada kebocoran pipa induk, pekerjaan sering dimulai dari titik lain di jaringan yang sama. Kalau kronologinya masih berhenti di "Diverifikasi" padahal sudah lewat beberapa jam, laporkan nomornya lewat kanal telepon.',
  },
  {
    t: "Kalau sudah lewat dari janji waktunya?",
    j: 'Halaman ini akan menuliskannya sebagai "Melewati batas" beserta selisihnya, dan laporan Anda tetap dihitung dalam rapor kinerja sebagai keterlambatan — tidak dikeluarkan dari hitungan. Laporan yang melewati batas naik ke antrean prioritas dan ditinjau penyelia keesokan harinya. Anda berhak meminta keterangan tertulis atas keterlambatannya lewat kanal telepon atau kantor pelayanan.',
  },
  {
    t: "Apakah bisa menambahkan foto setelah melapor?",
    j: "Bisa. Kirim fotonya lewat WhatsApp dengan menyebut nomor pengaduan pada pesan yang sama, atau lampirkan dari akun Jernih Anda. Foto tambahan masuk ke berkas laporan yang sudah ada dan tidak membuat nomor baru — jadi janji waktunya tidak ikut mundur.",
  },
  {
    t: 'Statusnya sudah "Selesai", tetapi masalahnya kembali.',
    j: "Laporkan dengan menyebut nomor yang sama. Keluhan berulang dalam 7 hari sejak laporan ditutup dibuka kembali di bawah nomor yang sama, bukan sebagai laporan baru — supaya riwayatnya tetap satu berkas dan penanganan pertama tidak terhitung berhasil.",
  },
  {
    t: "Apakah orang lain bisa melihat laporan saya?",
    j: "Siapa pun yang memegang nomor pengaduan bisa melihat status dan kronologinya, dan memang begitu rancangannya supaya ketua RT atau anggota keluarga bisa ikut memantau. Yang tidak pernah ditampilkan adalah nama, alamat, nomor sambungan, dan kontak pelapor — nomor pengaduan cukup untuk melacak, tetapi tidak cukup untuk mengetahui siapa yang melapor.",
  },
];

export function TanyaJawab() {
  return (
    <section className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
        Pertanyaan yang sering muncul
      </h2>

      <div className="mt-5 divide-y divide-line border-t border-line">
        {ISI.map((f) => (
          <details key={f.t} className="faq-isi group">
            {/* Jarak tegaknya ada di SUMMARY, bukan di `details`.
                Dengan padding di pembungkusnya, yang bisa diketuk hanya
                setinggi barisnya sendiri — 25px di ponsel, separuh dari
                target sentuh yang layak, dan ruang kosong di atas serta di
                bawah judulnya justru mati. Dipindahkan ke sini, seluruh pita
                judul ikut menjadi sasaran ketukan. */}
            <summary className="flex min-h-11 cursor-pointer list-none items-baseline justify-between gap-5 py-5 font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
              {f.t}
              <span
                aria-hidden
                className="shrink-0 text-xl leading-none text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="-mt-1 max-w-[70ch] pb-5 text-[14px] leading-[1.7] text-muted">
              {f.j}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
