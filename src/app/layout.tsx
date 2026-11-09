import type { Metadata } from "next";
import Script from "next/script";
import {
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import { skripTema } from "@/components/ui/tema";
import { skripRingkas } from "./(konsol)/_ringkas";

const PENANDA_JS = `document.documentElement.dataset.js="1"`;
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

/*
 * Tiga font, tiga tugas berbeda.
 *
 * Susunan lama — Fraunces + Public Sans + JetBrains Mono — ditinggalkan karena
 * satu alasan yang nyata: JetBrains Mono adalah font yang paling lekat dengan
 * antarmuka perkakas pengembang dan animasi AI, sehingga setiap angka di layar
 * langsung terbaca "dibuat mesin". Public Sans pun font bawaan pemerintah AS
 * yang netral tanpa watak.
 *
 * Penggantinya dipilih dengan alasan, bukan selera sesaat:
 *
 *   Bricolage Grotesque — grotesk editorial dengan karakter kuat pada judul.
 *     Tidak mungkin tertukar dengan font bawaan mana pun.
 *
 *   Plus Jakarta Sans — dirancang untuk identitas kota Jakarta. Untuk layanan
 *     publik air di Indonesia, asal-usul itu bukan kebetulan yang manis saja;
 *     ia membuat tipografinya punya cerita saat ditanya juri.
 *
 *   IBM Plex Mono — hanya untuk kode token, nomor meter, dan hal yang memang
 *     perlu lebar tetap. Wataknya kelembagaan, bukan terminal.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-src",
  weight: "variable",
  axes: ["opsz"],
});
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-src",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
  weight: ["400", "500", "600"],
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
    <html
      lang="id"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <Script id="jernih-penanda-js" strategy="beforeInteractive">
          {PENANDA_JS}
        </Script>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
        <script dangerouslySetInnerHTML={{ __html: skripRingkas }} />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
