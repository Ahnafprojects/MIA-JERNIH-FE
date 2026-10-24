import Link from "next/link";
import { MerekJernih } from "@/components/layout/logo";
import { BilahAtas, type ButirMenu } from "./_bagian/bilah-atas";
import "./_bagian/bilah-atas.css";

const MENU: readonly ButirMenu[] = [
  { href: "/status", teks: "Status Layanan" },
  { href: "/lacak", teks: "Lacak Pengaduan" },
  { href: "/kinerja", teks: "Rapor Kinerja" },
  { href: "/statistik", teks: "Statistik" },
];

/*
 * Penanda "JavaScript hidup" di elemen akar.
 *
 * Dibaca `bilah-atas.css` untuk memutuskan apakah laci navigasi boleh
 * disembunyikan. Urutannya yang penting: skrip sebaris ini jalan saat HTML
 * diurai, jadi penandanya sudah terpasang sebelum bilah atas pernah
 * tergambar sekali pun. Tanpa itu, pengunjung ber-JavaScript melihat laci
 * terbentang sekejap pada setiap muat halaman.
 */
const PENANDA_JS = `document.documentElement.dataset.js="1"`;

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
      <script dangerouslySetInnerHTML={{ __html: PENANDA_JS }} />

      <BilahAtas menu={MENU} />

      <main className="flex-1">{children}</main>

      <footer className="lapis-endap border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
          <div>
            <MerekJernih />
            <p className="mt-3 max-w-xs text-[13px] text-muted">
              Data pemakaian air dan kinerja layanan, terbuka untuk siapa pun.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1 text-muted">Transparansi</p>
            {/*
              Tautan kaki halaman setinggi 44px, bukan setinggi barisnya.
              Diukur di ponsel, tinggi sasarannya cuma 16px — di bawah ambang
              target sentuh, dan justru di tempat yang paling sering ditekan
              dengan jempol sambil berdiri. Jarak antarbaris dihapus karena
              tinggi minimumnya sudah menggantikan perannya.
            */}
            <ul className="text-[13.5px]">
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="inline-flex min-h-11 min-w-11 items-center text-muted hover:text-ink"
                  >
                    {m.teks}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-1 text-muted">Pelanggan</p>
            <ul className="text-[13.5px]">
              <li>
                <Link
                  href="/masuk"
                  className="inline-flex min-h-11 min-w-11 items-center text-muted hover:text-ink"
                >
                  Masuk
                </Link>
              </li>
              <li>
                <Link
                  href="/daftar"
                  className="inline-flex min-h-11 min-w-11 items-center text-muted hover:text-ink"
                >
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
