import { Camera, X } from "lucide-react";

export function UnggahFoto({
  daftarFoto,
  handleUnggahFoto,
  handleHapusFoto,
}: {
  daftarFoto: string[];
  handleUnggahFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHapusFoto: (i: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-ink">
          Foto Bukti Kondisi (Maksimal 3 Foto)
        </label>
        <span className="font-mono text-[11px] text-muted">{daftarFoto.length}/3 Foto</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        {daftarFoto.map((fotoUrl, idx) => (
          <div key={idx} className="relative size-20 overflow-hidden rounded-[3px] border border-line">
            {/*
              Sengaja <img>, bukan next/image: sumbernya data URI
              hasil FileReader yang belum pernah diunggah ke mana pun.
              next/image tidak bisa mengoptimalkan skema `data:` dan
              akan melempar galat saat dirender.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoUrl} alt={`Foto bukti ${idx + 1}`} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => handleHapusFoto(idx)}
              className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {daftarFoto.length < 3 ? (
          <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-[3px] border-2 border-dashed border-line text-muted hover:border-brand-500 hover:text-brand-600">
            <Camera size={18} />
            <span className="mt-1 font-mono text-[9px]">Pilih Foto</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUnggahFoto} />
          </label>
        ) : null}
      </div>
      <p className="mt-1.5 text-[10px] text-muted">
        Format gambar JPG, PNG, atau WEBP (maksimal 5 MB per foto).
      </p>
    </div>
  );
}
