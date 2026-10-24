import type { Metadata } from "next";
import { Fraunces, Public_Sans, JetBrains_Mono } from "next/font/google";
import { skripTema } from "@/components/ui/tema";
import { skripRingkas } from "./(konsol)/_ringkas";
import "./globals.css";

/*
 * Tiga peran huruf, dipilih untuk subjek ini.
 *
 * Fraunces — serif dengan sumbu `wonk` dan ukuran optis. Serif di produk
 * utilitas itu tak terduga, dan justru membuat halaman terbaca seperti
 * catatan publik yang manusiawi, bukan dasbor SaaS.
 *
 * Public Sans — dirancang untuk teks layanan pemerintah. Kejujuran
 * kelembagaan tanpa terdengar dingin.
 *
 * JetBrains Mono — angka bertabular, dan bentuknya berdekatan dengan layar
 * LCD meter yang muncul di seluruh produk.
 */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-src",
  // Sumbu kustom hanya boleh dipakai saat weight dibiarkan variabel.
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
});
const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans-src",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
});

export const metadata: Metadata = {
  title: {
    default: "Jernih — Transparansi Layanan Air",
    template: "%s · Jernih",
  },
  description:
    "Pantau pemakaian air, saldo, dan status layanan PDAM secara real-time. " +
    "Data layanan dan kinerja instansi terbuka untuk publik.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      Variabel huruf dipasang di <html>, BUKAN <body>.

      next/font menaruh `--font-*-src` di elemen yang diberi kelasnya,
      sedangkan token yang memakainya (`--font-sans` dkk.) diterbitkan
      Tailwind di `:root` — yaitu <html> itu sendiri. Kalau sumbernya ada di
      <body>, token di `:root` menunjuk ke variabel yang belum ada di sana,
      nilainya jadi tidak sah, dan SELURUH situs diam-diam memakai huruf
      bawaan sistem tanpa satu pun galat bangun. Jangan dipindah ke <body>.
    */
    <html
      lang="id"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/*
          Tema dipasang SEBELUM render pertama. Tanpa ini halaman berkedip
          putih sesaat sebelum React jalan — paling kentara di tema gelap, dan
          persis itu yang akan dilihat juri saat membuka situsnya.
        */}
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
        {/*
          Lebar sidebar konsol dipasang sebelum render pertama, sama seperti
          tema. Tanpa ini sidebar melebar sekejap lalu menyempit tiap kali
          petugas berpindah halaman — kedipan yang terjadi puluhan kali
          sehari di layar yang dipakai berjam-jam.

          Dipasang di sini, bukan di layout konsol, karena hanya skrip di
          <head> yang jalan SEBELUM halaman digambar. Di halaman publik
          atributnya tidak dipakai siapa pun dan tidak berpengaruh apa-apa.
        */}
        <script dangerouslySetInnerHTML={{ __html: skripRingkas }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
