"use client";

/**
 * W02 — Dashboard konsol petugas.
 *
 * ── Satu pertanyaan, tiga detik ────────────────────────────────────────
 *
 * Layar ini dipelototi delapan jam sehari oleh orang yang sama, dan setiap
 * kali ia dibuka pertanyaannya persis sama: ADA YANG PERLU DITANGANI
 * SEKARANG ATAU TIDAK? Karena itu urutannya dibalik dari dashboard pada
 * umumnya — jawabannya lebih dulu (pita genting), angka jaringannya
 * menyusul, dan grafik tren baru di bawah. Grafik tidak pernah jadi alasan
 * seseorang mengangkat telepon.
 *
 * Yang padat didahulukan: KPI jadi satu pita bergaris, bukan lima kartu
 * berbayang, supaya tinggi layar yang terbatas diberikan ke tabel live dan
 * dua antrean kerja di rel kanan.
 *
 * ── Kenapa penyegarannya polling, bukan WebSocket ──────────────────────
 *
 * Issue menyebut WebSocket, dan memang ke situ arahnya — tapi kanal WS-nya
 * bagian dari backend yang belum ada (BE). Menuliskan klien WS sekarang
 * berarti menulis klien yang tidak pernah tersambung, lalu menambal
 * "datanya" dengan angka yang dibangkitkan di peramban. Itu bukan live; itu
 * animasi yang menyamar jadi data, dan satu-satunya saat ketahuannya adalah
 * saat angkanya dicocokkan dengan basis data.
 *
 * Jadi yang dipakai pengambilan berkala ke endpoint yang sama. Bentuk
 * antarmukanya sudah benar — nilai berubah tanpa halaman dimuat ulang, isi
 * lama tetap tampil selama yang baru diambil, dan tidak ada yang melompat —
 * jadi menukar sumbernya dengan WS nanti cuma mengganti baris
 * pengambilannya, bukan tata letaknya.
 *
 * ── Dua kebiasaan yang dijaga di seluruh berkas ini ────────────────────
 *
 * - `kpi` adalah ARRAY. Dicari lewat `key` memakai `nilaiKpi()`, tidak
 *   pernah lewat indeks dan tidak pernah dengan mencocokkan `label`.
 * - Tidak ada `NaN`, `undefined`, atau `Infinity` yang boleh sampai ke
 *   layar. Setiap angka lewat `angkaSah()` dulu, dan yang tidak lolos
 *   tampil "—" — bukan 0, karena nol adalah hasil pengukuran.
 */

import { Card } from "@/components/ui/card";
import { KeadaanGalat } from "@/components/ui/keadaan";
import { useDashboard } from "./_hooks/use-dashboard";
import { DenyutSegar, JEDA_SEGAR_DETIK } from "./_bagian/denyut";
import { PitaGenting } from "./_bagian/pita-genting";
import { PitaKpi } from "./_bagian/kpi";
import { PanelUtama } from "./_bagian/panel-utama";
import { RelAntrean } from "./_bagian/rel-antrean";

export default function HalamanKonsol() {
  const d = useDashboard();

  if (d.galat) {
    return (
      <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
        <Card>
          <KeadaanGalat pesan={d.galat} onCoba={d.muatUlang} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
      {/* ── Kepala halaman ──────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Pantauan jaringan</p>
          <h2 className="mt-1.5 font-display text-[1.5rem] leading-tight font-bold tracking-[-0.02em]">
            Keadaan hari ini
          </h2>
          <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-relaxed text-muted">
            Angka di halaman ini diambil ulang setiap {JEDA_SEGAR_DETIK} detik.
            Yang berubah bergerak sendiri; sisanya diam.
          </p>
        </div>

        <DenyutSegar
          memuat={d.memuat}
          menyegarkan={d.menyegarkan}
          onSegarkan={d.muatUlang}
        />
      </header>

      <div aria-hidden className="takar mt-5 h-2.5 border-t border-line" />

      {/* ── Jawaban lebih dulu ──────────────────────────────────────── */}
      <div className="mt-5">
        <PitaGenting
          insiden={d.jumlahInsiden}
          berbunyi={d.jumlahBerbunyi}
          zonaTerdampak={d.zonaTerdampak}
          memuat={d.memuat}
        />
      </div>

      {/* ── Lima KPI jaringan ───────────────────────────────────────── */}
      <div className="mt-5">
        <PitaKpi kpi={d.kpi} memuat={d.memuat} />
      </div>

      {/* ── Isi utama: kerja di kiri, antrean di kanan ──────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <PanelUtama
          data={d.data}
          memuat={d.memuat}
          nrwRata={d.nrwRata}
          labels={d.grafik?.labels ?? []}
          atas={d.atas}
          bawah={d.bawah}
        />
        <RelAntrean
          data={d.data}
          memuat={d.memuat}
          jumlahBerbunyi={d.jumlahBerbunyi}
          jumlahInsiden={d.jumlahInsiden}
        />
      </div>
    </div>
  );
}
