"use client";

/**
 * Paginasi dari SERVER.
 *
 * 8.219 pelanggan tidak pernah dimuat ke klien. Bukan karena ukuran
 * JSON-nya — itu masih bisa ditanggung — melainkan karena 8.219 baris DOM
 * membuat tiap ketikan di kolom cari menggambar ulang seluruh tabel, dan
 * petugas merasakannya sebagai papan ketik yang tersendat. Yang berpindah
 * antar halaman hanya `?halaman=`; penyaringan, pengurutan, dan
 * penghitungannya tetap pekerjaan server.
 *
 * Kontrolnya menyebut POSISI, bukan hanya "Berikutnya": "Menampilkan
 * 26–50 dari 8.219" adalah satu-satunya cara petugas tahu ia sudah sejauh
 * apa dan masih berapa lagi.
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select } from "@/components/ui/field";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";

const PER_HALAMAN = [25, 50, 100];

export function Paginasi({
  halaman,
  halamanTerakhir,
  perHalaman,
  total,
  jumlahDitampilkan,
  onHalaman,
  onPerHalaman,
}: {
  halaman: number;
  halamanTerakhir: number;
  perHalaman: number;
  total: number;
  jumlahDitampilkan: number;
  onHalaman: (h: number) => void;
  onPerHalaman: (n: number) => void;
}) {
  const mulai = total === 0 ? 0 : (halaman - 1) * perHalaman + 1;
  const akhir = mulai === 0 ? 0 : mulai + jumlahDitampilkan - 1;

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[12.5px] text-muted">
        Menampilkan{" "}
        <span className="tabular font-mono font-semibold text-ink">
          {angka(mulai)}–{angka(akhir)}
        </span>{" "}
        dari{" "}
        <span className="tabular font-mono font-semibold text-ink">
          {angka(total)}
        </span>{" "}
        pelanggan
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[12.5px] text-muted">
          Baris
          <Select
            value={String(perHalaman)}
            onChange={(e) => onPerHalaman(Number(e.target.value))}
            className="w-20"
          >
            {PER_HALAMAN.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex items-center gap-1">
          <TombolHalaman
            label="Halaman pertama"
            nonaktif={halaman <= 1}
            onKlik={() => onHalaman(1)}
          >
            <ChevronsLeft size={16} aria-hidden />
          </TombolHalaman>
          <TombolHalaman
            label="Halaman sebelumnya"
            nonaktif={halaman <= 1}
            onKlik={() => onHalaman(halaman - 1)}
          >
            <ChevronLeft size={16} aria-hidden />
          </TombolHalaman>

          <p className="tabular px-2 font-mono text-[12.5px] whitespace-nowrap">
            {angka(halaman)}
            <span className="text-muted"> / {angka(halamanTerakhir)}</span>
          </p>

          <TombolHalaman
            label="Halaman berikutnya"
            nonaktif={halaman >= halamanTerakhir}
            onKlik={() => onHalaman(halaman + 1)}
          >
            <ChevronRight size={16} aria-hidden />
          </TombolHalaman>
          <TombolHalaman
            label="Halaman terakhir"
            nonaktif={halaman >= halamanTerakhir}
            onKlik={() => onHalaman(halamanTerakhir)}
          >
            <ChevronsRight size={16} aria-hidden />
          </TombolHalaman>
        </div>
      </div>
    </div>
  );
}

function TombolHalaman({
  label,
  nonaktif,
  onKlik,
  children,
}: {
  label: string;
  nonaktif: boolean;
  onKlik: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      disabled={nonaktif}
      aria-label={label}
      className={cn(
        "grid size-11 place-items-center rounded-[3px] border border-line-strong bg-surface",
        "hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
