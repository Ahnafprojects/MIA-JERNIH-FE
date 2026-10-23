import Link from "next/link";
import { MerekJernih } from "@/components/layout/logo";
import { TombolTema } from "@/components/ui/tema";

const MENU = [
  { href: "/status", teks: "Status Layanan" },
  { href: "/lacak", teks: "Lacak Pengaduan" },
  { href: "/kinerja", teks: "Rapor Kinerja" },
  { href: "/statistik", teks: "Statistik" },
];

/**
 * Kerangka halaman publik — TANPA login.
 *
 * Ini lapisan yang membuat Jernih memenuhi temanya. Jangan pernah memasang
 * penjaga sesi di sini: begitu halaman publik ikut terkunci, pengunjung yang
 * belum punya akun hanya melihat formulir masuk, dan seluruh janji
 * transparansinya hilang.
 */
export default function LayoutPublik({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link href="/" aria-label="Jernih — beranda">
            <MerekJernih sub="Transparansi Layanan Air" />
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-muted hover:bg-soft hover:text-ink"
              >
                {m.teks}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <TombolTema className="rounded-lg p-2.5 text-muted hover:bg-soft hover:text-ink" />
            <Link
              href="/masuk"
              className="rounded-input bg-brand-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-700"
            >
              Masuk
            </Link>
          </div>
        </div>

        {/* Di layar sempit menu pindah ke baris sendiri yang bisa digeser,
            bukan disembunyikan ke dalam menu hamburger: halaman publik adalah
            inti produk, jadi tautannya harus selalu kelihatan. */}
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-5 py-2 md:hidden">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-muted hover:bg-soft"
            >
              {m.teks}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
          <div>
            <MerekJernih />
            <p className="mt-3 max-w-xs text-[13px] text-muted">
              Data pemakaian air dan kinerja layanan, terbuka untuk siapa pun.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3 text-muted">Transparansi</p>
            <ul className="space-y-2 text-[13.5px]">
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="text-muted hover:text-ink">
                    {m.teks}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3 text-muted">Pelanggan</p>
            <ul className="space-y-2 text-[13.5px]">
              <li>
                <Link href="/masuk" className="text-muted hover:text-ink">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="text-muted hover:text-ink">
                  Daftar akun
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line px-5 py-4 text-center text-[12.5px] text-muted">
          Jernih — platform transparansi layanan air.
        </div>
      </footer>
    </div>
  );
}
