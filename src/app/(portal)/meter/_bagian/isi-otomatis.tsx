"use client";

import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { angka, liter, rupiah, tanggalJam } from "@/lib/format";
import {
  AMBANG_MAKS_L,
  AMBANG_MIN_L,
  useIsiOtomatis,
  type MetodeBayar,
} from "../_hooks/use-isi-otomatis";

const METODE: { id: MetodeBayar; nama: string }[] = [
  { id: "QRIS", nama: "QRIS" },
  { id: "VA", nama: "Virtual Account" },
  { id: "EWALLET", nama: "E-Wallet" },
  { id: "GERAI", nama: "Gerai Retail" },
];

/**
 * Pengaturan isi ulang otomatis untuk meter yang sedang dibuka.
 *
 * Landing menjanjikan fitur ini dan backend-nya sudah lama berjalan, tetapi
 * sebelumnya tidak ada satu layar pun untuk menyalakannya. Fitur yang hanya
 * bisa dinyalakan lewat panggilan API tidak ada bagi warga.
 *
 * Teks di bawah sengaja menyebut bahwa token TIDAK ditukarkan sendiri.
 * Pembelian otomatis menerbitkan token dan mengirim struknya, tetapi saldo
 * meter baru naik setelah kodenya dimasukkan. Menyembunyikan langkah itu
 * membuat warga mengira airnya aman padahal tokennya masih menunggu.
 */
export function IsiOtomatis({ meterId }: { meterId: string }) {
  const isi = useIsiOtomatis(meterId);
  const d = isi.draf;

  return (
    <section
      aria-labelledby="judul-isi-otomatis"
      className="rounded-[4px] border border-line bg-surface p-6 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2
            id="judul-isi-otomatis"
            className="font-display text-base font-bold text-ink"
          >
            Isi Ulang Otomatis
          </h2>
          <p className="text-xs text-muted">
            Token dibeli otomatis saat saldo meter ini turun di bawah ambang.
          </p>
        </div>
        <RefreshCw size={20} className="shrink-0 text-muted" aria-hidden />
      </div>

      {isi.galatMuat ? (
        <p role="alert" className="mt-4 text-xs text-danger">
          {isi.galatMuat}
        </p>
      ) : isi.memuat || !d ? (
        <div className="mt-4 space-y-3" aria-busy>
          <div className="h-11 animate-pulse rounded-input bg-soft" />
          <div className="h-11 animate-pulse rounded-input bg-soft" />
        </div>
      ) : (
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void isi.simpan();
          }}
        >
          <label className="cekung flex cursor-pointer items-center justify-between gap-3 p-3">
            <span className="text-[13px] font-semibold text-ink">
              Aktifkan isi otomatis
            </span>
            <span className="flex items-center gap-2">
              {d.aktif ? (
                <Badge nada="sukses" titik>
                  Aktif
                </Badge>
              ) : (
                <Badge nada="netral">Mati</Badge>
              )}
              <input
                type="checkbox"
                checked={d.aktif}
                onChange={(e) => isi.ubah({ aktif: e.target.checked })}
                className="cincin-fokus size-4 accent-brand-600"
              />
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Beli saat saldo di bawah
              </span>
              <span className="relative block">
                <input
                  type="number"
                  inputMode="numeric"
                  min={AMBANG_MIN_L}
                  max={AMBANG_MAKS_L}
                  step={1}
                  value={Number.isFinite(d.ambangL) ? d.ambangL : ""}
                  onChange={(e) =>
                    isi.ubah({ ambangL: Math.trunc(Number(e.target.value)) })
                  }
                  aria-invalid={!isi.ambangSah}
                  aria-describedby="bantuan-ambang"
                  className="cincin-fokus cekung tabular h-11 w-full pr-8 pl-3 font-mono text-sm text-ink outline-none focus:bg-surface"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted">
                  L
                </span>
              </span>
              <span
                id="bantuan-ambang"
                className={`mt-1 block text-[11px] ${isi.ambangSah ? "text-muted" : "text-danger"}`}
              >
                Antara {angka(AMBANG_MIN_L)} dan {angka(AMBANG_MAKS_L)} liter.
                Alarm meter berbunyi di 5 liter, jadi ambang ini sebaiknya
                jauh di atasnya.
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Paket yang dibeli
              </span>
              <select
                value={d.volumeL}
                onChange={(e) => isi.ubah({ volumeL: Number(e.target.value) })}
                className="cincin-fokus cekung tabular h-11 w-full px-3 font-mono text-sm text-ink outline-none focus:bg-surface"
              >
                {/* Paket tersimpan yang tidak ada di katalog tetap ditampilkan,
                    supaya pilihan warga tidak tertimpa diam-diam. */}
                {!isi.paket.some((p) => p.volumeL === d.volumeL) ? (
                  <option value={d.volumeL}>{liter(d.volumeL, 0)}</option>
                ) : null}
                {isi.paket.map((p) => (
                  <option key={p.volumeL} value={p.volumeL}>
                    {liter(p.volumeL, 0)} · {rupiah(p.hargaRp)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block max-w-xs">
            <span className="mb-1.5 block text-xs font-semibold text-ink">
              Metode bayar
            </span>
            <select
              value={d.metode}
              onChange={(e) => isi.ubah({ metode: e.target.value as MetodeBayar })}
              className="cincin-fokus cekung h-11 w-full px-3 text-sm text-ink outline-none focus:bg-surface"
            >
              {METODE.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </select>
          </label>

          <dl className="divide-y divide-line border-y border-line text-xs">
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-muted">Tagihan tiap pembelian</dt>
              <dd className="tabular font-mono font-semibold text-ink">
                {isi.hargaTerpilih !== null ? rupiah(isi.hargaTerpilih) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-muted">Pembelian otomatis terakhir</dt>
              <dd className="tabular font-mono text-ink">
                {d.terakhirPada ? tanggalJam(d.terakhirPada) : "Belum pernah"}
              </dd>
            </div>
          </dl>

          <p className="text-[11.5px] leading-relaxed text-muted">
            Setelah membeli, sistem menunggu enam jam sebelum boleh membeli
            lagi. Token yang terbit dikirim lewat email dan saluran kabar
            Anda, lalu tetap perlu dimasukkan ke meter agar saldonya
            bertambah.
          </p>

          <Button
            type="submit"
            memuat={isi.menyimpan}
            disabled={!isi.berubah || !isi.ambangSah}
          >
            Simpan Pengaturan
          </Button>

          {isi.hasil ? (
            <p
              role="alert"
              className={`rounded-[10px] border p-2.5 text-xs font-medium ${
                isi.hasil.tipe === "sukses"
                  ? "border-success/40 bg-success-soft text-success"
                  : "border-danger/40 bg-danger-soft text-danger"
              }`}
            >
              {isi.hasil.teks}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
