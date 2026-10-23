/**
 * S06 — Beranda
 *
 * Saldo liter, debit live, pemakaian hari ini, grafik 7 hari, isi token cepat.
 *
 * BELUM DIKERJAKAN. Spesifikasi lengkap ada di issue GitHub repo ini.
 * Acuan rancangan: Aquantum `design/docs/03-website-admin.md` dan
 * `04-website-pelanggan.md` — isinya sama, tampilannya baru.
 */
export default function Halaman() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
        S06
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Beranda</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
        Saldo liter, debit live, pemakaian hari ini, grafik 7 hari, isi token cepat.
      </p>
      <p className="mt-8 rounded-xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-500 dark:border-slate-700">
        Halaman ini belum dikerjakan. Lihat issue GitHub untuk spesifikasinya.
      </p>
    </main>
  );
}
