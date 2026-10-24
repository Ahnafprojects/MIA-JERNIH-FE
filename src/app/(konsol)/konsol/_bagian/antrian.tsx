"use client";

/**
 * Dua antrean kerja di rel kanan: meter yang berbunyi dan insiden terbuka.
 *
 * Keduanya daftar bergaris, bukan kartu — ini catatan kerja, dan yang
 * dibandingkan orang adalah SATU kolom dari atas ke bawah (saldo paling
 * tipis dulu, insiden paling baru dulu). Kartu memaksa mata melompat.
 *
 * Nama file jamak karena keduanya memang satu benda: daftar hal yang
 * menunggu dikerjakan. Memisahnya jadi dua berkas hanya menambah berkas.
 */

import Link from "next/link";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { angka, tanggalJam } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  AMBANG_ALARM_L,
  angkaSah,
  sejakKini,
  type InsidenRingkas,
  type MeterBerbunyi,
} from "./tipe";

function RangkaDaftar() {
  return (
    <div className="space-y-2.5 p-5">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

/* ── Meter berbunyi ───────────────────────────────────────────────────── */

export function DaftarBerbunyi({
  daftar,
  total,
  memuat,
}: {
  daftar: MeterBerbunyi[] | undefined;
  /** Jumlah SELURUHNYA, bukan panjang daftar yang dikirim. */
  total: number | null;
  memuat: boolean;
}) {
  if (memuat) return <RangkaDaftar />;

  const baris = daftar ?? [];
  if (baris.length === 0) {
    return (
      <KeadaanKosong
        judul="Tidak ada yang berbunyi"
        pesan={`Tidak ada meter dengan saldo ${AMBANG_ALARM_L} L ke bawah saat ini.`}
      />
    );
  }

  const sisa = total === null ? null : total - baris.length;

  return (
    <>
      <ul className="divide-y divide-line/70">
        {baris.map((m) => {
          const saldo = angkaSah(m.saldoL);
          return (
            <li key={m.id} className="flex h-12 items-center gap-3 px-5">
              <span aria-hidden className="h-5 w-[2px] shrink-0 bg-warn" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {m.nama}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted">
                  {m.id} · {m.zona}
                </span>
              </span>
              <span className="tabular shrink-0 text-right font-mono text-[13px] font-bold text-warn">
                {saldo === null ? "—" : angka(saldo, 2)}
                <span className="ml-1 text-[11px] font-semibold text-muted">
                  L
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {sisa !== null && sisa > 0 ? (
        <p className="border-t border-line px-5 py-3 text-[12.5px] text-muted">
          <span className="tabular font-mono font-semibold text-ink">
            {angka(sisa)}
          </span>{" "}
          meter lain juga berbunyi.{" "}
          <Link
            href="/konsol/pelanggan"
            className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >
            Lihat semuanya
          </Link>
        </p>
      ) : null}
    </>
  );
}

/* ── Insiden terbaru ──────────────────────────────────────────────────── */

export function DaftarInsiden({
  daftar,
  total,
  memuat,
}: {
  daftar: InsidenRingkas[] | undefined;
  /** Jumlah SELURUHNYA, bukan panjang daftar yang dikirim. */
  total: number | null;
  memuat: boolean;
}) {
  if (memuat) return <RangkaDaftar />;

  const baris = daftar ?? [];
  if (baris.length === 0) {
    return (
      <KeadaanKosong
        judul="Tidak ada insiden"
        pesan="Belum ada laporan gangguan yang terbuka hari ini."
      />
    );
  }

  const sisa = total === null ? null : total - baris.length;

  return (
    <>
      <ul className="divide-y divide-line/70">
        {baris.map((i) => {
          const lalu = sejakKini(i.sejak);
          return (
            <li key={i.id} className="flex h-12 items-center gap-3 px-5">
              <span aria-hidden className="h-5 w-[2px] shrink-0 bg-danger" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {i.nama}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted">
                  {i.id} · {i.zona}
                </span>
              </span>
              {/* Waktu mutlak disimpan di `title` dan di `<time>`: "3 jam lalu"
                cepat dibaca, tapi petugas yang menulis laporan butuh jamnya. */}
              <time
                dateTime={i.sejak}
                title={lalu ? tanggalJam(i.sejak) : undefined}
                className={cn(
                  "tabular shrink-0 font-mono text-[12px]",
                  lalu === null ? "text-muted" : "text-danger",
                )}
              >
                {lalu ?? "—"}
              </time>
            </li>
          );
        })}
      </ul>
      {sisa !== null && sisa > 0 ? (
        <p className="border-t border-line px-5 py-3 text-[12.5px] text-muted">
          <span className="tabular font-mono font-semibold text-ink">
            {angka(sisa)}
          </span>{" "}
          insiden lain juga belum ditutup.{" "}
          <Link
            href="/konsol/insiden"
            className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >
            Buka daftarnya
          </Link>
        </p>
      ) : null}
    </>
  );
}
