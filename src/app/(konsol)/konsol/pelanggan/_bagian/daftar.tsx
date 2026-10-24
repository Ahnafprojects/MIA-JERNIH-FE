"use client";

/**
 * Daftar pelanggan — dua susunan untuk satu data.
 *
 * Mulai lebar `md` isinya TABEL: tujuh kolom yang sejajar antarbaris, karena
 * pekerjaan di layar ini adalah membandingkan — saldo siapa yang paling
 * tipis, zona mana yang paling banyak offline. Di bawah itu tabel yang sama
 * harus digulir mendatar untuk dibaca, dan tabel yang digulir mendatar
 * berhenti bisa dibandingkan sama sekali.
 *
 * Maka di ponsel susunannya DAFTAR BERGARIS, bukan kartu bertumpuk: tiap
 * baris satu pelanggan, dipisah garis, dengan empat hal yang benar-benar
 * dipakai untuk memutuskan (nama, zona, saldo, status). Kolom yang hilang —
 * debit, saklar, relay — ada lengkap di halaman detail yang hanya sejauh
 * satu ketukan.
 *
 * Bukan dua komponen terpisah: satu berkas, satu sumber kolom, satu perilaku
 * pilihan. Dua berkas berarti dua tempat yang bisa berbeda diam-diam.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Kolom, Tabel } from "@/components/ui/tabel";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TabungSaldo, SKALA_TABUNG } from "./tabung";
import { STATUS_METER, nadaSaldo, type BarisPelanggan } from "./tipe";

const jalurDetail = (id: string) => `/konsol/pelanggan/${encodeURIComponent(id)}`;

/** Kotak centang satu baris. Klik di sini TIDAK ikut membuka detail. */
function Centang({
  id,
  nama,
  aktif,
  onUbah,
}: {
  id: string;
  nama: string;
  aktif: boolean;
  onUbah: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={aktif}
      onChange={onUbah}
      // Baris bisa diklik untuk membuka detail. Tanpa penahan ini, mencentang
      // satu baris langsung melempar petugas keluar dari daftarnya.
      onClick={(e) => e.stopPropagation()}
      aria-label={`Pilih ${nama} (${id})`}
      className="size-4 shrink-0 cursor-pointer accent-brand-600"
    />
  );
}

function SaldoSel({ baris }: { baris: BarisPelanggan }) {
  const nada = nadaSaldo(baris.saldoL);
  return (
    <div className="min-w-[7rem]">
      <p
        className={cn(
          "tabular font-mono text-[13.5px] font-semibold",
          nada === "bahaya"
            ? "text-danger"
            : nada === "peringatan"
              ? "text-warn"
              : "text-ink",
        )}
      >
        {angka(baris.saldoL, 2)}
        <span className="ml-1 text-[11px] font-normal text-muted">L</span>
      </p>
      <TabungSaldo saldoL={baris.saldoL} className="mt-1.5" />
    </div>
  );
}

/** Saklar dan relay dibaca berpasangan: keduanya harus ON agar air mengalir. */
function SaklarRelay({ baris }: { baris: BarisPelanggan }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge nada={baris.saklarOn ? "sukses" : "netral"} titik>
        Saklar {baris.saklarOn ? "ON" : "OFF"}
      </Badge>
      <Badge nada={baris.relayOn ? "sukses" : "bahaya"} titik>
        Relay {baris.relayOn ? "buka" : "tutup"}
      </Badge>
    </div>
  );
}

export function DaftarPelangganTabel({
  baris,
  terpilih,
  onToggle,
  kosong,
  menyegarkan,
}: {
  baris: BarisPelanggan[];
  terpilih: Set<string>;
  onToggle: (id: string) => void;
  kosong?: React.ReactNode;
  menyegarkan?: boolean;
}) {
  const router = useRouter();
  const kolom: Kolom<BarisPelanggan>[] = [
    {
      kunci: "pilih",
      label: "Pilih",
      render: (b) => (
        <Centang
          id={b.id}
          nama={b.nama}
          aktif={terpilih.has(b.id)}
          onUbah={() => onToggle(b.id)}
        />
      ),
    },
    {
      kunci: "nama",
      label: "Pelanggan",
      render: (b) => (
        <div className="min-w-0">
          {/*
            Nama adalah TAUTAN, bukan hanya teks di dalam baris yang bisa
            diklik. Baris yang bisa diklik nyaman untuk tetikus tapi tidak
            ada bagi pengguna papan ketik dan pembaca layar; tautan ini yang
            membuat detailnya benar-benar bisa dicapai semua orang.
          */}
          <Link
            href={jalurDetail(b.id)}
            onClick={(e) => e.stopPropagation()}
            className="font-display text-[14px] font-bold tracking-[-0.01em] hover:text-brand-600 hover:underline"
          >
            {b.nama}
          </Link>
          <p className="tabular mt-0.5 font-mono text-[11.5px] text-muted">
            {b.id}
          </p>
        </div>
      ),
    },
    {
      kunci: "zona",
      label: "Zona",
      render: (b) => <span className="text-[13px]">{b.zona}</span>,
    },
    {
      kunci: "saldo",
      label: `Saldo · batang 0–${angka(SKALA_TABUNG)} L`,
      rata: "kanan",
      render: (b) => <SaldoSel baris={b} />,
    },
    {
      kunci: "debit",
      label: "Debit",
      rata: "kanan",
      render: (b) => (
        <p className="tabular font-mono text-[13px]">
          {/* Debit nol adalah hasil pengukuran yang sah — keran sedang tutup.
              Ia tetap ditulis 0, bukan "—". */}
          {angka(b.debitLpm, 1)}
          <span className="ml-1 text-[11px] text-muted">L/mnt</span>
        </p>
      ),
    },
    {
      kunci: "kendali",
      label: "Saklar & relay",
      render: (b) => <SaklarRelay baris={b} />,
    },
    {
      kunci: "status",
      label: "Status",
      render: (b) => {
        const s = STATUS_METER[b.status];
        return (
          <Badge nada={s.nada} titik>
            {s.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div
      className={cn(
        "motion-aware transition-opacity duration-200",
        menyegarkan && "opacity-55",
      )}
      aria-busy={menyegarkan || undefined}
    >
      {/* ── Ponsel: daftar bergaris ──────────────────────────────────── */}
      <div className="md:hidden">
        {baris.length === 0 ? (
          kosong
        ) : (
          <ul>
              {baris.map((b) => (
                <li key={b.id} className="border-b border-line/70 last:border-0">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Centang
                      id={b.id}
                      nama={b.nama}
                      aktif={terpilih.has(b.id)}
                      onUbah={() => onToggle(b.id)}
                    />
                    <Link
                      href={jalurDetail(b.id)}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[14px] font-bold tracking-[-0.01em]">
                          {b.nama}
                        </p>
                        <p className="tabular mt-0.5 truncate font-mono text-[11.5px] text-muted">
                          {b.id} · {b.zona}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="w-[5.5rem] shrink-0">
                            <TabungSaldo saldoL={b.saldoL} />
                          </span>
                          <span
                            className={cn(
                              "tabular font-mono text-[12px] font-semibold",
                              nadaSaldo(b.saldoL) === "bahaya"
                                ? "text-danger"
                                : nadaSaldo(b.saldoL) === "peringatan"
                                  ? "text-warn"
                                  : "text-muted",
                            )}
                          >
                            {angka(b.saldoL, 2)} L
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge nada={STATUS_METER[b.status].nada} titik>
                          {STATUS_METER[b.status].label}
                        </Badge>
                        <ChevronRight
                          size={16}
                          aria-hidden
                          className="text-muted"
                        />
                      </div>
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* ── md ke atas: tabel ────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/*
          Seluruh baris bisa diklik — sasaran setinggi 56px jauh lebih cepat
          dikenai daripada nama setinggi 17px, dan petugas membuka puluhan
          detail per jam. Ini TAMBAHAN di atas tautan pada namanya, bukan
          penggantinya: `onClick` pada `<tr>` tidak bisa dicapai papan ketik
          dan tidak diumumkan pembaca layar sebagai tautan ke mana pun.
        */}
        <Tabel
          kolom={kolom}
          data={baris}
          kunciBaris={(b) => b.id}
          onKlikBaris={(b) => router.push(jalurDetail(b.id))}
          kosong={kosong}
          lebarMin="54rem"
        />
      </div>
    </div>
  );
}

/** Centang "semua di halaman ini". Keadaan sebagiannya ditulis, bukan ditebak. */
export function KotakSemua({
  semua,
  sebagian,
  jumlah,
  onUbah,
}: {
  semua: boolean;
  sebagian: boolean;
  jumlah: number;
  onUbah: (pilihSemua: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] font-semibold">
      <input
        type="checkbox"
        checked={semua}
        // `indeterminate` hanya bisa dipasang lewat DOM — tidak ada atributnya
        // di HTML. Tanpa ini, pilihan sebagian tampak persis seperti tidak
        // ada yang terpilih sama sekali.
        ref={(el) => {
          if (el) el.indeterminate = sebagian;
        }}
        onChange={(e) => onUbah(e.target.checked)}
        className="size-4 cursor-pointer accent-brand-600"
      />
      Pilih {angka(jumlah)} baris di halaman ini
    </label>
  );
}
