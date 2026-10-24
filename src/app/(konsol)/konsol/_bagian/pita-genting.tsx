"use client";

/**
 * Pita genting — satu-satunya hal mencolok di halaman ini.
 *
 * Konsol dipelototi delapan jam sehari, dan pertanyaannya selalu sama: ADA
 * YANG PERLU DITANGANI SEKARANG ATAU TIDAK? Pita ini menjawabnya sebelum
 * dibaca — lebar penuh, di atas segalanya, dengan dua angka yang jadi alasan
 * seseorang berhenti menyeruput kopi.
 *
 * Tiga hal yang dijaga:
 *
 * - Pita TETAP ADA saat keadaan tenang, hanya berganti nada. Banner yang
 *   hilang saat aman membuat tempat itu tidak pernah dipercaya: mata harus
 *   belajar "kalau di sini tertulis tenang, berarti memang tenang", bukan
 *   "kalau tidak ada apa-apa, mungkin belum dimuat".
 * - Warna TIDAK PERNAH sendirian. Nadanya selalu didampingi kata, dan
 *   penandanya garis takar tegak di tepi kiri — motif yang sama dengan
 *   lencana dan penanda menu aktif, bukan titik bulat.
 * - Angka yang tidak dikirim server tampil "—", bukan 0. Nol di sini berarti
 *   "sudah dihitung, memang tidak ada"; itu kabar baik yang tidak boleh
 *   dikarang dari data yang belum sampai.
 */

import Link from "next/link";
import { Skeleton } from "@/components/ui/keadaan";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { cn } from "@/lib/cn";
import { AMBANG_ALARM_L } from "./tipe";

function Hitungan({
  label,
  nilai,
  kaki,
  tautan,
  tautanLabel,
  nada,
}: {
  label: string;
  nilai: number | null;
  kaki: string;
  tautan: string;
  tautanLabel: string;
  nada: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-2">
        <AngkaBergerak
          nilai={nilai}
          className={cn(
            "tabular font-mono text-[2rem] leading-none font-bold",
            nilai === null || nilai === 0 ? "text-muted" : nada,
          )}
        />
        <span className="text-[12.5px] text-muted">{kaki}</span>
      </dd>
      <dd className="mt-1.5">
        <Link
          href={tautan}
          className="text-[12.5px] font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          {tautanLabel}
        </Link>
      </dd>
    </div>
  );
}

export function PitaGenting({
  insiden,
  berbunyi,
  zonaTerdampak,
  memuat,
}: {
  /** Jumlah insiden aktif. `null` bila server tidak mengirimnya. */
  insiden: number | null;
  /** Jumlah meter yang sedang berbunyi. `null` bila tidak dikirim. */
  berbunyi: number | null;
  /** Nama zona yang punya insiden atau meter berbunyi — untuk kalimatnya. */
  zonaTerdampak: string[];
  memuat: boolean;
}) {
  if (memuat) {
    return (
      <section className="rounded-card border border-line bg-surface px-5 py-4">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-3 h-9 w-64" />
      </section>
    );
  }

  const adaInsiden = (insiden ?? 0) > 0;
  const adaBerbunyi = (berbunyi ?? 0) > 0;
  const genting = adaInsiden || adaBerbunyi;

  // Insiden jaringan mengalahkan saldo menipis: yang satu memutus air satu
  // kampung, yang lain memutus air satu rumah yang memang belum membayar.
  const nada = adaInsiden ? "bahaya" : adaBerbunyi ? "peringatan" : "aman";

  const gaya = {
    bahaya: {
      tepi: "border-danger/35",
      bar: "bg-danger",
      judul: "text-danger",
      angka: "text-danger",
    },
    peringatan: {
      tepi: "border-warn/35",
      bar: "bg-warn",
      judul: "text-warn",
      angka: "text-warn",
    },
    aman: {
      tepi: "border-line",
      bar: "bg-success",
      judul: "text-success",
      angka: "text-ink",
    },
  }[nada];

  const daftarZona =
    zonaTerdampak.length === 0
      ? null
      : zonaTerdampak.length <= 3
        ? zonaTerdampak.join(", ")
        : `${zonaTerdampak.slice(0, 3).join(", ")} dan ${zonaTerdampak.length - 3} zona lain`;

  return (
    /*
     * `aria-live="polite"` dan bukan `assertive`: pita ini diperbarui tiap
     * kali data disegarkan, dan pembaca layar yang dipotong di tengah kalimat
     * tiap sepuluh detik tidak bisa dipakai bekerja seharian.
     */
    <section
      role="status"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-card border bg-surface",
        gaya.tepi,
      )}
    >
      {/* Garis takar tegak — penanda bentuk, supaya nadanya tidak bergantung
          warna saja. Motif yang sama dipakai lencana dan menu aktif. */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", gaya.bar)}
      />

      <div className="grid gap-x-10 gap-y-5 py-4 pr-5 pl-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className={cn("eyebrow", gaya.judul)}>
            {genting ? "Perlu ditangani sekarang" : "Tidak ada yang mendesak"}
          </p>
          <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">
            {genting ? (
              <>
                {adaInsiden
                  ? "Ada insiden jaringan yang belum ditutup"
                  : "Tidak ada insiden jaringan"}
                {adaBerbunyi
                  ? `, dan meter dengan saldo ≤ ${AMBANG_ALARM_L} L sedang berbunyi`
                  : ", dan tidak ada meter yang berbunyi"}
                {daftarZona ? ` di ${daftarZona}` : null}.
              </>
            ) : (
              "Tidak ada insiden jaringan yang terbuka dan tidak ada meter yang berbunyi. Angka di bawah tetap berjalan."
            )}
          </p>
        </div>

        <dl className="flex flex-wrap items-start gap-x-10 gap-y-5">
          <Hitungan
            label="Insiden aktif"
            nilai={insiden}
            kaki="laporan"
            tautan="/konsol/insiden"
            tautanLabel="Buka daftar insiden"
            nada={gaya.angka}
          />
          <Hitungan
            label="Meter berbunyi"
            nilai={berbunyi}
            kaki={`saldo ≤ ${AMBANG_ALARM_L} L`}
            tautan="/konsol/pelanggan"
            tautanLabel="Lihat pelanggan"
            nada={adaBerbunyi ? "text-warn" : gaya.angka}
          />
        </dl>
      </div>
    </section>
  );
}
