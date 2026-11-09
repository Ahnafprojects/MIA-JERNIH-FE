"use client";

import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { useVerifikasi } from "./_hooks/use-verifikasi";
import { FormKode } from "./_bagian/form-kode";
import { KirimUlang } from "./_bagian/kirim-ulang";

function KontenVerifikasi() {
  const verifikasi = useVerifikasi();

  return (
    <AuthShell
      judul="Verifikasi Email Anda"
      keterangan={`Kami mengirimkan 6 digit kode rahasia ke alamat ${verifikasi.email || "email Anda"}.`}
    >
      <StepperAuth langkahAktif={2} />

      {verifikasi.pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {verifikasi.pesanGalat}
        </div>
      ) : null}

      <FormKode
        kode={verifikasi.kode}
        setKode={verifikasi.setKode}
        memuat={verifikasi.memuat}
        onSubmit={verifikasi.handleVerifikasi}
      />

      <KirimUlang
        bisaKirimUlang={verifikasi.bisaKirimUlang}
        hitungMundur={verifikasi.hitungMundur}
        sedangKirimUlang={verifikasi.sedangKirimUlang}
        onKirimUlang={verifikasi.handleKirimUlang}
      />
    </AuthShell>
  );
}

export default function HalamanVerifikasi() {
  return (
    <Suspense fallback={null}>
      <KontenVerifikasi />
    </Suspense>
  );
}
