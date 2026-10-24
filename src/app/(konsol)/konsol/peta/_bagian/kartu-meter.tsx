"use client";

/**
 * Kartu detail satu meter, mengambang di atas peta.
 *
 * Satu-satunya elemen berbayang di halaman ini, dan itu disengaja: kartu ini
 * memang melayang di atas sesuatu. Sisanya dipisah garis.
 *
 * Kartu ini bukan tujuan akhir — ia selalu berakhir dengan tautan ke halaman
 * pelanggan. Peta menjawab "di mana"; yang berikutnya ditanyakan petugas
 * selalu "lalu riwayatnya bagaimana", dan itu ada di halaman lain.
 */

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { angka, debit, liter } from "@/lib/format";
import { STATUS_METER } from "./status-meter";
import type { PinMeter } from "./tipe";

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/70 py-1.5 last:border-b-0">
      <dt className="shrink-0 text-[11.5px] text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-mono text-[12.5px] font-medium tabular">
        {children}
      </dd>
    </div>
  );
}

export function KartuMeter({
  pin,
  posisi,
  onTutup,
}: {
  pin: PinMeter;
  /**
   * Sudut peta yang ditempati — hanya berlaku mulai lebar `sm`.
   *
   * Ditentukan oleh peta, bukan ditetapkan di sini: kartu yang selalu muncul
   * di sudut yang sama akan menutupi justru pin yang baru saja diklik kalau
   * pin itu kebetulan ada di sudut tersebut, dan di peta sepadat ini berarti
   * menutupi seluruh gerombolan di sekitarnya. Jadi kartunya dilempar ke
   * sudut SEBERANG titik yang diklik.
   *
   * Dua sudut itu dipilih karena dua sudut sisanya sudah terpakai: tombol
   * zoom di kiri atas, dan pengaitan atribusi OpenStreetMap/CARTO di kanan
   * bawah — yang terakhir wajib tetap terbaca, itu syarat lisensinya.
   */
  posisi: "kanan-atas" | "kiri-bawah";
  onTutup: () => void;
}) {
  const arti = STATUS_METER[pin.status];
  const [bujur, lintang] = pin.koordinat;

  return (
    <aside
      // `absolute`, bukan dialog: peta di belakangnya harus tetap bisa
      // digeser sambil kartunya terbuka. Dialog akan mengunci fokus dan
      // memaksa petugas menutup kartu tiap kali ingin melihat tetangganya.
      aria-label={`Detail meter ${pin.id}`}
      className={cn(
        /*
         * Di ponsel kartu ini BUKAN kartu mengambang, melainkan blok biasa
         * di bawah peta.
         *
         * Petanya di sana hanya setinggi 20rem sementara kartunya sekitar
         * 19rem: di sudut mana pun ia diletakkan, ia menutupi hampir seluruh
         * peta — termasuk pin yang baru saja ditekan. Mengambang itu pilihan
         * yang hanya masuk akal kalau ada ruang untuk mengambang.
         */
        "border-t border-line bg-surface",
        "sm:absolute sm:z-10 sm:w-[19.5rem] sm:rounded-card sm:border sm:shadow-lg",
        posisi === "kanan-atas"
          ? "sm:top-3 sm:right-3"
          : "sm:bottom-3 sm:left-3",
      )}
    >
      <div className="flex items-start gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] text-muted tabular">{pin.id}</p>
          <p className="truncate font-display text-[15px] font-bold tracking-[-0.02em]">
            {pin.nama}
          </p>
        </div>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup detail meter"
          className="-mt-1 -mr-1.5 grid size-9 shrink-0 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink"
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      <div className="px-4 py-3">
        <Badge nada={arti.nada} titik>
          {arti.label}
        </Badge>

        <dl className="mt-3">
          <Baris label="Zona">
            <span className="font-sans">{pin.zona}</span>
          </Baris>
          <Baris label="Saldo">{liter(pin.saldoL)}</Baris>
          <Baris label="Debit saat ini">{debit(pin.debitLpm)}</Baris>
          <Baris label="Katup">
            <span className="font-sans">
              {pin.relayOn ? "Terbuka" : "Tertutup"}
            </span>
          </Baris>
          <Baris label="Koordinat">
            {angka(lintang, 5)}, {angka(bujur, 5)}
          </Baris>
        </dl>

        <Link
          href={`/konsol/pelanggan/${pin.id}`}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline"
        >
          Buka halaman pelanggan
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
