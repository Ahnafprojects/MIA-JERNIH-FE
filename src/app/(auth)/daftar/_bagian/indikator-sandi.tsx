import type { KekuatanSandi } from "../_tipe";

export function hitungKekuatanSandi(sandi: string): KekuatanSandi {
  if (!sandi) return { skor: 0, label: "Kosong", warna: "bg-line" };
  let skor = 0;
  if (sandi.length >= 8) skor += 1;
  if (/[A-Z]/.test(sandi) && /[a-z]/.test(sandi)) skor += 1;
  if (/[0-9]/.test(sandi)) skor += 1;
  if (/[^A-Za-z0-9]/.test(sandi)) skor += 1;

  if (skor <= 1) return { skor: 1, label: "Lemah", warna: "bg-danger" };
  if (skor === 2 || skor === 3) return { skor: 2, label: "Cukup", warna: "bg-warn" };
  return { skor: 3, label: "Kuat", warna: "bg-success" };
}

export function IndikatorSandi({ kekuatan }: { kekuatan: KekuatanSandi }) {
  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-soft">
        <div
          className={`h-full flex-1 transition-colors ${
            kekuatan.skor >= 1 ? kekuatan.warna : "bg-line"
          }`}
        />
        <div
          className={`h-full flex-1 transition-colors ${
            kekuatan.skor >= 2 ? kekuatan.warna : "bg-line"
          }`}
        />
        <div
          className={`h-full flex-1 transition-colors ${
            kekuatan.skor >= 3 ? kekuatan.warna : "bg-line"
          }`}
        />
      </div>
      <p className="font-mono text-[10px] text-muted">
        Kekuatan: <span className="font-semibold text-ink">{kekuatan.label}</span>
      </p>
    </div>
  );
}
