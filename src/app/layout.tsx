import type { Metadata } from "next";
import { Fraunces, Public_Sans, JetBrains_Mono } from "next/font/google";
import { skripTema } from "@/components/ui/tema";
import { skripRingkas } from "./(konsol)/_ringkas";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-src",
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
    <html
      lang="id"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
        <script dangerouslySetInnerHTML={{ __html: skripRingkas }} />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
