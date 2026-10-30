"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import type { PeranPengguna } from "./auth-tipe";
import { Halaman403 } from "@/components/ui/halaman-403";

interface PenjagaRuteProps {
  children: React.ReactNode;
  peranDiizinkan?: PeranPengguna[];
}

export function PenjagaRute({ children, peranDiizinkan }: PenjagaRuteProps) {
  const { pengguna, memuat } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!memuat && !pengguna) {
      router.replace("/masuk");
    }
  }, [memuat, pengguna, router]);

  // Saat memuat awal sesi, tampilkan overlay pemeriksa sesi tanpa membuang (drop) children dari DOM tree
  if (memuat) {
    return (
      <div className="relative min-h-[60vh]">
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-canvas/80 backdrop-blur-xs text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-4 font-mono text-xs tracking-wider text-muted uppercase">
            Memeriksa sesi...
          </p>
        </div>
        <div className="pointer-events-none opacity-0" aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  // Jika tidak ada sesi login, tampilkan fallback aman sambil menunggu pengalihan ke /masuk
  if (!pengguna) {
    return (
      <div className="relative min-h-[60vh]">
        <div className="pointer-events-none opacity-0" aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  // Jika peran tidak diizinkan, tampilkan halaman 403 penjelas
  if (peranDiizinkan && !peranDiizinkan.includes(pengguna.peran)) {
    return (
      <Halaman403
        peranPengguna={pengguna.peran}
        peranDibutuhkan={peranDiizinkan}
      />
    );
  }

  return <>{children}</>;
}
