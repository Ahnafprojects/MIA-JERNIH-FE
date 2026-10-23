"use client";

/**
 * J02 — Status layanan per zona. TANPA LOGIN.
 *
 * Halaman paling penting untuk subtema Public Service Tracking: warga bisa
 * tahu kenapa airnya mati tanpa punya akun dan tanpa menelepon siapa pun.
 */
import { useState } from "react";
import { Clock, MapPin, RefreshCw, Users } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { Badge, type Nada } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import useApi from "@/lib/use-api";
import { angka, tanggalJam } from "@/lib/format";
import type { StatusLayanan, StatusZona, ZonaStatus } from "@/types/publik";

/**
 * Tiap status WAJIB punya label kata. Warna sendirian tidak terbaca oleh
 * sebagian pengguna, dan hilang maknanya saat halaman dicetak hitam-putih.
 */
const STATUS: Record<StatusZona, { label: string; nada: Nada; warna: string }> = {
  normal: { label: "Normal", nada: "sukses", warna: "bg-success" },
  gangguan: { label: "Gangguan", nada: "bahaya", warna: "bg-danger" },
  perbaikan: { label: "Perbaikan", nada: "peringatan", warna: "bg-warn" },
};

export default function HalamanStatus() {
  const { data, memuat, galat, muatUlang } =
    useApi<StatusLayanan>("/api/publik/status-layanan");
  const [dipilih, setDipilih] = useState<string | null>(null);

  const zona = data?.zona ?? [];
  const aktif = zona.find((z) => z.id === dipilih) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <p className="eyebrow text-brand-600">Transparansi</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Status Layanan
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Kondisi layanan air di tiap zona, diperbarui langsung dari sistem.
          Tidak perlu akun untuk melihat halaman ini.
        </p>
      </header>

      {galat ? (
        <Card>
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          {/* Ringkasan — jawaban tiga detik sebelum orang membaca detailnya. */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {(Object.keys(STATUS) as StatusZona[]).map((s) => (
              <Card key={s} className="p-4">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`size-2.5 rounded-full ${STATUS[s].warna}`}
                  />
                  <span className="text-[13px] font-semibold">
                    {STATUS[s].label}
                  </span>
                </div>
                <p className="tabular mt-2 font-mono text-[26px] leading-none font-bold">
                  {memuat ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    (data?.ringkas[s] ?? 0)
                  )}
                </p>
                <p className="mt-1 text-[12.5px] text-muted">zona</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            {/* Peta zona.
                Catatan: peta MapLibre menyusul di PR berikutnya begitu
                endpoint GeoJSON (BE#10) siap. Sampai itu ada, daftar di
                bawah adalah sumber utamanya — dan daftar itu memang harus
                tetap ada selamanya, karena peta tidak terbaca oleh pembaca
                layar dan gagal dimuat di koneksi buruk. */}
            <Panel
              judul="Peta zona layanan"
              sub="Warna menandai status, nama zona tertulis di tiap kartu."
              aksi={
                <Button
                  varian="halus"
                  ukuran="sm"
                  onClick={muatUlang}
                  aria-label="Muat ulang status"
                >
                  <RefreshCw size={15} />
                  Perbarui
                </Button>
              }
            >
              {memuat ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {zona.map((z) => (
                    <KartuZona
                      key={z.id}
                      zona={z}
                      terpilih={z.id === dipilih}
                      onPilih={() =>
                        setDipilih(z.id === dipilih ? null : z.id)
                      }
                    />
                  ))}
                </div>
              )}
              {data ? (
                <p className="mt-4 text-[12.5px] text-muted">
                  Diperbarui {tanggalJam(data.ts)}
                </p>
              ) : null}
            </Panel>

            <Panel judul={aktif ? "Detail zona" : "Pilih satu zona"}>
              {aktif ? (
                <DetailZona zona={aktif} />
              ) : (
                <p className="text-[13.5px] leading-relaxed text-muted">
                  Klik salah satu zona untuk melihat penyebab gangguan, jumlah
                  pelanggan terdampak, dan perkiraan waktu pulih.
                </p>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function KartuZona({
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
      className={`rounded-card border p-4 text-left transition-colors ${
        terpilih
          ? "border-brand-400 bg-brand-50 dark:bg-brand-900/25"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-display font-bold">
          <MapPin size={15} className="text-muted" aria-hidden />
          {zona.nama}
        </span>
        <Badge nada={s.nada} titik>
          {s.label}
        </Badge>
      </div>
      {zona.pelangganTerdampak > 0 ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-muted">
          <Users size={13} aria-hidden />
          {angka(zona.pelangganTerdampak)} pelanggan terdampak
        </p>
      ) : (
        <p className="mt-2.5 text-[12.5px] text-muted">
          Tidak ada gangguan dilaporkan
        </p>
      )}
    </button>
  );
}

function DetailZona({ zona }: { zona: ZonaStatus }) {
  const s = STATUS[zona.status];
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{zona.nama}</h3>
        <Badge nada={s.nada} titik>
          {s.label}
        </Badge>
      </div>

      {zona.keterangan ? (
        <p className="mt-3 text-[13.5px] leading-relaxed">{zona.keterangan}</p>
      ) : (
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
          Layanan di zona ini berjalan normal. Tidak ada pekerjaan perbaikan
          yang sedang berlangsung.
        </p>
      )}

      <dl className="mt-5 space-y-3 border-t border-line pt-4 text-[13px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Pelanggan terdampak</dt>
          <dd className="tabular font-mono font-semibold">
            {angka(zona.pelangganTerdampak)}
          </dd>
        </div>
        {zona.sejak ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Sejak</dt>
            <dd className="text-right font-medium">{tanggalJam(zona.sejak)}</dd>
          </div>
        ) : null}
        {zona.perkiraanPulih ? (
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted">
              <Clock size={13} aria-hidden />
              Perkiraan pulih
            </dt>
            <dd className="text-right font-medium">
              {tanggalJam(zona.perkiraanPulih)}
            </dd>
          </div>
        ) : null}
      </dl>

      {zona.status !== "normal" ? (
        <p className="mt-5 rounded-input bg-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
          Perkiraan waktu pulih bisa berubah mengikuti kondisi di lapangan.
          Sudah melapor? Lacak perkembangannya di halaman Lacak Pengaduan.
        </p>
      ) : null}
    </div>
  );
}
