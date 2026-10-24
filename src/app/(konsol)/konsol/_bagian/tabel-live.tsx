"use client";

/**
 * Tabel pelanggan live — meter yang sedang MENGALIR detik ini.
 *
 * ── Barisnya tidak boleh melompat ──────────────────────────────────────
 *
 * Tabel ini diperbarui terus-menerus sementara petugas sedang membacanya.
 * Kalau tinggi barisnya ditentukan isinya, satu lencana yang muncul atau
 * satu nama yang membungkus ke dua baris menggeser SELURUH tabel ke bawah —
 * dan baris yang sedang dibaca orang berpindah di bawah kursornya.
 *
 * Dua kunci dipasang untuk itu, dan keduanya perlu:
 *
 * - Isi tiap sel dibungkus kotak bertinggi TETAP (`h-9`), jadi tinggi baris
 *   tidak bergantung pada apa pun yang ada di dalamnya.
 * - Semua angka memakai `font-mono` + `.tabular`, jadi "1" dan "8" selebar
 *   sama dan kolomnya tidak bergoyang saat nilainya berubah.
 *
 * ── Kenapa debitnya digambar ───────────────────────────────────────────
 *
 * `FlowVis` hanya bergerak saat debitnya benar-benar di atas nol. Satu
 * kolom yang bergerak di antara enam kolom diam adalah cara tercepat
 * menunjukkan baris mana yang sedang hidup — dan ia diambil dari subjeknya
 * sendiri, bukan hiasan yang bisa ditempel di tabel mana pun.
 */

import { Badge, type Nada } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import { FlowVis } from "@/components/domain/live";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AMBANG_ALARM_L, angkaSah, type BarisLive } from "./tipe";

/** Tinggi tetap isi sel. Diubah di satu tempat, berlaku ke semua kolom. */
const SEL = "flex h-9 items-center";

interface Keadaan {
  kata: string;
  nada: Nada;
}

/**
 * Status satu baris, DITURUNKAN dari angkanya — bukan medan tersendiri.
 *
 * Urutannya disengaja: saklar tertutup mengalahkan saldo, karena air yang
 * sudah berhenti bukan lagi perkara saldo menipis.
 */
function keadaanBaris(b: BarisLive): Keadaan {
  if (!b.saklarOn) return { kata: "Saklar tutup", nada: "netral" };
  if (!b.relayOn) return { kata: "Relay lepas", nada: "bahaya" };
  const saldo = angkaSah(b.saldoL);
  if (saldo === null) return { kata: "Saldo tak terbaca", nada: "netral" };
  if (saldo <= AMBANG_ALARM_L)
    return { kata: "Saldo tipis", nada: "peringatan" };
  return { kata: "Mengalir", nada: "sukses" };
}

/** `Buka` / `Tutup` — kata lebih dulu, warna menyusul. */
function Saklar({ on }: { on: boolean }) {
  return (
    <span className={cn(SEL, "justify-end gap-1.5")}>
      <span
        aria-hidden
        className={cn(
          "h-3 w-[2px] shrink-0",
          on ? "bg-success" : "bg-line-strong",
        )}
      />
      <span
        className={cn(
          "font-mono text-[12.5px] font-semibold",
          on ? "text-success" : "text-muted",
        )}
      >
        {on ? "Buka" : "Tutup"}
      </span>
    </span>
  );
}

export function TabelLive({
  baris,
  memuat,
}: {
  baris: BarisLive[] | undefined;
  memuat: boolean;
}) {
  if (memuat) {
    return (
      <div className="space-y-2 p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  const data = baris ?? [];

  const kolom: Kolom<BarisLive>[] = [
    {
      kunci: "pelanggan",
      label: "Pelanggan",
      render: (b) => {
        const k = keadaanBaris(b);
        return (
          <span className="flex h-9 min-w-0 flex-col justify-center">
            <span className="truncate text-[13px] font-medium">{b.nama}</span>
            <span className="truncate font-mono text-[11px] text-muted">
              {b.id}
              {/* Di bawah `md` kolom status disembunyikan, jadi katanya ikut
                  turun ke sini. Status tanpa kata hanya berlaku bagi orang
                  yang bisa membedakan warnanya. */}
              <span className="md:hidden"> · {k.kata}</span>
            </span>
          </span>
        );
      },
    },
    {
      kunci: "zona",
      label: "Zona",
      sembunyiKecil: true,
      render: (b) => (
        <span className={cn(SEL, "truncate text-[13px] text-muted")}>
          {b.zona}
        </span>
      ),
    },
    {
      kunci: "status",
      label: "Status",
      sembunyiKecil: true,
      render: (b) => {
        const k = keadaanBaris(b);
        return (
          <span className={SEL}>
            <Badge nada={k.nada} titik>
              {k.kata}
            </Badge>
          </span>
        );
      },
    },
    {
      kunci: "saldo",
      label: "Saldo (L)",
      rata: "kanan",
      render: (b) => {
        const v = angkaSah(b.saldoL);
        return (
          <span
            className={cn(
              SEL,
              "tabular justify-end font-mono text-[13px] font-semibold",
              v === null
                ? "text-muted"
                : v <= AMBANG_ALARM_L
                  ? "text-warn"
                  : "text-ink",
            )}
          >
            {v === null ? "—" : angka(v, 1)}
          </span>
        );
      },
    },
    {
      kunci: "debit",
      label: "Debit (L/mnt)",
      rata: "kanan",
      render: (b) => {
        const v = angkaSah(b.debitLpm);
        return (
          <span className={cn(SEL, "justify-end gap-2.5")}>
            {/* Batang aliran hanya muncul saat kolomnya cukup lega; di ponsel
                angkanya yang penting, bukan gambarnya. */}
            <span className="hidden w-10 shrink-0 md:block">
              <FlowVis lpm={v ?? 0} className="h-1.5" />
            </span>
            <span
              className={cn(
                "tabular font-mono text-[13px]",
                v === null
                  ? "text-muted"
                  : v > 0
                    ? "text-brand-600"
                    : "text-muted",
              )}
            >
              {v === null ? "—" : angka(v, 1)}
            </span>
          </span>
        );
      },
    },
    {
      kunci: "saklar",
      label: "Saklar",
      rata: "kanan",
      sembunyiKecil: true,
      render: (b) => <Saklar on={b.saklarOn === true} />,
    },
    {
      kunci: "relay",
      label: "Relay",
      rata: "kanan",
      sembunyiKecil: true,
      render: (b) => (
        <span className={cn(SEL, "justify-end")}>
          <span
            className={cn(
              "font-mono text-[12.5px] font-semibold",
              b.relayOn ? "text-success" : "text-danger",
            )}
          >
            {b.relayOn ? "Aktif" : "Lepas"}
          </span>
        </span>
      ),
    },
  ];

  return (
    <Tabel
      kolom={kolom}
      data={data}
      kunciBaris={(b) => b.id}
      // 19rem = 304px, lebih sempit dari ruang tersisa di layar 390px — jadi
      // empat kolom yang tersisa di ponsel tidak pernah memaksa tabelnya
      // bergulir mendatar di dalam panelnya.
      lebarMin="19rem"
      kosong={
        <KeadaanKosong
          judul="Tidak ada aliran"
          pesan="Tidak ada meter yang sedang mengalirkan air saat ini. Daftar ini terisi sendiri begitu ada yang membuka keran."
        />
      }
    />
  );
}
