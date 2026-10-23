"use client";

/**
 * J03 — Lacak pengaduan dengan nomor tiket. TANPA LOGIN.
 *
 * Inilah yang membuat "tracking yang transparan dari sisi pengguna" pada
 * subtema menjadi nyata, bukan klaim: melacak pengaduan semudah melacak paket.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Search } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { Badge, type Nada } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Pemberitahuan } from "@/components/ui/keadaan";
import { api, ApiError } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import type { LacakTiket } from "@/types/publik";

const STATUS: Record<LacakTiket["status"], { label: string; nada: Nada }> = {
  BARU: { label: "Baru diterima", nada: "info" },
  DIPROSES: { label: "Sedang ditangani", nada: "peringatan" },
  SELESAI: { label: "Selesai", nada: "sukses" },
};

/**
 * Sisa waktu SLA dihitung dari stempel waktu milik SERVER.
 *
 * Jangan menghitung tenggatnya sendiri di klien: jam browser warga dan jam
 * browser petugas bisa berbeda, dan dua layar akan menampilkan sisa waktu
 * yang tidak sama untuk tiket yang sama.
 */
function sisaSla(jatuhTempo: string, terlampaui: boolean): string {
  const selisih = new Date(jatuhTempo).getTime() - Date.now();
  const menit = Math.round(Math.abs(selisih) / 60000);
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  const durasi = jam > 0 ? `${jam} jam ${sisa} menit` : `${menit} menit`;
  return terlampaui || selisih < 0
    ? `Melewati batas ${durasi}`
    : `Sisa ${durasi}`;
}

export default function HalamanLacak() {
  const [nomor, setNomor] = useState("");
  const [tiket, setTiket] = useState<LacakTiket | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function cari(e: FormEvent) {
    e.preventDefault();
    const bersih = nomor.trim();
    if (!bersih) return;

    setSibuk(true);
    setGalat(null);
    setTiket(null);
    try {
      const hasil = await api<LacakTiket>(
        `/api/publik/lacak/${encodeURIComponent(bersih)}`,
      );
      setTiket(hasil);
    } catch (e) {
      // Pesan dari server sudah menjelaskan apa yang harus dilakukan;
      // menggantinya dengan kalimat umum justru menghapus petunjuknya.
      setGalat(
        e instanceof ApiError
          ? e.message
          : "Gagal menghubungi server. Coba lagi beberapa saat.",
      );
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-8 text-center">
        <p className="eyebrow text-brand-600">Transparansi</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Lacak Pengaduan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Masukkan nomor pengaduan dari bukti laporan Anda. Tidak perlu masuk
          ke akun.
        </p>
      </header>

      <Card className="p-5 sm:p-6">
        <form onSubmit={cari} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField
            label="Nomor pengaduan"
            placeholder="LP-2026-10-0384"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            hint="Boleh diketik dengan atau tanpa tanda hubung."
            depan={<Search size={16} aria-hidden />}
            autoComplete="off"
          />
          <Button
            type="submit"
            ukuran="lg"
            memuat={sibuk}
            disabled={nomor.trim() === ""}
            className="sm:mb-6"
          >
            Lacak
          </Button>
        </form>
      </Card>

      {galat ? (
        <div className="mt-5">
          <Pemberitahuan nada="peringatan" judul="Tidak ditemukan">
            {galat}
          </Pemberitahuan>
        </div>
      ) : null}

      {tiket ? <HasilTiket tiket={tiket} /> : null}

      {!tiket && !galat ? (
        <p className="mt-8 text-center text-[13px] text-muted">
          Belum pernah melapor?{" "}
          <Link href="/masuk" className="font-semibold text-brand-600 hover:underline">
            Masuk ke akun Anda
          </Link>{" "}
          untuk mengirim pengaduan baru.
        </p>
      ) : null}
    </div>
  );
}

function HasilTiket({ tiket }: { tiket: LacakTiket }) {
  const s = STATUS[tiket.status];
  const selesai = tiket.status === "SELESAI";

  return (
    <div className="mt-6 space-y-5">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="tabular font-mono text-lg font-bold">{tiket.nomor}</p>
            <p className="mt-1 text-[13.5px] text-muted">
              {tiket.kategori} · Zona {tiket.zona}
            </p>
          </div>
          <Badge nada={s.nada} titik>
            {s.label}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-muted">Dilaporkan</dt>
            <dd className="font-medium sm:mt-0.5">
              {tanggalJam(tiket.dibuatPada)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-muted">Batas waktu penanganan</dt>
            <dd
              className={`font-semibold sm:mt-0.5 ${
                tiket.slaTerlampaui ? "text-danger" : "text-ink"
              }`}
            >
              {selesai && !tiket.slaTerlampaui
                ? "Selesai tepat waktu"
                : sisaSla(tiket.slaJatuhTempo, tiket.slaTerlampaui)}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel judul="Kronologi penanganan">
        <ol className="relative space-y-5 pl-6">
          {/* Garis vertikal penghubung langkah. */}
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-[0.3125rem] w-px bg-line"
          />
          {tiket.kronologi.map((k, i) => {
            const terakhir = i === tiket.kronologi.length - 1;
            return (
              <li key={k.waktu + k.judul} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-1 -left-6 flex size-2.5 items-center justify-center rounded-full ${
                    terakhir && selesai
                      ? "bg-success"
                      : terakhir
                        ? "bg-brand-500"
                        : "bg-line-strong"
                  }`}
                >
                  {terakhir && selesai ? (
                    <Check size={8} className="text-white" />
                  ) : null}
                </span>
                <p className="text-[14px] font-semibold">{k.judul}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {tanggalJam(k.waktu)}
                </p>
                {k.catatan ? (
                  <p className="mt-1 text-[13px] text-muted">{k.catatan}</p>
                ) : null}
              </li>
            );
          })}
        </ol>

        {/* Halaman ini hanya menampilkan status dan kronologi. Nama, alamat,
            dan kontak pelapor TIDAK pernah ikut — nomor tiket cukup untuk
            melacak, tapi tidak boleh membocorkan siapa pelapornya. */}
        <p className="mt-6 rounded-input bg-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
          Demi privasi pelapor, halaman ini tidak menampilkan nama, alamat,
          maupun kontak siapa pun.
        </p>
      </Panel>

      <p className="text-center text-[13px] text-muted">
        Ingin tahu seberapa cepat pengaduan ditangani secara keseluruhan?{" "}
        <Link href="/kinerja" className="font-semibold text-brand-600 hover:underline">
          Lihat rapor kinerja
        </Link>
      </p>
    </div>
  );
}
