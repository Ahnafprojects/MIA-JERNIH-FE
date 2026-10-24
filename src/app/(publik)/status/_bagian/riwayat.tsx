"use client";

/**
 * Riwayat gangguan — versi TEKS dari strip harian di atasnya.
 *
 * Strip memperlihatkan polanya; seksi ini menjawab "kenapa". Keduanya dibaca
 * dari daftar kejadian yang sama, jadi petak merah pada tanggal tertentu
 * selalu punya satu baris penjelas di sini. Ia juga yang membuat strip bisa
 * dibiarkan `role="img"`: tidak ada satu pun informasi yang hanya hidup
 * sebagai warna.
 *
 * Tulang punggungnya memakai `.takar-tegak` — garis takar gelas ukur yang
 * sama dengan pembatas seksi di seluruh situs. Linimasa butuh garis tegak;
 * memakai garis yang sudah menjadi perangkat halaman ini lebih baik daripada
 * menambah satu gaya garis kelima.
 */

import { Badge } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { STATUS } from "@/components/peta/status-zona";
import { angka, tanggalJam } from "@/lib/format";
import { cn } from "@/lib/cn";
import { durasi } from "./waktu";
import type { Insiden, KeandalanZona } from "./tipe";

export function SeksiRiwayat({
  insiden,
  zona,
  hari,
  memuat,
  dipilih,
  onPilihZona,
}: {
  insiden: Insiden[];
  zona: KeandalanZona[];
  hari: number;
  memuat: boolean;
  dipilih: string | null;
  onPilihZona: (id: string | null) => void;
}) {
  const tersaring = dipilih
    ? insiden.filter((i) => i.zonaId === dipilih)
    : insiden;
  const berlangsung = tersaring.filter((i) => i.selesai === null).length;

  return (
    <section aria-labelledby="judul-riwayat" className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h2
            id="judul-riwayat"
            className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
          >
            Riwayat gangguan
          </h2>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Setiap kali air berhenti dalam {angka(hari)} hari terakhir, beserta
            sebabnya. Yang belum selesai tetap ditampilkan terbuka — bukan
            dihapus sampai beres.
          </p>
        </div>
        {!memuat && berlangsung > 0 ? (
          <Badge nada="bahaya" titik>
            {angka(berlangsung)} masih berlangsung
          </Badge>
        ) : null}
      </div>

      {/* Penyaring zona memakai pilihan yang SAMA dengan peta dan daftar di
          atas — satu keadaan, jadi halaman tidak pernah memperlihatkan peta
          menyorot satu zona sementara riwayatnya menampilkan zona lain. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Keping aktif={dipilih === null} onKlik={() => onPilihZona(null)}>
          Semua zona
        </Keping>
        {zona.map((z) => (
          <Keping
            key={z.id}
            aktif={dipilih === z.id}
            onKlik={() => onPilihZona(z.id)}
          >
            {z.nama}
          </Keping>
        ))}
      </div>

      {memuat ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : tersaring.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <KeadaanKosong
            judul="Tidak ada gangguan tercatat"
            pesan={`Air mengalir normal sepanjang ${angka(hari)} hari terakhir di zona ini. Tidak ada pekerjaan perbaikan yang mengganggu aliran.`}
          />
        </div>
      ) : (
        <ol className="mt-6 space-y-0">
          {tersaring.map((i, urut) => (
            <BarisInsiden
              key={i.id}
              insiden={i}
              terakhir={urut === tersaring.length - 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function Keping({
  aktif,
  onKlik,
  children,
}: {
  aktif: boolean;
  onKlik: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-pressed={aktif}
      className={cn(
        // `min-h-11` (44px): keping ini penyaring utama seksi riwayat dan
        // sering ditekan di ponsel. Tingginya tidak boleh ditentukan oleh
        // ukuran hurufnya saja.
        "inline-flex min-h-11 items-center rounded-input border px-3.5 py-2",
        "text-[12.5px] font-semibold transition-colors",
        aktif
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-line-strong hover:bg-soft",
      )}
    >
      {children}
    </button>
  );
}

function BarisInsiden({
  insiden,
  terakhir,
}: {
  insiden: Insiden;
  terakhir: boolean;
}) {
  const s = STATUS[insiden.jenis];
  const terbuka = insiden.selesai === null;

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/*
       * Tulang punggung linimasa: TANGGA GARIS TAKAR, bukan garis polos.
       *
       * `.takar-tegak` menggambar garis setebal 1px tiap 0,75rem. Dipasang
       * selebar 1px ia nyaris tak terlihat — jadi lebarnya dibuat selebar
       * titik di atasnya, sehingga tiap pengulangan jadi satu guratan takar
       * mendatar. Hasilnya linimasa yang terbaca sebagai sisi gelas ukur,
       * perangkat yang sama dengan pembatas seksi di seluruh situs.
       *
       * Berhenti di kejadian terakhir supaya tidak menggantung ke ruang
       * kosong di bawah daftar.
       */}
      {terakhir ? null : (
        <span
          aria-hidden
          className="takar-tegak absolute top-6 bottom-1 left-0 w-[11px]"
        />
      )}
      <span
        aria-hidden
        className={cn(
          "relative mt-[7px] size-[11px] shrink-0 rounded-[3px]",
          s.titik,
        )}
      />

      <div className="min-w-0 flex-1 border-b border-line pb-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <h3 className="font-display font-bold tracking-[-0.01em]">
            {insiden.zonaNama}
          </h3>
          <Badge nada={s.nada}>{s.label}</Badge>
          {terbuka ? (
            <Badge nada="bahaya" titik>
              Masih berlangsung
            </Badge>
          ) : null}
        </div>

        <p className="mt-1.5 max-w-[64ch] text-[13.5px] leading-relaxed">
          {insiden.sebab}
        </p>

        <dl className="tabular mt-2.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12.5px] text-muted">
          <div className="flex gap-1.5">
            <dt className="sr-only">Mulai</dt>
            <dd>{tanggalJam(insiden.mulai)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-sans">{terbuka ? "berjalan" : "berlangsung"}</dt>
            <dd className="font-semibold text-ink">
              {durasi(insiden.durasiJam)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-sans">terdampak</dt>
            <dd className="font-semibold text-ink">
              {angka(insiden.pelangganTerdampak)}
            </dd>
            <dd className="font-sans">pelanggan</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
