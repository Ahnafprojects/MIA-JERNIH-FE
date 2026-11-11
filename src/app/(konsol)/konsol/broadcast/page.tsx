"use client";

import { useBroadcast } from "./_hooks/use-broadcast";
import { FormBroadcast } from "./_bagian/form-broadcast";
import { RiwayatPengiriman } from "./_bagian/riwayat-broadcast";

export default function HalamanBroadcast() {
  const b = useBroadcast();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Komunikasi Operasional</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Broadcast
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Kirim informasi layanan dengan konfirmasi penerima dan kanal yang
          jelas.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <FormBroadcast
          daftarZona={b.daftarZona}
          judul={b.judul}
          setJudul={b.setJudul}
          pesan={b.pesan}
          setPesan={b.setPesan}
          target={b.target}
          setTarget={b.setTarget}
          zona={b.zona}
          setZona={b.setZona}
          push={b.push}
          setPush={b.setPush}
          email={b.email}
          setEmail={b.setEmail}
          telegram={b.telegram}
          setTelegram={b.setTelegram}
          loading={b.loading}
          bisaKirim={b.bisaKirim}
          galat={b.galat}
          berhasil={b.berhasil}
          onKirim={b.kirim}
        />
        <RiwayatPengiriman riwayat={b.riwayat} />
      </div>
    </main>
  );
}
