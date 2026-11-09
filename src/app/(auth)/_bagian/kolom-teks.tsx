"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { TextField } from "@/components/ui/field";
import { cn } from "@/lib/cn";

/**
 * Kolom isian halaman auth: `TextField` bersama, dibuat CEKUNG.
 *
 * ── Kenapa tidak mengubah `TextField` langsung ────────────────────────
 *
 * `components/ui/field.tsx` dipakai juga oleh konsol petugas dan beberapa
 * halaman portal. Mengubah tampilannya dari sini berarti mengubah ratusan
 * kolom isian di tempat yang tidak sedang dikerjakan dan tidak diperiksa.
 * Jadi penyesuaiannya dipasang dari luar, lewat `className`.
 *
 * ── Kenapa cekung ─────────────────────────────────────────────────────
 *
 * Di seluruh portal, bentuk membawa arti: yang menonjol adalah benda, yang
 * masuk ke dalam adalah tempat menaruh sesuatu. Kolom isian pada halaman
 * masuk adalah tempat paling penting untuk menaruh sesuatu di seluruh
 * aplikasi — dan sebelumnya ia digambar rata dengan kartu yang memuatnya,
 * sehingga satu-satunya petunjuk bahwa ia bisa diketik adalah teks contoh
 * di dalamnya.
 *
 * `div:nth-of-type(2)` menyasar kotak isiannya. `TextField` merendernya
 * sebagai: div baris label, div kotak isian, lalu `<p>` pesan. Dipakai
 * `nth-of-type`, BUKAN `nth-child`, karena pesan galat muncul dan hilang —
 * dengan `nth-child` nomor urutnya ikut bergeser, dengan `nth-of-type`
 * tidak, sebab `<p>` bukan `div`.
 */
export function KolomTeks({
  className,
  ...sisa
}: React.ComponentProps<typeof TextField>) {
  return (
    <TextField
      className={cn(
        "[&>div:nth-of-type(2)]:border-line",
        "[&>div:nth-of-type(2)]:bg-surface-2",
        "[&>div:nth-of-type(2)]:shadow-[var(--cekung-dalam)]",
        "[&>div:nth-of-type(2)]:transition-colors",
        "focus-within:[&>div:nth-of-type(2)]:bg-surface",
        className,
      )}
      {...sisa}
    />
  );
}

/**
 * Kolom kata sandi beserta tombol lihat/sembunyikan.
 *
 * Dipisahkan karena empat halaman memerlukannya — masuk, daftar,
 * atur-ulang, dan konfirmasi di atur-ulang — dan sebelumnya masing-masing
 * menyimpan `useState` sendiri plus menyalin tombol matanya. Empat salinan
 * dari hal yang sama adalah empat kesempatan untuk berbeda perilaku.
 *
 * `autoComplete` SENGAJA tidak diberi nilai bawaan. Nilainya menentukan
 * apakah pengelola kata sandi mengisi kolom ini dengan sandi lama atau
 * menawarkan sandi baru, dan menebaknya salah justru membuat pengelola
 * sandi mengisi kolom yang keliru. Pemanggil wajib menyebutkannya.
 */
export function KolomSandi({
  label,
  ...sisa
}: Omit<React.ComponentProps<typeof TextField>, "type" | "belakang">) {
  const [terlihat, setTerlihat] = useState(false);

  return (
    <KolomTeks
      label={label}
      type={terlihat ? "text" : "password"}
      belakang={
        <button
          type="button"
          onClick={() => setTerlihat(!terlihat)}
          className="grid size-7 shrink-0 place-items-center rounded-[7px] text-muted transition-colors hover:bg-surface hover:text-ink"
          aria-label={terlihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
          aria-pressed={terlihat}
        >
          {terlihat ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...sisa}
    />
  );
}
