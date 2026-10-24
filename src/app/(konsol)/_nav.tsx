"use client";

/**
 * Bagian konsol yang bergantung pada RUTE SAAT INI.
 *
 * Dipisahkan dari `layout.tsx` bukan demi kerapian, melainkan karena
 * `usePathname()` adalah data runtime: Next.js 16 menolak memprarender
 * halaman yang memanggilnya di luar `<Suspense>`, dan seluruh build gagal
 * dengan `CLIENT_HOOK_DYNAMIC` — bukan peringatan, tapi build berhenti.
 *
 * Dengan dipisah, kerangka konsol tetap bisa diprarender dan hanya dua
 * potong kecil ini yang menyusul saat jalan. Cadangannya pun bukan kekosongan:
 * daftar menu tetap LENGKAP DAN BISA DIKLIK, yang belum ada hanya penanda
 * halaman aktifnya. Navigasi yang hilang sesaat jauh lebih merugikan daripada
 * penanda yang terlambat sepersekian detik.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  FileText,
  Gauge,
  KeyRound,
  Map as MapIcon,
  Megaphone,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useRingkas } from "./_ringkas";

export const MENU = [
  { href: "/konsol", label: "Dashboard", Ikon: Gauge },
  { href: "/konsol/pelanggan", label: "Pelanggan", Ikon: Users },
  { href: "/konsol/peta", label: "Peta jaringan", Ikon: MapIcon },
  { href: "/konsol/insiden", label: "Insiden", Ikon: Activity },
  { href: "/konsol/laporan", label: "Laporan", Ikon: FileText },
  { href: "/konsol/perangkat", label: "Perangkat", Ikon: Gauge },
  { href: "/konsol/token", label: "Token", Ikon: KeyRound },
  { href: "/konsol/broadcast", label: "Broadcast", Ikon: Megaphone },
  { href: "/konsol/analitik", label: "Analitik", Ikon: BarChart3 },
  { href: "/konsol/audit", label: "Audit", Ikon: ScrollText },
  { href: "/konsol/pengaturan", label: "Pengaturan", Ikon: Settings },
];

/**
 * `/konsol` dicocokkan PERSIS, sisanya boleh berawalan.
 *
 * Tanpa pengecualian itu Dashboard tampak aktif di seluruh konsol, karena
 * setiap rute lain diawali `/konsol` — dan penanda yang selalu menyala sama
 * saja dengan tidak ada penanda.
 */
function aktifkah(href: string, path: string): boolean {
  return href === "/konsol" ? path === "/konsol" : path.startsWith(href);
}

function Baris({
  href,
  label,
  Ikon,
  aktif,
  ringkas,
  onPilih,
}: {
  href: string;
  label: string;
  Ikon: typeof Gauge;
  aktif: boolean;
  ringkas: boolean;
  onPilih: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        /*
          Saat diringkas, labelnya DISEMBUNYIKAN SECARA VISUAL (`sr-only`),
          bukan dihapus. Tautan yang isinya cuma ikon tidak punya nama bagi
          pembaca layar, dan menu konsol yang tak terbaca sama saja dengan
          tidak ada menu. `title` menambahkan tooltip untuk pengguna tetikus.
        */
        title={ringkas ? label : undefined}
        /*
          Laci ditutup DI SINI, bukan lewat effect pada perubahan rute.
          Keduanya terlihat sama, tapi menutup lewat effect berarti memanggil
          setState sebagai reaksi terhadap render. Menutupnya saat ditekan
          juga lebih jujur: itu akibat langsung tindakan penggunanya.
        */
        onClick={onPilih}
        aria-current={aktif ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-[3px] text-[13.5px] font-medium",
          ringkas ? "justify-center px-0" : "px-3",
          "transition-colors motion-reduce:transition-none",
          aktif
            ? "bg-console-2 text-on-console"
            : "text-on-console-muted hover:bg-console-2/60 hover:text-on-console",
        )}
      >
        {/* Garis takar tegak menandai halaman aktif — motif yang sama dipakai
            lencana dan sisi kolom air. Penanda aktif wajib punya BENTUK, bukan
            warna saja. */}
        <span
          aria-hidden
          className={cn(
            "h-5 w-[2px] shrink-0 rounded-full",
            ringkas && "hidden",
            aktif ? "bg-accent" : "bg-transparent",
          )}
        />
        <Ikon size={16} aria-hidden className="shrink-0" />
        <span className={cn(ringkas && "sr-only")}>{label}</span>
      </Link>
    </li>
  );
}

/** Daftar menu TANPA penanda aktif — dipakai sebagai cadangan Suspense. */
export function NavKonsolRangka() {
  return (
    <ul className="space-y-0.5">
      {MENU.map((m) => (
        <Baris key={m.href} {...m} aktif={false} ringkas={false} onPilih={() => {}} />
      ))}
    </ul>
  );
}

export function NavKonsol({ onPilih }: { onPilih: () => void }) {
  const path = usePathname();
  const ringkas = useRingkas();
  return (
    <ul className="space-y-0.5">
      {MENU.map((m) => (
        <Baris
          key={m.href}
          {...m}
          aktif={aktifkah(m.href, path)}
          ringkas={ringkas}
          onPilih={onPilih}
        />
      ))}
    </ul>
  );
}

export function JudulKonsol() {
  const path = usePathname();
  return <>{MENU.find((m) => aktifkah(m.href, path))?.label ?? "Konsol"}</>;
}
