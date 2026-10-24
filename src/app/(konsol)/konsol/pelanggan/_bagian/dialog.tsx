"use client";

/**
 * Dialog konfirmasi.
 *
 * Satu-satunya tempat di halaman ini yang boleh memakai BAYANGAN: ia memang
 * melayang di atas halaman. Kartu dan panel tetap dipisah garis.
 *
 * Tiga hal yang dikerjakan di sini dan sering ketinggalan pada dialog buatan
 * sendiri — ketiganya terasa langsung bagi pengguna papan ketik:
 *
 * 1. **Fokus masuk ke dalam dialog** saat ia terbuka, dan KEMBALI ke tombol
 *    pemanggilnya saat ditutup. Tanpa itu, Esc melempar fokus ke awal
 *    dokumen dan petugas harus menekan Tab belasan kali untuk kembali ke
 *    barisnya.
 * 2. **Tab terkurung.** Dialog aksi massal yang bocor fokusnya ke tabel di
 *    belakang memungkinkan orang mencentang baris lain sementara dialognya
 *    masih menyebut jumlah yang lama.
 * 3. **Halaman di belakang tidak ikut bergulir.**
 *
 * Yang SENGAJA tidak ada: penutupan dengan klik di luar untuk dialog
 * berisiko. Lihat prop `tutupDiLuar`.
 */

import { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const BISA_FOKUS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Dialog({
  judul,
  sub,
  onTutup,
  tutupDiLuar = true,
  lebar = "32rem",
  children,
  kaki,
}: {
  judul: React.ReactNode;
  sub?: React.ReactNode;
  onTutup: () => void;
  /**
   * Klik di latar menutup dialog.
   *
   * Dibiarkan `true` untuk konfirmasi biasa — menutup tidak melakukan apa
   * pun, jadi tidak ada yang bisa rusak. Matikan untuk dialog yang sudah
   * berisi ketikan pengguna (alasan tutup relay): kehilangan dua kalimat
   * alasan karena salah klik satu piksel di luar panel membuat orang
   * mengulang, dan yang diulang biasanya lebih pendek dan lebih malas.
   */
  tutupDiLuar?: boolean;
  lebar?: string;
  children: React.ReactNode;
  kaki?: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const idJudul = useId();
  const idSub = useId();

  const tutup = useCallback(() => onTutup(), [onTutup]);

  useEffect(() => {
    const semula = document.activeElement as HTMLElement | null;
    const kotak = panel.current;

    // Fokus ke elemen pertama yang bisa difokus, atau ke panelnya sendiri.
    const pertama = kotak?.querySelector<HTMLElement>(BISA_FOKUS);
    (pertama ?? kotak)?.focus();

    const papanKetik = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        tutup();
        return;
      }
      if (e.key !== "Tab" || !kotak) return;

      const daftar = Array.from(
        kotak.querySelectorAll<HTMLElement>(BISA_FOKUS),
      ).filter((el) => el.offsetParent !== null);
      if (daftar.length === 0) return;

      const awal = daftar[0];
      const akhir = daftar[daftar.length - 1];
      if (e.shiftKey && document.activeElement === awal) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        awal.focus();
      }
    };

    document.addEventListener("keydown", papanKetik);
    const gulirSemula = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", papanKetik);
      document.body.style.overflow = gulirSemula;
      semula?.focus?.();
    };
  }, [tutup]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={tutupDiLuar ? tutup : undefined}
        className="absolute inset-0 bg-brand-900/55 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        aria-describedby={sub ? idSub : undefined}
        tabIndex={-1}
        style={{ maxWidth: lebar }}
        className={cn(
          "relative w-full outline-none",
          // Di ponsel dialog naik dari bawah dan menempel ke tepi bawah —
          // ibu jari ada di sana, bukan di tengah layar.
          "max-h-[92dvh] overflow-y-auto rounded-t-sheet sm:rounded-sheet",
          "border border-line bg-surface shadow-[0_24px_60px_-12px_rgba(8,34,44,0.45)]",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2
              id={idJudul}
              className="font-display text-[17px] leading-tight font-bold tracking-[-0.02em]"
            >
              {judul}
            </h2>
            {sub ? (
              <p
                id={idSub}
                className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-muted"
              >
                {sub}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={tutup}
            className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-[3px] text-muted hover:bg-soft hover:text-ink"
          >
            <X size={17} aria-hidden />
            <span className="sr-only">Tutup dialog</span>
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {kaki ? (
          <div className="border-t border-line px-5 py-4">{kaki}</div>
        ) : null}
      </div>
    </div>
  );
}
