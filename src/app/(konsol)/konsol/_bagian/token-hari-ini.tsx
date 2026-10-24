"use client";

/**
 * Token yang terbit hari ini.
 *
 * `tokenHariIni` adalah ANGKA, bukan objek — rinciannya datang terpisah di
 * `tokenHariIniDetail`. Membacanya sebagai objek adalah persis kesalahan
 * yang dulu membuat kartu KPI menampilkan `NaN` berhari-hari, jadi angkanya
 * dilewatkan `angkaSah()` sebelum sampai ke layar.
 *
 * Jumlah total TIDAK dihitung ulang dari rinciannya. Kalau suatu hari
 * keduanya berselisih, halaman mengakuinya sendiri lewat baris terakhir
 * alih-alih diam-diam menampilkan angka yang terasa konsisten padahal
 * salah satunya salah.
 */

import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { BarMini } from "@/components/domain/grafik";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { angka } from "@/lib/format";
import { angkaSah, type TokenZona } from "./tipe";

export function TokenHariIni({
  total,
  rincian,
  memuat,
}: {
  total: number | null;
  rincian: TokenZona[] | undefined;
  memuat: boolean;
}) {
  if (memuat) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const baris = (rincian ?? []).map((t) => ({
    zona: t.zona,
    jumlah: angkaSah(t.jumlah),
  }));
  const maks = baris.reduce((m, b) => Math.max(m, b.jumlah ?? 0), 0);
  const jumlahRincian = baris.reduce((t, b) => t + (b.jumlah ?? 0), 0);
  const selisih = total !== null && baris.length > 0 && jumlahRincian !== total;

  return (
    <div className="p-5">
      <p className="flex items-baseline gap-1.5">
        <AngkaBergerak
          nilai={total}
          className="tabular font-mono text-[2.25rem] leading-none font-bold text-ink"
        />
        <span className="text-[13px] font-medium text-muted">token terbit</span>
      </p>

      {baris.length === 0 ? (
        <div className="-mx-5 -mb-5 mt-4 border-t border-line">
          <KeadaanKosong
            judul="Belum ada rincian"
            pesan="Server belum mengirim sebaran token per zona untuk hari ini."
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {baris.map((b) => (
            <li
              key={b.zona}
              className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-[12.5px]">{b.zona}</span>
                <BarMini
                  nilai={b.jumlah}
                  maks={maks > 0 ? maks : 1}
                  nada="brand"
                  className="mt-1.5 h-1.5"
                />
              </span>
              <span className="tabular text-right font-mono text-[13px] font-semibold">
                {b.jumlah === null ? "—" : angka(b.jumlah)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {selisih ? (
        <p className="mt-4 border-t border-line pt-3 text-[12px] text-warn">
          Rincian per zona berjumlah{" "}
          <span className="tabular font-mono font-semibold">
            {angka(jumlahRincian)}
          </span>
          , tidak sama dengan totalnya. Salah satu angka perlu diperiksa.
        </p>
      ) : null}
    </div>
  );
}
