import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-src",
  weight: ["600", "700", "800"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-src" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-src" });

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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
