"use client";

/**
 * Kehilangan air per zona.
 *
 * Batangnya TIDAK diskalakan ke zona terburuk. Skala seperti itu membuat
 * zona terburuk selalu tampak penuh berapa pun angkanya — justru
 * menyembunyikan seberapa buruk keadaannya. Skalanya diikat ke ambang
 * nasional dan baru dinaikkan bila ada zona yang melewatinya, jadi panjang
 * batang berarti hal yang sama dari hari ke hari.
 *
 * Penanda tipis pada tiap batang adalah ambang 20%: di kirinya tergolong
 * baik, di kanannya belum. Angka yang sama dipakai halaman publik
 * `/statistik` — konsol dan halaman publik yang menyebut NRW berbeda untuk
 * hari yang sama adalah hal pertama yang akan ditemukan orang.
 */

import { Badge, type Nada } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { BarMini } from "@/components/domain/grafik";
import { angka } from "@/lib/format";
import { AMBANG_NRW_BAIK, angkaSah, type NrwZona } from "./tipe";

function nadaNrw(p: number | null): Nada {
  if (p === null || p < 0 || p > 100) return "netral";
  if (p <= AMBANG_NRW_BAIK) return "sukses";
  if (p <= 30) return "peringatan";
  return "bahaya";
}

export function DaftarNrwZona({
  zona,
  memuat,
}: {
  zona: NrwZona[] | undefined;
  memuat: boolean;
}) {
  if (memuat) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  const baris = zona ?? [];
  if (baris.length === 0) {
    return (
      <KeadaanKosong
        judul="Belum ada zona"
        pesan="Tidak ada zona distribusi dengan meter induk yang terdata."
      />
    );
  }

  const maks = Math.max(
    30,
    Math.ceil(
      baris.reduce((m, z) => Math.max(m, angkaSah(z.nrwPct) ?? 0), 0) / 5,
    ) * 5,
  );

  return (
    <ul className="divide-y divide-line/70">
      {baris.map((z) => {
        const v = angkaSah(z.nrwPct);
        const nada = nadaNrw(v);
        return (
          <li
            key={z.nama}
            className="grid h-12 grid-cols-[9rem_minmax(0,1fr)_auto] items-center gap-4 px-5"
          >
            <span className="truncate text-[13px] font-medium">{z.nama}</span>
            <BarMini
              nilai={v}
              maks={maks}
              tanda={AMBANG_NRW_BAIK}
              nada={
                nada === "sukses"
                  ? "sukses"
                  : nada === "peringatan"
                    ? "peringatan"
                    : nada === "bahaya"
                      ? "bahaya"
                      : "netral"
              }
              className="h-2"
            />
            <Badge nada={nada}>
              <span className="sr-only">Kehilangan air </span>
              <span className="tabular font-mono">
                {v === null ? "—" : `${angka(v, 1)}%`}
              </span>
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
