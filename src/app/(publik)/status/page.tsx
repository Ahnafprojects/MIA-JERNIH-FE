/**
 * J02 — Status Layanan
 *
 * Peta status layanan air per zona: normal, gangguan, perbaikan. Tanpa login.
 *
 * BELUM DIKERJAKAN. Spesifikasi lengkap ada di issue GitHub repo ini.
 * Acuan rancangan: Aquantum `design/docs/03-website-admin.md` dan
 * `04-website-pelanggan.md` — isinya sama, tampilannya baru.
 */
export default function Halaman() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
        J02
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Status Layanan</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
        Peta status layanan air per zona: normal, gangguan, perbaikan. Tanpa login.
      </p>
      <p className="mt-8 rounded-xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-500 dark:border-slate-700">
        Halaman ini belum dikerjakan. Lihat issue GitHub untuk spesifikasinya.
      </p>
    </main>
  );
}
