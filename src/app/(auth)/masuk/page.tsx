"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useMasuk } from "./_hooks/use-masuk";
import { FormMasuk } from "./_bagian/form-masuk";
import { FormOtp } from "./_bagian/form-otp";

export default function HalamanMasuk() {
  const masuk = useMasuk();

  return (
    <AuthShell
      judul={masuk.butuhKode ? "Verifikasi Perangkat Baru" : "Masuk ke Jernih"}
      keterangan={
        masuk.butuhKode
          ? `Perangkat ini baru pertama kali digunakan. Masukkan 6 digit kode yang dikirim ke email ${masuk.email}.`
          : "Satu pintu masuk untuk seluruh peran warga dan petugas."
      }
    >
      {masuk.pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          {masuk.pesanGalat}
        </div>
      ) : null}

      {!masuk.butuhKode ? (
        <FormMasuk
          email={masuk.email}
          setEmail={masuk.setEmail}
          kataSandi={masuk.kataSandi}
          setKataSandi={masuk.setKataSandi}
          ingat={masuk.ingat}
          setIngat={masuk.setIngat}
          lihatSandi={masuk.lihatSandi}
          setLihatSandi={masuk.setLihatSandi}
          memuat={masuk.memuat}
          onSubmit={masuk.handleMasuk}
        />
      ) : (
        <FormOtp
          kodeDigit={masuk.kodeDigit}
          setKodeDigit={masuk.setKodeDigit}
          memuat={masuk.memuat}
          onSubmit={masuk.handleVerifikasiKodeMasuk}
          onKembali={masuk.kembaliKeFormulir}
        />
      )}
    </AuthShell>
  );
}
