import Link from "next/link";
import { RotateCw } from "lucide-react";

export function KirimUlang({
  bisaKirimUlang,
  hitungMundur,
  sedangKirimUlang,
  onKirimUlang,
}: {
  bisaKirimUlang: boolean;
  hitungMundur: number;
  sedangKirimUlang: boolean;
  onKirimUlang: () => void;
}) {
  return (
    <div className="space-y-3 pt-2 text-center text-xs">
      <div className="flex items-center justify-center gap-2">
        <span className="text-muted">Tidak menerima kode?</span>
        {bisaKirimUlang ? (
          <button
            type="button"
            onClick={onKirimUlang}
            disabled={sedangKirimUlang}
            className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline dark:text-accent"
          >
            <RotateCw size={12} className={sedangKirimUlang ? "animate-spin" : ""} />
            <span>Kirim ulang</span>
          </button>
        ) : (
          <span className="font-mono text-muted">Kirim ulang dalam {hitungMundur}s</span>
        )}
      </div>

      <div>
        <Link href="/daftar" className="text-muted hover:text-ink hover:underline">
          Salah memasukkan email? Ganti email
        </Link>
      </div>
    </div>
  );
}
