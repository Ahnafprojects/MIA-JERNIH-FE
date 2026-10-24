"use client";

/**
 * Penyaring daftar pelanggan.
 *
 * Keping penyaring MENYEBUTKAN JUMLAHNYA. Keping tanpa angka memaksa petugas
 * menekannya satu per satu untuk tahu mana yang berisi — dan di daftar 8.219
 * baris itu empat permintaan ke server hanya untuk memutuskan ke mana harus
 * melihat. Angkanya datang dari server, dihitung SETELAH pencarian dan zona
 * tapi SEBELUM penyaring statusnya sendiri, supaya keping yang sedang aktif
 * tidak menampilkan jumlahnya sendiri sementara yang lain nol.
 *
 * Bentuk kepingnya persegi bersudut 3px dengan garis takar tegak, sekeluarga
 * dengan lencana status — bukan kapsul berisi titik bulat.
 */

import { Search, X } from "lucide-react";
import { TextField, Select } from "@/components/ui/field";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SARING, URUTAN, type SaringKunci } from "./tipe";

export function Penyaring({
  cari,
  onCari,
  zona,
  onZona,
  daftarZona,
  saring,
  onSaring,
  urutan,
  onUrutan,
  jumlahSaring,
  total,
}: {
  cari: string;
  onCari: (v: string) => void;
  zona: string;
  onZona: (v: string) => void;
  daftarZona: { id: string; nama: string }[];
  saring: SaringKunci | "";
  onSaring: (v: SaringKunci | "") => void;
  urutan: string;
  onUrutan: (v: string) => void;
  /** `null` selama permintaan pertama — keping tampil tanpa angka, bukan nol. */
  jumlahSaring: Record<SaringKunci, number> | null;
  total: number | null;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
        <TextField
          label="Cari nama atau ID pelanggan"
          placeholder="Agus Firdaus · JRN-10153"
          value={cari}
          onChange={(e) => onCari(e.target.value)}
          depan={<Search size={16} aria-hidden />}
          autoComplete="off"
          type="search"
          belakang={
            cari ? (
              <button
                type="button"
                onClick={() => onCari("")}
                className="-mr-1 grid size-8 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink"
              >
                <X size={15} aria-hidden />
                <span className="sr-only">Kosongkan pencarian</span>
              </button>
            ) : null
          }
        />

        <Select
          label="Zona layanan"
          value={zona}
          onChange={(e) => onZona(e.target.value)}
        >
          <option value="">Semua zona</option>
          {daftarZona.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nama}
            </option>
          ))}
        </Select>

        <Select
          label="Urutkan"
          value={urutan}
          onChange={(e) => onUrutan(e.target.value)}
        >
          {URUTAN.map((u) => (
            <option key={u.kunci} value={u.kunci}>
              {u.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4">
        <p className="eyebrow text-muted">Saring cepat</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Keping
            aktif={saring === ""}
            label="Semua"
            jumlah={total}
            onKlik={() => onSaring("")}
          />
          {SARING.map((s) => (
            <Keping
              key={s.kunci}
              aktif={saring === s.kunci}
              label={s.label}
              jumlah={jumlahSaring ? jumlahSaring[s.kunci] : null}
              onKlik={() => onSaring(saring === s.kunci ? "" : s.kunci)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Keping({
  aktif,
  label,
  jumlah,
  onKlik,
}: {
  aktif: boolean;
  label: string;
  jumlah: number | null;
  onKlik: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-pressed={aktif}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-[3px] border px-2.5",
        "text-[12.5px] font-semibold transition-colors motion-reduce:transition-none",
        /*
          Tulisan keping aktif memakai `text-canvas`, BUKAN `text-white`.
          `brand-600` ditukar temanya: #0a6b85 yang gelap di tema terang,
          #5fcfe6 yang terang di tema gelap. Putih di atas nilai kedua
          hanya 1,3:1 — tulisannya praktis hilang. `canvas` ikut ditukar
          ke arah berlawanan, jadi pasangan ini lolos di KEDUA tema tanpa
          satu pun penimpaan `dark:`.
        */
        aktif
          ? "border-brand-600 bg-brand-600 text-canvas"
          : "border-line-strong bg-surface text-ink hover:bg-soft",
      )}
    >
      {/* Garis takar tegak — penanda yang sama dengan lencana status. Keping
          aktif dibedakan bentuk DAN warna, tidak hanya warna. */}
      <span
        aria-hidden
        className={cn(
          "h-3.5 w-[2px] shrink-0",
          aktif ? "bg-canvas" : "bg-line-strong",
        )}
      />
      {label}
      <span
        className={cn(
          "tabular font-mono text-[11.5px]",
          aktif ? "text-canvas/80" : "text-muted",
        )}
      >
        {jumlah === null ? "—" : angka(jumlah)}
      </span>
    </button>
  );
}
