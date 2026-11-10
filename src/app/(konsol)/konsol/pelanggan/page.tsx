"use client";

/**
 * W03 — Konsol: daftar pelanggan.
 *
 * 8.219 pelanggan. Pekerjaan di halaman ini bukan "melihat semuanya"
 * melainkan MENEMUKAN SATU, lalu menindaklanjutinya — kadang satu orang,
 * kadang empat belas sekaligus. Susunannya mengikuti urutan itu:
 *
 *   1. berapa banyak yang sedang bermasalah  → pita ringkasan status
 *   2. persempit                              → cari, zona, urut, keping
 *   3. baca dan bandingkan                    → tabel / daftar bergaris
 *   4. tindak lanjuti                         → bilah aksi massal
 *
 * ── Yang dijaga di berkas ini ────────────────────────────────────────
 *
 * - **Paginasi dari server.** Yang berpindah hanya `?halaman=`. Lihat
 *   `_bagian/paginasi.tsx`.
 * - **Pencarian ditunda 300 ms.** Tanpa tundaan, "Agus Firdaus" adalah dua
 *   belas permintaan ke server dan dua belas kali tabel berkedip.
 * - **Pilihan melintasi halaman**, dan jumlahnya selalu ditulis di depan
 *   mata sebelum aksi massal berjalan.
 * - **Ekspor CSV berlokal Indonesia.** Lihat alasannya di `_bagian/csv.ts`.
 */

import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KeadaanGalat, KeadaanKosong, Pemberitahuan, Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePelanggan } from "./_hooks/use-pelanggan";
import { BilahMassal } from "./_bagian/bilah-massal";
import { DaftarPelangganTabel, KotakSemua } from "./_bagian/daftar";
import { DialogKonfirmasiMassal, DialogTutupRelay } from "./_bagian/dialog-relay";
import { Paginasi } from "./_bagian/paginasi";
import { PitaStatus } from "./_bagian/pita-status";
import { Penyaring } from "./_bagian/penyaring";

export default function HalamanPelanggan() {
  const p = usePelanggan();
  const { data, baris, memuat, menyegarkan, galat, muatUlang, total, kabar, gantiSaringan } = p;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Basis pelanggan</p>
          <h1 className="mt-1.5 font-display text-[clamp(1.6rem,4vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            Pelanggan terdaftar
          </h1>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Cari satu pelanggan di antara{" "}
            <span className="tabular font-mono font-semibold text-ink">
              {total === null ? "—" : angka(total)}
            </span>{" "}
            meter terpasang, lalu tindak lanjuti dari sini. Saldo dan debit
            dibaca dari telemetri terakhir tiap meter.
          </p>
        </div>
        <Button
          varian="halus"
          onClick={muatUlang}
          aria-label="Muat ulang daftar pelanggan"
        >
          <RefreshCw
            size={15}
            aria-hidden
            className={cn(menyegarkan && "motion-aware animate-spin")}
          />
          Perbarui
        </Button>
      </header>

      {galat ? (
        <Card className="mt-7">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          <PitaStatus data={data} memuat={memuat} />

          <Card className="mt-6 p-4 sm:p-5">
            <Penyaring
              cari={p.cari}
              onCari={(v) => gantiSaringan(() => p.setCari(v))}
              zona={p.zona}
              onZona={(v) => gantiSaringan(() => p.setZona(v))}
              daftarZona={data?.zona ?? []}
              saring={p.saring}
              onSaring={(v) => gantiSaringan(() => p.setSaring(v))}
              urutan={p.urutan}
              onUrutan={(v) => gantiSaringan(() => p.setUrutan(v))}
              jumlahSaring={data?.jumlahSaring ?? null}
              total={total}
            />
          </Card>

          {kabar ? (
            <div className="mt-4">
              <Pemberitahuan nada={kabar.nada} judul={kabar.judul}>
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
                  <p className="max-w-[72ch]">{kabar.teks}</p>
                  <button
                    type="button"
                    onClick={() => p.setKabar(null)}
                    className="shrink-0 text-[12.5px] font-semibold underline underline-offset-2"
                  >
                    Tutup
                  </button>
                </div>
              </Pemberitahuan>
            </div>
          ) : null}

          <Card className="mt-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3 sm:px-5">
              <KotakSemua
                semua={p.semuaHalamanTerpilih}
                sebagian={p.sebagianTerpilih}
                jumlah={baris.length}
                onUbah={p.toggleHalaman}
              />
              <Button
                varian="sekunder"
                ukuran="sm"
                onClick={p.ekspor}
                disabled={p.barisEkspor.length === 0}
              >
                <Download size={14} aria-hidden />
                Ekspor CSV ({angka(p.barisEkspor.length)} baris)
              </Button>
            </div>

            {memuat ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DaftarPelangganTabel
                baris={baris}
                terpilih={p.terpilih}
                onToggle={p.togglePilih}
                menyegarkan={menyegarkan}
                kosong={
                  <KeadaanKosong
                    judul="Tidak ada pelanggan yang cocok"
                    pesan="Tidak ada yang cocok dengan pencarian, zona, dan saringan yang sedang aktif. Longgarkan salah satunya."
                    aksi={
                      <Button
                        varian="sekunder"
                        onClick={() =>
                          gantiSaringan(() => {
                            p.setCari("");
                            p.setZona("");
                            p.setSaring("");
                          })
                        }
                      >
                        Kosongkan semua saringan
                      </Button>
                    }
                  />
                }
              />
            )}

            {data && data.total > 0 ? (
              <Paginasi
                halaman={data.halaman}
                halamanTerakhir={data.halamanTerakhir}
                perHalaman={data.perHalaman}
                total={data.total}
                jumlahDitampilkan={baris.length}
                onHalaman={p.setHalaman}
                onPerHalaman={(n) => gantiSaringan(() => p.setPerHalaman(n))}
              />
            ) : null}
          </Card>

          <p className="mt-4 max-w-[70ch] text-[12.5px] leading-relaxed text-muted">
            Pilihan tetap tersimpan saat Anda berpindah halaman — jumlah di
            bilah bawah adalah jumlah sesungguhnya, bukan jumlah yang terlihat
            di layar ini.
          </p>
        </>
      )}

      <BilahMassal
        jumlah={p.jumlahTerpilih}
        onKosongkan={() => p.setTerpilih(new Set())}
        onEmail={() => p.setAksi("email")}
        onTutupRelay={() => p.setAksi("relay")}
        sibuk={p.sibuk}
      />

      {p.aksi === "email" ? (
        <DialogKonfirmasiMassal
          judul={`Kirim email ke ${angka(p.jumlahTerpilih)} pelanggan?`}
          sub="Email berisi pengingat memeriksa saldo dan cara mengisi ulang. Email yang sudah terkirim tidak bisa ditarik kembali."
          labelAksi="Kirim sekarang"
          jumlah={p.jumlahTerpilih}
          onBatal={() => p.setAksi(null)}
          onKonfirmasi={p.jalankanEmail}
        />
      ) : null}

      {p.aksi === "relay" ? (
        <DialogTutupRelay
          jumlah={p.jumlahTerpilih}
          namaTunggal={p.namaTunggal}
          onBatal={() => p.setAksi(null)}
          onKonfirmasi={p.jalankanTutupRelay}
        />
      ) : null}
    </div>
  );
}
