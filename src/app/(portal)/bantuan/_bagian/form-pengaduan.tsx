import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnggahFoto } from "./unggah-foto";
import { PilihKategori } from "./pilih-kategori";
import { TitikLokasi } from "./titik-lokasi";


export function FormPengaduan({
  kategori,
  setKategori,
  deskripsi,
  setDeskripsi,
  lampirkanSensor,
  setLampirkanSensor,
  daftarFoto,
  handleUnggahFoto,
  handleHapusFoto,
  titikKoordinat,
  nomorSeri,
  memuatKirim,
  onSubmit,
}: {
  kategori: string;
  setKategori: (v: string) => void;
  deskripsi: string;
  setDeskripsi: (v: string) => void;
  lampirkanSensor: boolean;
  setLampirkanSensor: (v: boolean) => void;
  daftarFoto: string[];
  handleUnggahFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHapusFoto: (i: number) => void;
  titikKoordinat: { lat: number; lng: number };
  nomorSeri?: string;
  memuatKirim: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Formulir Pengaduan Warga
      </h2>

      <PilihKategori kategori={kategori} setKategori={setKategori} />

      <div>
        <label htmlFor="deskripsi" className="mb-1.5 block text-xs font-bold text-ink">
          Rincian Deskripsi Gangguan
        </label>
        <textarea
          id="deskripsi"
          rows={4}
          required
          placeholder="Jelaskan kendala secara spesifik, misalnya: air keruh kekuningan sejak subuh tadi di seluruh keran rumah..."
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-[3px] border border-line bg-canvas p-3 text-xs leading-relaxed text-ink outline-none focus:border-brand-500"
        />
      </div>

      <UnggahFoto
        daftarFoto={daftarFoto}
        handleUnggahFoto={handleUnggahFoto}
        handleHapusFoto={handleHapusFoto}
      />

      <div className="flex items-start gap-2.5 rounded-[3px] border border-line bg-soft p-3">
        <input
          id="sensor"
          type="checkbox"
          checked={lampirkanSensor}
          onChange={(e) => setLampirkanSensor(e.target.checked)}
          className="mt-0.5 size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="sensor" className="text-xs leading-relaxed text-ink">
          <strong>Lampirkan telemetri meter 24 jam terakhir</strong> ({nomorSeri}).
          <span className="block text-[11px] text-muted">
            Memungkinkan petugas teknis melihat grafik penurunan tekanan/debit langsung tanpa perlu survei awal.
          </span>
        </label>
      </div>

      <TitikLokasi titikKoordinat={titikKoordinat} />

      <Button type="submit" varian="utama" blok memuat={memuatKirim}>
        Kirim Pengaduan Layanan
        {!memuatKirim ? <Send size={14} /> : null}
      </Button>
    </form>
  );
}
