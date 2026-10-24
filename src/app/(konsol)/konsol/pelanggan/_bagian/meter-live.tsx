"use client";

/**
 * Layar meter 16×2, hidup.
 *
 * Yang membuat halaman detail terbaca sebagai PEMANTAUAN dan bukan sebagai
 * laporan adalah satu hal: angkanya bergerak. Saldo pelanggan yang keran
 * airnya sedang terbuka benar-benar berkurang sebesar debitnya tiap detik,
 * dan volume tercatatnya bertambah sebesar itu juga. Dua baris LCD ini
 * menjelaskan apa itu meter prabayar lebih cepat daripada paragraf mana pun
 * — dan dua baris yang sama persis juga tampil di layar fisik di rumah
 * pelanggan.
 *
 * ── Yang dijaga ──────────────────────────────────────────────────────
 *
 * - **Saldo hanya turun bila air memang mengalir**, yaitu saklar ON, relay
 *   terbuka, debit > 0, dan meter masih online. Meter offline tidak sedang
 *   mengirim apa-apa; menggerakkan angkanya berarti mengarang data.
 * - **Berhenti di nol.** Saldo negatif bukan keadaan yang bisa terjadi di
 *   firmware; relay menutup lebih dulu.
 * - **`prefers-reduced-motion` tidak menghentikan angka ini.** Ini DATA,
 *   bukan animasi hiasan — menghentikannya menyembunyikan kenyataan. Yang
 *   dihormati setelan itu adalah gerak yang tidak membawa informasi.
 * - **Titik desimal, bukan koma.** Layar ini meniru firmware ESP32; lihat
 *   catatan di `src/lib/format.ts` dan `src/components/domain/lcd.tsx`.
 */

import { useEffect, useState } from "react";
import { LcdDisplay } from "@/components/domain/lcd";
import { lcdUtama } from "@/lib/format";

const SEDETIK = 1000;

export interface BacaanLive {
  saldoL: number;
  volumeL: number;
  mengalir: boolean;
}

/**
 * Bacaan meter yang berjalan sendiri dari nilai terakhir yang dikirim server.
 *
 * Ini INTERPOLASI, bukan telemetri baru: antara dua laporan meter, satu-
 * satunya hal yang bisa diketahui konsol adalah debit terakhirnya.
 *
 * ── Cara nilainya disetel ulang ──────────────────────────────────────
 *
 * TIDAK dengan menyamakan state ke prop di dalam render. Komponen yang
 * memakainya dipasangi `key` berisi id pelanggan, jadi berpindah ke
 * pelanggan lain MEMBONGKAR komponennya dan seluruh angka di sini mulai
 * lagi dari nilai server yang baru. Satu baris `key` menggantikan sepasang
 * ref pembanding, dan tidak ada satu bingkai pun yang sempat menampilkan
 * saldo orang sebelumnya.
 */
export function useBacaanLive(
  saldoAwalL: number,
  volumeAwalL: number,
  debitLpm: number,
  mengalir: boolean,
): BacaanLive {
  const [saldoL, setSaldoL] = useState(saldoAwalL);
  const [volumeL, setVolumeL] = useState(volumeAwalL);

  useEffect(() => {
    if (!mengalir || debitLpm <= 0) return;
    const perDetik = debitLpm / 60;

    const jam = setInterval(() => {
      setSaldoL((s) => Math.max(0, s - perDetik));
      setVolumeL((v) => v + perDetik);
    }, SEDETIK);

    return () => clearInterval(jam);
  }, [mengalir, debitLpm]);

  return { saldoL, volumeL, mengalir };
}

export function LayarMeterLive({
  saldoL,
  volumeL,
  debitLpm,
  saklarOn,
  mengalir,
}: {
  saldoL: number;
  volumeL: number;
  debitLpm: number;
  saklarOn: boolean;
  mengalir: boolean;
}) {
  const [baris1, baris2] = lcdUtama(
    saldoL,
    saklarOn,
    mengalir ? debitLpm : 0,
    volumeL,
  );

  return (
    <div>
      <LcdDisplay baris1={baris1} baris2={baris2} />
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Arti kode="S" arti="Saldo (L)" />
        <Arti kode="D" arti="Debit (L/mnt)" />
        <Arti kode="V" arti="Volume 30 hari (L)" />
      </dl>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        {mengalir
          ? "Air sedang mengalir. Angka di layar berjalan dari debit terakhir yang dilaporkan meter, dan disetel ulang tiap kali telemetri baru masuk."
          : saklarOn
            ? "Tidak ada aliran saat ini. Angka diam sampai keran dibuka."
            : "Saklar meter dalam posisi OFF. Tidak ada air yang bisa mengalir."}
      </p>
    </div>
  );
}

function Arti({ kode, arti }: { kode: string; arti: string }) {
  return (
    <div className="border-t border-line pt-1.5">
      <dt className="tabular font-mono text-[12px] font-bold">{kode}</dt>
      <dd className="mt-0.5 text-[11px] leading-snug text-muted">{arti}</dd>
    </div>
  );
}
