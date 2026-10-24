"use client";

/**
 * Lima KPI jaringan.
 *
 * ── Kenapa bukan lima kartu membulat berjajar ──────────────────────────
 *
 * Lima kartu seragam berbayang adalah bentuk yang sama persis dipakai setiap
 * dashboard mana pun untuk angka apa pun. Di sini kelimanya jadi SATU pita
 * bergaris, dipisah garis tipis seperti kolom pada lembar catatan meter —
 * padat, sekali lihat terbaca sebagai satu baris pembacaan, dan tidak
 * memakan tinggi layar yang dibutuhkan tabel live di bawahnya.
 *
 * ── Aturan yang tidak boleh dilanggar ─────────────────────────────────
 *
 * `kpi` dari server adalah ARRAY. Nilainya dicari lewat `key` memakai
 * `nilaiKpi()`, TIDAK PERNAH lewat indeks dan TIDAK PERNAH dengan
 * mencocokkan `label` — teks label milik server dan bisa berubah kapan saja;
 * kode yang mencocokkan label berhenti bekerja diam-diam saat katanya
 * diperbaiki.
 *
 * Label, satuan, dan jumlah desimal yang dipakai di sini milik KLIEN, karena
 * kartu untuk KPI yang tidak dikirim server tetap harus punya nama. Kartu
 * seperti itu menampilkan "—", bukan 0: nol adalah hasil pengukuran, dan
 * "0 pelanggan aktif" terbaca sebagai jaringan mati, bukan sebagai data yang
 * belum sampai.
 */

import { Skeleton } from "@/components/ui/keadaan";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { nilaiKpi, type Kpi } from "@/types/publik";
import { cn } from "@/lib/cn";
import { AMBANG_NRW_BAIK } from "./tipe";

type Nada = "netral" | "sukses" | "peringatan" | "bahaya";

interface Spek {
  key: string;
  label: string;
  satuan: string;
  desimal?: number;
  kaki: string;
  /** Nada diturunkan dari nilainya sendiri, bukan diambil dari server. */
  nada?: (v: number) => Nada;
}

const SPEK: Spek[] = [
  {
    key: "pelangganAktif",
    label: "Pelanggan aktif",
    satuan: "sambungan",
    kaki: "saklar terbuka, saldo tersisa",
  },
  {
    key: "pelangganNonaktif",
    label: "Nonaktif",
    satuan: "sambungan",
    kaki: "saldo habis atau saklar tertutup",
  },
  {
    key: "volumeHariIniM3",
    label: "Volume hari ini",
    satuan: "m³",
    kaki: "air disalurkan sejak tengah malam",
  },
  {
    key: "saldoBeredarL",
    label: "Saldo beredar",
    satuan: "L",
    kaki: "kredit terbeli yang belum terpakai",
  },
  {
    key: "nrwRataPct",
    label: "Kehilangan air",
    satuan: "%",
    desimal: 1,
    kaki: "rata-rata 30 hari terakhir",
    nada: (v) =>
      v < 0 || v > 100
        ? "netral"
        : v <= AMBANG_NRW_BAIK
          ? "sukses"
          : v <= 30
            ? "peringatan"
            : "bahaya",
  },
];

const WARNA: Record<Nada, string> = {
  netral: "text-ink",
  sukses: "text-success",
  peringatan: "text-warn",
  bahaya: "text-danger",
};

export function PitaKpi({
  kpi,
  memuat,
}: {
  kpi: Kpi[] | undefined;
  memuat: boolean;
}) {
  const daftar = kpi ?? [];

  return (
    <dl
      className={cn(
        // Garis pemisah dibuat dari celah 1px berlatar `line`, bukan dari
        // border per sel: tidak ada garis ganda di sambungan, dan garisnya
        // ikut hilang sendiri saat kolomnya membungkus ke baris baru.
        "grid gap-px overflow-hidden rounded-card border border-line bg-line",
        "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
      )}
    >
      {SPEK.map((s) => {
        const nilai = memuat ? null : nilaiKpi(daftar, s.key);
        const nada: Nada =
          nilai === null ? "netral" : (s.nada?.(nilai) ?? "netral");

        return (
          <div key={s.key} className="min-w-0 bg-surface px-4 py-3.5">
            <dt className="eyebrow truncate text-muted">{s.label}</dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              {memuat ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <>
                  <AngkaBergerak
                    nilai={nilai}
                    desimal={s.desimal ?? 0}
                    className={cn(
                      "tabular font-mono text-[clamp(1.25rem,1.7vw,1.6rem)] leading-none font-bold",
                      nilai === null ? "text-muted" : WARNA[nada],
                    )}
                  />
                  {/* Satuan disembunyikan saat nilainya tidak ada: "— %"
                      terbaca sebagai angka yang gagal dicetak, "—" saja
                      terbaca sebagai angka yang memang belum ada. */}
                  {nilai === null ? null : (
                    <span className="font-mono text-[12.5px] font-semibold text-muted">
                      {s.satuan}
                    </span>
                  )}
                </>
              )}
            </dd>
            <dd className="mt-1.5 text-[12px] leading-snug text-muted">
              {nilai === null && !memuat ? "Tidak dikirim server" : s.kaki}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
