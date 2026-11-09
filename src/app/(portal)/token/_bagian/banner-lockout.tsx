import { Clock } from "lucide-react";

export function BannerLockout({ sisaWaktuKunci }: { sisaWaktuKunci: number }) {
  return (
    <aside
      role="alert"
      className="rounded-[3px] border border-danger/40 bg-danger/10 p-4 text-xs font-medium text-danger"
    >
      <div className="flex items-center gap-2 font-bold text-sm">
        <Clock size={16} />
        <span>Percobaan Ditangguhkan (5x Salah)</span>
      </div>
      <p className="mt-1 leading-relaxed">
        Terlalu banyak percobaan kode token yang salah. Kolom penukaran dinonaktifkan demi keamanan.
        Coba lagi dalam{" "}
        <strong className="font-mono">
          {Math.floor(sisaWaktuKunci / 60)} menit {sisaWaktuKunci % 60} detik
        </strong>
        .
      </p>
    </aside>
  );
}
