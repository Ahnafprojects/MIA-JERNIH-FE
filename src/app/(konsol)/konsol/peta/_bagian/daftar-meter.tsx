"use client";

/**
 * Daftar teks — isi yang SAMA dengan peta, tanpa gambar.
 *
 * Ini bukan pelengkap peta. Peta tidak terbaca pembaca layar, gagal di
 * koneksi buruk, dan mati sama sekali tanpa WebGL; daftar ini jalur utama
 * yang kebetulan tidak bergambar. Karena itu himpunannya dijaga identik:
 * saringan status dan zona yang sama, dari array `pin` yang sama. Tidak ada
 * pencarian teks di sini dengan sengaja — pencarian akan menyaring daftarnya
 * saja dan membuat kedua jalur itu berbeda isi.
 *
 * Urutannya memang berbeda dari urutan gambar: paling genting di halaman
 * pertama. Peta punya ruang untuk menampilkan delapan ribu titik sekaligus,
 * daftar hanya punya dua puluh baris sebelum orang harus menekan tombol.
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KeadaanKosong } from "@/components/ui/keadaan";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { STATUS_METER, URUTAN_METER } from "./status-meter";
import type { PinMeter } from "./tipe";

const PER_HALAMAN = 20;

/** Paling genting lebih dulu — urutannya sama dengan legenda. */
const BOBOT = Object.fromEntries(
  URUTAN_METER.map((s, i) => [s, i]),
) as Record<string, number>;

export function urutkanPin(pin: PinMeter[]): PinMeter[] {
  return [...pin].sort(
    (a, b) =>
      BOBOT[a.status] - BOBOT[b.status] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

export function DaftarMeter({
  pin,
  halaman,
  onHalaman,
  dipilih,
  onPilih,
  tanpaKoordinat,
  disaring,
  onLepasSaring,
}: {
  /** Sudah disaring DAN diurutkan oleh halaman. */
  pin: PinMeter[];
  halaman: number;
  onHalaman: (n: number) => void;
  dipilih: string | null;
  onPilih: (p: PinMeter) => void;
  tanpaKoordinat: number;
  /** Benar bila ada saringan aktif — menentukan isi keadaan kosong. */
  disaring: boolean;
  onLepasSaring: () => void;
}) {
  const jumlahHalaman = Math.max(1, Math.ceil(pin.length / PER_HALAMAN));
  // Menyaring sampai sisa satu halaman lalu menekan "berikutnya" pernah
  // menyisakan nomor halaman di luar jangkauan dan tabel kosong tanpa sebab.
  const kini = Math.min(halaman, jumlahHalaman);
  const mulai = (kini - 1) * PER_HALAMAN;
  const potongan = pin.slice(mulai, mulai + PER_HALAMAN);

  const kolom: Kolom<PinMeter>[] = [
    {
      kunci: "meter",
      label: "Meter",
      /*
       * Namanya SENDIRI yang jadi tautan, bukan kolom "Detail" terpisah.
       *
       * Kolom tambahan itu kolom keempat yang harus muat di layar 390px, dan
       * yang pertama tergeser keluar pandangan justru saldo — angka yang
       * dicari orang. Nama orang juga nama tautan yang lebih baik daripada
       * kata "Detail" yang diulang dua puluh kali bagi pembaca layar.
       *
       * Klik di sisa barisnya tetap menyorot pin di peta; `stopPropagation`
       * menjaga agar menekan tautan tidak melakukan keduanya sekaligus.
       */
      render: (p) => (
        <>
          <span className="block font-mono text-[11.5px] text-muted tabular">
            {p.id}
          </span>
          <Link
            href={`/konsol/pelanggan/${p.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate font-medium hover:text-brand-600 hover:underline"
          >
            {p.nama}
          </Link>
        </>
      ),
    },
    {
      kunci: "zona",
      label: "Zona",
      sembunyiKecil: true,
      render: (p) => <span className="text-muted">{p.zona}</span>,
    },
    {
      kunci: "status",
      label: "Status",
      render: (p) => (
        <Badge nada={STATUS_METER[p.status].nada} titik>
          {STATUS_METER[p.status].label}
        </Badge>
      ),
    },
    /*
     * Satuan ada di KEPALA KOLOM, bukan diulang di tiap sel.
     *
     * Ini satu-satunya tempat di produk ini yang tidak memakai `liter()` dan
     * `debit()`, dan alasannya terukur: "9.617,63 L" dua puluh kali membuat
     * kolomnya 18px lebih lebar, dan di layar 390px yang tergeser ke luar
     * pandangan justru huruf "L"-nya — angka tanpa satuan, persis yang
     * dilarang. Di kepala kolom satuannya tetap terbaca sekali untuk seluruh
     * kolom, termasuk oleh pembaca layar lewat `scope="col"`.
     */
    {
      kunci: "saldo",
      label: "Saldo (L)",
      rata: "kanan",
      render: (p) => (
        <span className="font-mono text-[12.5px] tabular">
          {angka(p.saldoL, 2)}
        </span>
      ),
    },
    {
      kunci: "debit",
      label: "Debit (L/mnt)",
      rata: "kanan",
      sembunyiKecil: true,
      render: (p) => (
        <span className="font-mono text-[12.5px] text-muted tabular">
          {angka(p.debitLpm, 1)}
        </span>
      ),
    },
  ];

  return (
    <section
      aria-labelledby="judul-daftar"
      className="overflow-hidden rounded-card border border-line bg-surface"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2
            id="judul-daftar"
            className="font-display text-[15px] font-bold tracking-[-0.02em]"
          >
            Daftar meter
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Isi yang sama dengan peta, diurutkan dari yang paling genting.
            Tekan baris untuk menyorotnya di peta, tekan namanya untuk membuka
            halaman pelanggan.
          </p>
        </div>
        <p
          aria-live="polite"
          className="font-mono text-[12px] text-muted tabular"
        >
          {pin.length === 0
            ? "0 baris"
            : `${angka(mulai + 1)}–${angka(mulai + potongan.length)} dari ${angka(pin.length)}`}
        </p>
      </div>

      <Tabel
        kolom={kolom}
        data={potongan}
        kunciBaris={(p) => p.id}
        terpilih={dipilih ?? undefined}
        onKlikBaris={onPilih}
        lebarMin="22rem"
        kosong={
          <KeadaanKosong
            judul="Tidak ada meter yang cocok"
            pesan={
              disaring
                ? "Seluruh status disembunyikan atau zona yang dipilih kosong. Lepaskan saringan untuk melihat kembali seluruh jaringan."
                : "Tidak ada meter berkoordinat yang bisa ditampilkan."
            }
            aksi={
              disaring ? (
                <button
                  type="button"
                  onClick={onLepasSaring}
                  className="inline-flex min-h-11 items-center rounded-input border border-line-strong px-4 text-sm font-semibold hover:bg-soft"
                >
                  Lepaskan saringan
                </button>
              ) : undefined
            }
          />
        }
      />

      {pin.length > 0 ? (
        <nav
          aria-label="Halaman daftar meter"
          className="flex items-center justify-between gap-3 border-t border-line px-5 py-3"
        >
          <TombolHalaman
            arah="mundur"
            mati={kini <= 1}
            onClick={() => onHalaman(kini - 1)}
          />
          <p className="font-mono text-[12px] text-muted tabular">
            Halaman {angka(kini)} dari {angka(jumlahHalaman)}
          </p>
          <TombolHalaman
            arah="maju"
            mati={kini >= jumlahHalaman}
            onClick={() => onHalaman(kini + 1)}
          />
        </nav>
      ) : null}

      {tanpaKoordinat > 0 ? (
        <p className="border-t border-line bg-silt/60 px-5 py-3 text-[11.5px] leading-relaxed text-muted">
          <span className="font-mono font-semibold text-ink tabular">
            {angka(tanpaKoordinat)}
          </span>{" "}
          meter terdaftar belum punya koordinat, jadi tidak ada di peta maupun
          di daftar ini. Mereka tetap terbaca di halaman Pelanggan.
        </p>
      ) : null}
    </section>
  );
}

function TombolHalaman({
  arah,
  mati,
  onClick,
}: {
  arah: "mundur" | "maju";
  mati: boolean;
  onClick: () => void;
}) {
  const maju = arah === "maju";
  const Ikon = maju ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={mati}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-input px-3 text-[13px] font-semibold",
        "hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
      )}
    >
      {maju ? null : <Ikon size={15} aria-hidden />}
      {maju ? "Berikutnya" : "Sebelumnya"}
      {maju ? <Ikon size={15} aria-hidden /> : null}
    </button>
  );
}
