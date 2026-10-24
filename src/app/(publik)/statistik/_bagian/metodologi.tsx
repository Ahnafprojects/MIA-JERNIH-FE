"use client";

import { Skeleton } from "@/components/ui/keadaan";
import { JudulSeksi } from "./judul-seksi";
import type { MetaData } from "./tipe";

/**
 * Dari mana angkanya, seberapa sering diperbarui, bagaimana dihitung, dan
 * apa batasannya.
 *
 * Bagian terakhirnya yang paling sering dihilangkan orang, dan justru itu
 * yang paling menentukan. Halaman data yang tidak pernah menyebut satu pun
 * kelemahannya sendiri selalu punya satu dari dua arti: penyusunnya belum
 * memeriksa, atau sudah memeriksa dan memilih diam. Keduanya alasan untuk
 * tidak mempercayai angkanya. Menyebut batasan lebih dulu menukar klaim
 * "angka ini benar" dengan sesuatu yang jauh lebih bisa dipegang: "beginilah
 * cara angka ini dibuat, periksalah sendiri."
 *
 * Daftar batasan datang dari API, bukan ditulis di komponen — supaya orang
 * yang mengambil datanya lewat `/api/publik/neraca-air` ikut membacanya.
 * Data terbuka tanpa daftar batasan adalah undangan untuk salah kutip.
 */

const RUMUS = [
  ["Kehilangan air", "Air disalurkan − Air tercatat"],
  ["Kehilangan air (NRW), %", "Kehilangan air ÷ Air disalurkan × 100"],
  ["Komponen neraca air", "Kehilangan air × porsi hasil audit triwulanan"],
  [
    "Liter/orang/hari",
    "Air tercatat × 1.000 ÷ jiwa terlayani ÷ jumlah hari",
  ],
];

export function SeksiMetodologi({
  meta,
  memuat,
}: {
  meta: MetaData | null;
  memuat: boolean;
}) {
  return (
    <section className="mt-12">
      <JudulSeksi judul="Bagaimana angka ini dibuat">
        Angka tanpa cara hitung hanya bisa dipercaya atau tidak dipercaya.
        Dengan cara hitungnya, ia bisa diperiksa — dan itu dua hal yang
        berbeda.
      </JudulSeksi>

      {memuat ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !meta ? (
        // Bukan rangka pemuatan yang menggantung selamanya: kalau keterangan
        // metodologinya gagal datang, halaman mengatakannya.
        <p role="status" className="mt-6 max-w-[62ch] text-[13.5px] text-muted">
          Keterangan sumber dan batasan data belum bisa dimuat. Isinya tetap
          bisa dibaca langsung di{" "}
          <code className="font-mono text-[12px] text-ink">
            meta
          </code>{" "}
          pada jawaban endpoint neraca air di atas.
        </p>
      ) : (
        <>
          <dl className="mt-6 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
            <div className="border-b border-line py-5">
              <dt className="font-display text-[15px] font-bold tracking-tight">
                Dari mana angkanya
              </dt>
              <dd className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">
                {meta.sumber}
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="font-display text-[15px] font-bold tracking-tight">
                Seberapa sering diperbarui
              </dt>
              <dd className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">
                {meta.pembaruan}
              </dd>
            </div>
            <div className="border-b border-line py-5 sm:col-span-2">
              <dt className="font-display text-[15px] font-bold tracking-tight">
                Lisensi dan cara mengutip
              </dt>
              <dd className="mt-1.5 max-w-[72ch] text-[13.5px] leading-relaxed text-muted">
                {meta.lisensi} Saat mengutip, sertakan rentang waktunya —
                angka 7 hari dan 90 hari menjawab pertanyaan yang berbeda.
              </dd>
            </div>
          </dl>

          {/* ── Rumus ──────────────────────────────────────────────── */}
          <h3 className="mt-9 font-display text-[15px] font-bold tracking-tight">
            Cara menghitungnya
          </h3>
          <div className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
            <ul>
              {RUMUS.map(([nama, rumus], i) => (
                <li
                  key={nama}
                  className={
                    i > 0
                      ? "border-t border-line px-5 py-3.5"
                      : "px-5 py-3.5"
                  }
                >
                  <p className="eyebrow text-muted">{nama}</p>
                  {/*
                   * Rumus panjang DIBUNGKUS, bukan digulirkan.
                   *
                   * Versi sebelumnya `whitespace-nowrap overflow-x-auto`: di
                   * 320px dua rumus terpanjang terpotong di tengah ("Air
                   * tercatat × 1.000 ÷ jiwa terla…") dan sisanya hanya muncul
                   * kalau barisnya digeser — padahal pembagi di ujung kanan
                   * itulah bagian yang paling sering dipertanyakan. Rumus ini
                   * kalimat, bukan tabel; ia boleh pindah baris.
                   */}
                  <p className="tabular mt-1.5 font-mono text-[12.5px] leading-relaxed text-balance text-ink">
                    {rumus}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Batasan ────────────────────────────────────────────── */}
          <h3 className="mt-9 font-display text-[15px] font-bold tracking-tight">
            Apa yang belum bisa dijamin halaman ini
          </h3>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Daftar ini ikut terkirim bersama datanya di{" "}
            <code className="font-mono text-[12px] text-ink">meta.catatan</code>
            , jadi siapa pun yang memakai API-nya membaca hal yang sama.
          </p>
          <ul className="mt-4 border-t border-line">
            {meta.catatan.map((c) => (
              <li
                key={c}
                className="flex gap-3.5 border-b border-line py-3.5 text-[13.5px] leading-relaxed text-muted"
              >
                <span
                  aria-hidden
                  className="mt-[0.6em] h-px w-3.5 shrink-0 bg-line-strong"
                />
                <span className="max-w-[66ch]">{c}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
