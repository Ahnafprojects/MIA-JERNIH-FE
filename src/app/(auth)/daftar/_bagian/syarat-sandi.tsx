import { Check } from "lucide-react";

import type { SyaratSandi } from "../_tipe";

/**
 * Panjang minimum kata sandi.
 *
 * Diikat ke `skemaDaftar` di `MIA-JERNIH-BE/src/rute/auth.ts`:
 * `kataSandi: z.string().min(8, "Kata sandi minimal 8 karakter.")`.
 * Itu SATU-SATUNYA syarat yang dipakai server untuk menolak. Kalau angkanya
 * berubah di sana, baris ini ikut berubah.
 */
export const MIN_SANDI = 8;

export function periksaSandi(sandi: string): SyaratSandi {
  return {
    panjang: sandi.length,
    cukup: sandi.length >= MIN_SANDI,
  };
}

/**
 * Satu syarat yang bisa dicentang — bukan batang kekuatan tiga tingkat.
 *
 * ── Kenapa batang kekuatannya dibuang ─────────────────────────────────
 *
 * Versi sebelumnya menilai empat hal: panjang, huruf besar DAN kecil,
 * angka, dan simbol. Tiga di antaranya TIDAK DISYARATKAN SERVER sama
 * sekali. Akibatnya sandi delapan huruf kecil — yang pasti diterima —
 * ditandai merah dengan label "Lemah", lalu tetap diterima.
 *
 * Itu bukan sekadar hiasan yang keliru. Penilaian yang tidak mengikat
 * mengajari orang bahwa peringatan di aplikasi ini boleh diabaikan, dan
 * pelajaran itu terbawa ke peringatan yang benar-benar penting — saldo
 * kritis, alarm meter, token yang akan kedaluwarsa.
 *
 * Yang ditampilkan sekarang hanya syarat yang benar-benar dipakai
 * menolak, lengkap dengan hitungan karakternya supaya orang tahu persis
 * berapa lagi yang kurang alih-alih menebak apa arti "Cukup".
 */
export function SyaratSandiBaris({ syarat }: { syarat: SyaratSandi }) {
  return (
    <p
      className={`mt-2 flex items-center gap-1.5 text-[12px] ${
        syarat.cukup ? "text-success" : "text-muted"
      }`}
    >
      <Check
        size={14}
        aria-hidden
        className={syarat.cukup ? "opacity-100" : "opacity-30"}
      />
      <span>
        Minimal {MIN_SANDI} karakter
        {syarat.panjang > 0 && !syarat.cukup ? (
          /* `tabular` supaya angkanya tidak bergoyang saat berubah. */
          <span className="tabular font-mono">
            {" "}
            — kurang {MIN_SANDI - syarat.panjang}
          </span>
        ) : null}
      </span>
    </p>
  );
}
