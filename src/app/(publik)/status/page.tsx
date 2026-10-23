"use client";

/**
 * J02 — Status layanan per zona. TANPA LOGIN.
 *
 * Halaman paling penting untuk subtema Public Service Tracking: warga bisa
 * tahu kenapa airnya mati tanpa punya akun dan tanpa menelepon siapa pun.
 *
 * Susunannya: ringkasan tiga angka → peta → daftar zona → detail zona.
 * Peta adalah lapisan DI ATAS daftar, bukan penggantinya. Daftar teks harus
 * tetap ada selamanya: peta tidak terbaca pembaca layar, gagal dimuat di
 * koneksi buruk, dan mati sama sekali tanpa WebGL.
 */

import { useCallback, useState } from "react";
import { Clock, RefreshCw, Users } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeadaanGalat, KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import PetaZonaDinamis from "@/components/peta/peta-zona-dinamis";
import { STATUS, URUTAN_STATUS } from "@/components/peta/status-zona";
import useApi from "@/lib/use-api";
import { angka, tanggalJam } from "@/lib/format";
import type { StatusLayanan, ZonaStatus } from "@/types/publik";

export default function HalamanStatus() {
  const { data, memuat, galat, muatUlang } = useApi<StatusLayanan>(
    "/api/publik/status-layanan",
  );
  const [dipilih, setDipilih] = useState<string | null>(null);

  const zona = data?.zona ?? [];
  const aktif = zona.find((z) => z.id === dipilih) ?? null;

  // Klik kedua pada zona yang sama melepas pilihan — pengguna yang membuka
  // detail tanpa sengaja tidak perlu mencari tombol tutup.
  const pilih = useCallback((id: string) => {
    setDipilih((lama) => (lama === id ? null : id));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <header>
        <p className="eyebrow text-brand-600">Transparansi</p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,6vw,2.75rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Status layanan air, zona per zona
        </h1>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          Kondisi layanan di tiap wilayah, dibaca langsung dari sistem
          pemantauan. Tidak perlu akun, tidak perlu menelepon.
        </p>
      </header>

      {galat ? (
        <Card className="mt-8">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          <RingkasanStatus data={data} memuat={memuat} />

          {/* ── Peta ─────────────────────────────────────────────────── */}
          <section
            aria-labelledby="judul-peta"
            className="mt-8 overflow-hidden rounded-card border border-line bg-surface"
          >
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="judul-peta"
                  className="font-display text-[15px] font-bold tracking-[-0.02em]"
                >
                  Peta zona layanan
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  Pilih satu wilayah untuk membuka detailnya.
                </p>
              </div>
              <Button
                varian="halus"
                ukuran="sm"
                onClick={muatUlang}
                aria-label="Muat ulang status layanan"
              >
                <RefreshCw size={15} aria-hidden />
                Perbarui
              </Button>
            </div>

            {memuat ? (
              <div className="flex h-[280px] items-center justify-center sm:h-[360px] lg:h-[440px]">
                <p className="text-[13px] text-muted">Memuat data zona…</p>
              </div>
            ) : (
              <PetaZonaDinamis zona={zona} dipilih={dipilih} onPilih={pilih} />
            )}
          </section>

          {/* ── Daftar teks + detail ─────────────────────────────────── */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
            <Panel
              judul="Daftar zona"
              sub={
                data
                  ? `${zona.length} zona · diperbarui ${tanggalJam(data.ts)}`
                  : undefined
              }
              isiClassName="p-0"
            >
              {memuat ? (
                <div className="space-y-px p-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : zona.length === 0 ? (
                <KeadaanKosong
                  judul="Belum ada zona terdaftar"
                  pesan="Sistem belum mengirimkan data wilayah layanan. Coba muat ulang beberapa saat lagi."
                />
              ) : (
                <ul>
                  {zona.map((z) => (
                    <li
                      key={z.id}
                      className="border-t border-line first:border-0"
                    >
                      <BarisZona
                        zona={z}
                        terpilih={z.id === dipilih}
                        onPilih={() => pilih(z.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel judul={aktif ? "Detail zona" : "Pilih satu zona"}>
              {aktif ? (
                <DetailZona zona={aktif} />
              ) : (
                <p className="max-w-[48ch] text-[13.5px] leading-relaxed text-muted">
                  Pilih satu zona di peta atau di daftar untuk melihat penyebab
                  gangguan, jumlah pelanggan terdampak, dan perkiraan waktu
                  pulih.
                </p>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Tiga angka pembuka — jawaban tiga detik sebelum orang membaca detailnya.
 *
 * Dibuat sebagai PITA BERGARIS, bukan tiga kartu membulat: halaman ini adalah
 * catatan publik, dan angka yang dipisah garis terbaca sebagai satu bacaan
 * alat ukur, bukan tiga benda yang tak berhubungan.
 */
function RingkasanStatus({
  data,
  memuat,
}: {
  data: StatusLayanan | null;
  memuat: boolean;
}) {
  return (
    <section aria-label="Ringkasan status zona" className="mt-8">
      <div aria-hidden className="takar h-1.5" />
      <dl className="grid border-y border-line sm:grid-cols-3">
        {URUTAN_STATUS.map((s, i) => (
          <div
            key={s}
            className={
              "px-4 py-4 sm:px-5 " +
              (i > 0
                ? "border-t border-line sm:border-t-0 sm:border-l sm:border-line"
                : "")
            }
          >
            <dt className="flex items-center gap-2">
              <span
                aria-hidden
                className={`size-2.5 shrink-0 rounded-[3px] ${STATUS[s].titik}`}
              />
              <span className="text-[13px] font-semibold">
                {STATUS[s].label}
              </span>
            </dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              {memuat ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <>
                  <span className="tabular font-mono text-[30px] leading-none font-bold">
                    {/* Nilai yang tidak dikirim server tampil "—". Nol di sini
                        adalah hasil pengukuran yang sah dan tetap ditulis 0. */}
                    {data ? data.ringkas[s] : "—"}
                  </span>
                  <span className="text-[12.5px] text-muted">zona</span>
                </>
              )}
            </dd>
            <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
              {STATUS[s].arti}
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Satu baris daftar zona. Tombol penuh, jadi tetap bisa dicapai keyboard. */
function BarisZona({
  zona,
  terpilih,
  onPilih,
}: {
  zona: ZonaStatus;
  terpilih: boolean;
  onPilih: () => void;
}) {
  const s = STATUS[zona.status];
  return (
    <button
      type="button"
      onClick={onPilih}
      aria-pressed={terpilih}
      className={`relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5 ${
        terpilih ? "bg-brand-50 dark:bg-brand-900/25" : "hover:bg-soft"
      }`}
    >
      {/* Pita tepi menandai baris terpilih tanpa bergantung pada warna latar
          saja — ia tetap terlihat di tema gelap dan saat dicetak. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] ${
          terpilih ? "bg-brand-500" : "bg-transparent"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold tracking-[-0.01em]">{zona.nama}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-muted">
          {zona.keterangan ?? "Tidak ada gangguan dilaporkan"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge nada={s.nada} titik>
          {s.label}
        </Badge>
        <span className="flex items-center gap-1 text-[12px] text-muted">
          <Users size={12} aria-hidden />
          <span className="tabular font-mono font-semibold">
            {angka(zona.pelangganTerdampak)}
          </span>
          terdampak
        </span>
      </div>
    </button>
  );
}

function DetailZona({ zona }: { zona: ZonaStatus }) {
  const s = STATUS[zona.status];
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
          {zona.nama}
        </h3>
        <Badge nada={s.nada} titik>
          {s.label}
        </Badge>
      </div>

      <p className="mt-3 max-w-[48ch] text-[13.5px] leading-relaxed">
        {zona.keterangan ?? (
          <span className="text-muted">
            Layanan di zona ini berjalan normal. Tidak ada pekerjaan perbaikan
            yang sedang berlangsung.
          </span>
        )}
      </p>

      <dl className="mt-5 border-t border-line text-[13px]">
        <Baris label="Pelanggan terdampak">
          <span className="tabular font-mono font-semibold">
            {angka(zona.pelangganTerdampak)}
          </span>{" "}
          <span className="text-muted">pelanggan</span>
        </Baris>
        <Baris label="Berlangsung sejak">
          {zona.sejak ? tanggalJam(zona.sejak) : "—"}
        </Baris>
        <Baris
          label={
            <span className="flex items-center gap-1.5">
              <Clock size={13} aria-hidden />
              Perkiraan pulih
            </span>
          }
        >
          {zona.perkiraanPulih ? tanggalJam(zona.perkiraanPulih) : "—"}
        </Baris>
      </dl>

      {zona.status !== "normal" ? (
        <p className="mt-5 border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-muted">
          Perkiraan waktu pulih bisa berubah mengikuti kondisi di lapangan.
          Sudah melapor? Lacak perkembangannya di halaman Lacak Pengaduan.
        </p>
      ) : null}
    </div>
  );
}

/** Baris keterangan bergaris — pasangan label dan nilai, tanpa angka telanjang. */
function Baris({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
