import { MapPin } from "lucide-react";

export function TitikLokasi({ titikKoordinat }: { titikKoordinat: { lat: number; lng: number } }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-ink">Titik Lokasi Gangguan</label>
        <span className="font-mono text-[10px] text-muted">
          Lat: {titikKoordinat.lat.toFixed(4)}, Lng: {titikKoordinat.lng.toFixed(4)}
        </span>
      </div>
      <div className="mt-2 flex h-36 items-center justify-center rounded-[3px] border border-line bg-soft text-center p-4">
        <div>
          <MapPin size={24} className="mx-auto text-danger animate-bounce" />
          <p className="mt-1 font-mono text-xs font-bold text-ink">
            Lokasi Terdeteksi di Sekitar Meter Anda
          </p>
          <p className="text-[10px] text-muted">
            Koordinat tersemat otomatis berdasarkan zona meter air terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
}
