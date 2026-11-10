import { angka } from "@/lib/format";
import PetaDinamis from "./peta-dinamis";
import type { FokusPeta, PilihPin, PosisiKartu } from "./peta-meter";
import { KartuMeter } from "./kartu-meter";
import { KotakCentang } from "./kendali";
import type { BatasZona, PinMeter, StatusMeter } from "./tipe";

const TINGGI_PETA = "h-[20rem] sm:h-[26rem] lg:h-[34rem]";

interface Props {
  memuat: boolean;
  pin: PinMeter[];
  jumlahTergambar: number;
  statusAktif: StatusMeter[];
  zonaAktif: string | null;
  disaring: boolean;
  batasZona: boolean;
  onBatasZona: (v: boolean) => void;
  batas: BatasZona[];
  batasGalat: unknown;
  dipilih: string | null;
  pinDipilih: PinMeter | null;
  fokus: FokusPeta | null;
  posisiKartu: PosisiKartu;
  onPilih: PilihPin;
  onTutupKartu: () => void;
}

/** Bagian peta: kepala dengan lapisan batas, kanvas peta, kartu meter, dan kaki penghitung. */
export function BidangPeta(p: Props) {
  return (
    <section
      aria-labelledby="judul-peta"
      className="min-w-0 overflow-hidden rounded-card border border-line bg-surface lg:col-start-1 lg:row-start-1"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-b border-line px-5 py-2.5">
        <h2 id="judul-peta" className="font-display text-[15px] font-bold tracking-[-0.02em]">
          Peta sebaran meter
        </h2>
        <KotakCentang
          aktif={p.batasZona}
          onUbah={p.onBatasZona}
          label="Batas zona"
          keterangan={
            p.batasZona && p.batasGalat
              ? "Batas wilayah gagal dimuat"
              : p.batasZona && p.batas.length === 0
                ? "Memuat batas wilayah…"
                : "Lapisan tambahan di atas peta"
          }
        />
      </div>

      {/*
        Pembungkus `relative` membungkus peta DAN kartunya.

        Kartu ditulis sebagai SAUDARA peta, bukan anaknya: mulai lebar
        `sm` ia mengambang di atas peta (dan pembungkus inilah acuan
        koordinatnya), sedangkan di ponsel ia mengalir sebagai blok di
        bawah peta — pembungkus ini yang ikut memanjang menampungnya.
      */}
      <div className="relative">
        <div className={`relative w-full ${TINGGI_PETA}`}>
          {p.memuat ? (
            <div className="grid h-full place-items-center">
              <p className="text-[13px] text-muted">Memuat sebaran meter…</p>
            </div>
          ) : (
            <PetaDinamis
              pin={p.pin}
              statusAktif={p.statusAktif}
              zonaAktif={p.zonaAktif}
              batasZona={p.batasZona}
              batas={p.batas}
              dipilih={p.dipilih}
              fokus={p.fokus}
              onPilih={p.onPilih}
            />
          )}
        </div>
        {p.pinDipilih ? (
          <KartuMeter pin={p.pinDipilih} posisi={p.posisiKartu} onTutup={p.onTutupKartu} />
        ) : null}
      </div>

      {/*
        Angka yang BISA diperiksa: berapa pin yang benar-benar tergambar
        sekarang, dari berapa yang berkoordinat. Saat tidak ada saringan
        aktif, angka kiri wajib sama dengan jumlah keempat baris takaran.
      */}
      <p className="border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
        <span className="font-mono font-semibold text-ink tabular">
          {angka(p.jumlahTergambar)}
        </span>{" "}
        pin tergambar dari <span className="font-mono tabular">{angka(p.pin.length)}</span>{" "}
        berkoordinat
        {p.disaring ? " (saringan aktif)" : ""} · klik pin untuk membuka detailnya.
      </p>
    </section>
  );
}
