import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "./button";
import type { PeranPengguna } from "@/lib/auth-tipe";

const NAMA_PERAN: Record<PeranPengguna, string> = {
  WARGA: "Warga",
  OPERATOR: "Operator PDAM",
  SUPERVISOR: "Supervisor PDAM",
  TEKNISI: "Teknisi Lapangan",
};

export function Halaman403({
  peranPengguna,
  peranDibutuhkan,
}: {
  peranPengguna: PeranPengguna;
  peranDibutuhkan?: PeranPengguna[];
}) {
  const tujuanAwal = peranPengguna === "WARGA" ? "/beranda" : "/konsol";
  const namaDibutuhkan = peranDibutuhkan
    ? peranDibutuhkan.map((p) => NAMA_PERAN[p]).join(" atau ")
    : "Peran khusus";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="grid size-16 place-items-center rounded-[3px] border border-warn/30 bg-warn/10 text-warn">
          <ShieldAlert size={32} aria-hidden />
        </div>
        <div className="absolute -bottom-2 -right-2 rounded-[2px] bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-canvas">
          403
        </div>
      </div>

      <p className="font-mono text-xs font-semibold tracking-wider text-warn uppercase">
        Akses Dibatasi
      </p>

      <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl text-balance">
        Anda tidak memiliki izin membuka halaman ini
      </h1>

      <div className="takar-kepala mx-auto my-6 w-full max-w-md pt-6 text-sm text-muted">
        <p>
          Akun Anda saat ini terdaftar sebagai{" "}
          <strong className="text-ink font-semibold">
            {NAMA_PERAN[peranPengguna]}
          </strong>
          , sedangkan area ini hanya dapat diakses oleh{" "}
          <strong className="text-ink font-semibold">{namaDibutuhkan}</strong>.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={tujuanAwal}>
          <Button varian="sekunder" type="button">
            <Home size={16} />
            Kembali ke {peranPengguna === "WARGA" ? "Beranda" : "Konsol"}
          </Button>
        </Link>
        <Link href="/">
          <Button varian="halus" type="button">
            <ArrowLeft size={16} />
            Halaman Publik
          </Button>
        </Link>
      </div>
    </div>
  );
}
