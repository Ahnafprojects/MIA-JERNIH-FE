"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  KeyRound,
  BarChart2,
  History,
  Droplets,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { liter } from "@/lib/format";
import { useState, useRef, useEffect } from "react";

export const MENU_PORTAL = [
  { href: "/beranda", label: "Beranda", Ikon: Home },
  { href: "/beli", label: "Beli Token", Ikon: CreditCard },
  { href: "/token", label: "Isi Token", Ikon: KeyRound },
  { href: "/pemakaian", label: "Pemakaian", Ikon: BarChart2 },
  { href: "/riwayat", label: "Riwayat", Ikon: History },
];

export function NavPortal({ onPilih }: { onPilih?: () => void }) {
  const path = usePathname();

  return (
    <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1.5">
      {MENU_PORTAL.map(({ href, label, Ikon }) => {
        const aktif = path === href || (href !== "/beranda" && path.startsWith(href));
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onPilih}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-[13.5px] font-medium transition-colors motion-reduce:transition-none",
                aktif
                  ? "bg-brand-500/10 text-brand-700 font-semibold dark:text-accent"
                  : "text-muted hover:bg-soft hover:text-ink",
              )}
            >
              <Ikon size={16} aria-hidden />
              <span>{label}</span>
              {aktif ? (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-3 right-3 hidden h-[2px] bg-brand-500 md:block dark:bg-accent"
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function PemilihMeter() {
  const { meter, meterAktif, pilihMeter } = useAuth();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBuka(false);
      }
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  if (!meter || meter.length === 0) {
    return (
      <Link
        href="/hubungkan-meter"
        className="flex items-center gap-1.5 rounded-[3px] border border-dashed border-brand-500/40 bg-brand-500/5 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-500/10 dark:text-accent"
      >
        <Droplets size={14} />
        <span>Hubungkan Meter</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
        className="flex items-center gap-2 rounded-[3px] border border-line bg-surface px-2.5 py-1.5 text-xs text-ink hover:border-brand-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="grid size-5 place-items-center rounded-full bg-brand-500/10 text-brand-600 dark:text-accent">
          <Droplets size={12} />
        </span>
        <div className="flex flex-col text-left">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
            {meterAktif?.nomorSeri ?? "Pilih Meter"}
          </span>
          <span className="font-mono text-[12px] font-bold text-ink">
            {meterAktif ? liter(meterAktif.saldoLiter) : "—"}
          </span>
        </div>
        {meter.length > 1 ? (
          <ChevronDown size={14} className="text-muted ml-0.5" />
        ) : null}
      </button>

      {buka && meter.length > 1 ? (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-[3px] border border-line bg-surface p-1 shadow-lg">
          <p className="px-2 py-1 font-mono text-[10px] uppercase text-muted tracking-wider">
            Pilih Meter Anda
          </p>
          <ul className="space-y-0.5">
            {meter.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    pilihMeter(m.id);
                    setBuka(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[2px] px-2 py-1.5 text-xs",
                    m.id === meterAktif?.id
                      ? "bg-brand-500/10 font-bold text-brand-700 dark:text-accent"
                      : "text-ink hover:bg-soft",
                  )}
                >
                  <span className="font-mono">{m.nomorSeri}</span>
                  <span className="font-mono text-muted">{liter(m.saldoLiter)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AvatarMenu() {
  const { pengguna, keluar } = useAuth();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBuka(false);
      }
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
        className="flex size-9 items-center justify-center rounded-[3px] border border-line bg-soft text-ink hover:border-brand-500/40"
        aria-label="Menu profil"
      >
        <User size={16} />
      </button>

      {buka ? (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-[3px] border border-line bg-surface p-1 shadow-lg">
          <div className="border-b border-line px-2.5 py-2">
            <p className="truncate text-xs font-semibold text-ink">{pengguna?.nama}</p>
            <p className="truncate text-[11px] text-muted">{pengguna?.email}</p>
          </div>

          <div className="p-1">
            <Link
              href="/akun"
              onClick={() => setBuka(false)}
              className="flex items-center gap-2 rounded-[2px] px-2 py-1.5 text-xs text-ink hover:bg-soft"
            >
              <User size={14} className="text-muted" />
              <span>Pengaturan Akun</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setBuka(false);
                keluar();
              }}
              className="flex w-full items-center gap-2 rounded-[2px] px-2 py-1.5 text-xs text-danger hover:bg-danger/10"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
