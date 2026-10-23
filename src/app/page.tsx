/**
 * J01 — Landing publik Jernih.
 *
 * Halaman PERTAMA yang dilihat juri, dan satu-satunya halaman yang namanya
 * disebut sebagai syarat screenshot di guidebook. Isi lengkapnya ada di issue
 * "Landing page" — berkas ini baru kerangkanya.
 */
import Link from "next/link";

const PINTASAN = [
  { href: "/status", judul: "Status Layanan", teks: "Zona mana yang sedang terganggu, dan perkiraan pulihnya." },
  { href: "/lacak", judul: "Lacak Pengaduan", teks: "Masukkan nomor tiket, lihat siapa yang menangani." },
  { href: "/kinerja", judul: "Rapor Kinerja", teks: "Ketepatan SLA dan waktu tanggap, dipublikasikan apa adanya." },
  { href: "/statistik", judul: "Statistik Terbuka", teks: "Distribusi air dan kehilangan air per zona." },
];

export default function Beranda() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        Transparansi Layanan Air
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[1.1] tracking-tight">
        Air jernih. Layanannya juga.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Selama ini warga baru tahu pemakaian airnya di akhir bulan, lewat angka
        yang tidak bisa diperiksa. Jernih menampilkan angka yang sama persis ke
        warga dan ke petugas — saat itu juga.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/masuk"
          className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white"
        >
          Masuk
        </Link>
        <Link
          href="/status"
          className="rounded-xl border border-line px-6 py-3 font-semibold"
        >
          Lihat status layanan
        </Link>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PINTASAN.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-card border border-line bg-surface p-5 transition hover:border-brand-300"
          >
            <h2 className="font-display font-bold">{p.judul}</h2>
            <p className="mt-1.5 text-sm text-muted">{p.teks}</p>
          </Link>
        ))}
      </div>

      <p className="mt-16 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-muted">
        Landing ini baru kerangka. Spesifikasi lengkapnya ada di issue
        &ldquo;Landing page&rdquo;.
      </p>
    </main>
  );
}
