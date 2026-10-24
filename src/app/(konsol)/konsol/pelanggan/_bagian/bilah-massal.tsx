"use client";

/**
 * Bilah aksi massal.
 *
 * Menempel di BAWAH layar, bukan di atas tabel. Petugas memilih baris sambil
 * menggulir ke bawah; bilah di atas tabel sudah keluar layar persis saat
 * pilihannya selesai, dan yang terjadi berikutnya adalah menggulir balik ke
 * atas untuk menemukan tombolnya.
 *
 * Jumlah yang terpilih ditulis BESAR dan dengan angka, di tempat yang sama
 * dengan tombolnya. Pilihan bisa melintasi halaman — mencentang 25 baris di
 * halaman 3 lalu 25 lagi di halaman 7 menghasilkan 50, dan satu-satunya
 * tanda bahwa itu terjadi adalah angka ini.
 *
 * Tombol "Tutup aliran" disembunyikan untuk peran TEKNISI. Lihat `peran.ts`:
 * itu bukan keamanan, dan penolakan yang sebenarnya ada di server.
 */

import { KeyRound, Mail, PowerOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { angka } from "@/lib/format";
import { bolehTutupRelayMassal, PERAN_SEKARANG } from "./peran";

export function BilahMassal({
  jumlah,
  onKosongkan,
  onEmail,
  onToken,
  onTutupRelay,
}: {
  jumlah: number;
  onKosongkan: () => void;
  onEmail: () => void;
  onToken: () => void;
  onTutupRelay: () => void;
}) {
  if (jumlah === 0) return null;
  const bolehTutup = bolehTutupRelayMassal(PERAN_SEKARANG);

  return (
    <div
      role="region"
      aria-label="Aksi untuk pelanggan terpilih"
      className="sticky bottom-0 z-30 -mx-4 mt-px sm:-mx-6"
    >
      <div className="border-t border-line bg-surface/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(8,34,44,0.35)] backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3">
          <p className="flex items-baseline gap-2">
            <span
              className="tabular font-mono text-[22px] leading-none font-bold text-brand-600"
              aria-live="polite"
            >
              {angka(jumlah)}
            </span>
            <span className="text-[13px] text-muted">pelanggan dipilih</span>
          </p>

          <button
            type="button"
            onClick={onKosongkan}
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted hover:text-ink"
          >
            <X size={13} aria-hidden />
            Kosongkan
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button varian="sekunder" ukuran="sm" onClick={onEmail}>
              <Mail size={14} aria-hidden />
              Kirim email
            </Button>
            <Button varian="sekunder" ukuran="sm" onClick={onToken}>
              <KeyRound size={14} aria-hidden />
              Buat token
            </Button>
            {bolehTutup ? (
              <Button varian="bahaya" ukuran="sm" onClick={onTutupRelay}>
                <PowerOff size={14} aria-hidden />
                Tutup aliran
              </Button>
            ) : (
              /*
               * Peran teknisi: tombolnya tidak ada, dan ALASANNYA ditulis.
               * Tombol yang hilang tanpa penjelasan terbaca sebagai halaman
               * rusak, dan orang akan melapor bahwa fiturnya hilang.
               */
              <p className="max-w-[26ch] text-[12px] leading-snug text-muted">
                Penutupan aliran massal bukan wewenang peran Teknisi. Ajukan ke
                operator zona.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
