"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { useDaftar } from "./_hooks/use-daftar";
import { FormDaftar } from "./_bagian/form-daftar";

export default function HalamanDaftar() {
  const daftar = useDaftar();

  return (
    <AuthShell
      judul="Daftar Akun Warga"
      keterangan="Pantau debit dan isi saldo air rumah Anda secara transparan."
    >
      <StepperAuth langkahAktif={1} />

      {daftar.pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {daftar.pesanGalat}
        </div>
      ) : null}

      <FormDaftar
        nama={daftar.nama}
        setNama={daftar.setNama}
        email={daftar.email}
        setEmail={daftar.setEmail}
        hp={daftar.hp}
        setHp={daftar.setHp}
        kataSandi={daftar.kataSandi}
        setKataSandi={daftar.setKataSandi}
        setujuSyarat={daftar.setujuSyarat}
        setSetujuSyarat={daftar.setSetujuSyarat}
        lihatSandi={daftar.lihatSandi}
        setLihatSandi={daftar.setLihatSandi}
        memuat={daftar.memuat}
        syarat={daftar.syarat}
        onSubmit={daftar.handleDaftar}
      />
    </AuthShell>
  );
}
