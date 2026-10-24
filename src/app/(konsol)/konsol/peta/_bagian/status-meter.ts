import type { Nada } from "@/components/ui/badge";
import type { StatusMeter } from "./tipe";

/**
 * Satu-satunya sumber arti status meter di halaman ini.
 *
 * Legenda, lencana di daftar teks, kartu detail, DAN warna lingkaran di atas
 * peta membacanya dari sini. Kalau peta memakai daftar warna sendiri, cepat
 * atau lambat akan muncul jingga di peta untuk status yang kuning di legenda —
 * dan tidak ada yang tahu mana yang benar.
 *
 * `label` wajib tampil di setiap tempat warnanya dipakai: warna sendirian
 * tidak terbaca pengguna buta warna, hilang saat dicetak hitam-putih, dan
 * tidak pernah sampai ke pembaca layar.
 */
export const STATUS_METER: Record<
  StatusMeter,
  {
    label: string;
    /** Nada lencana — menentukan warna teks dan garis tepi. */
    nada: Nada;
    /** Kelas Tailwind untuk garis takar penanda. Token, bukan hex. */
    garis: string;
    /** Nama variabel CSS yang dibaca peta. Lihat `warna-meter.ts`. */
    tokenWarna: string;
    /** Kalimat singkat untuk legenda — warna saja tidak menjelaskan apa pun. */
    arti: string;
  }
> = {
  insiden: {
    label: "Insiden",
    nada: "bahaya",
    garis: "bg-danger",
    tokenWarna: "--color-danger",
    arti: "Terdampak gangguan jaringan",
  },
  alarm: {
    label: "Saldo menipis",
    nada: "peringatan",
    garis: "bg-warn",
    tokenWarna: "--color-warn",
    arti: "Sisa saldo 5 L atau kurang",
  },
  offline: {
    label: "Tidak melapor",
    nada: "netral",
    garis: "bg-muted",
    tokenWarna: "--color-muted",
    arti: "Tidak ada kiriman data terakhir",
  },
  normal: {
    label: "Normal",
    nada: "sukses",
    garis: "bg-success",
    tokenWarna: "--color-success",
    arti: "Melapor dan saldo mencukupi",
  },
};

/**
 * Urutan tetap: paling genting lebih dulu.
 *
 * Dipakai SAMA PERSIS oleh pita takar, barisan legenda, dan daftar teks.
 * Pita yang urutannya berbeda dari barisnya memaksa pembacanya mencocokkan
 * warna satu per satu, dan itu pekerjaan yang seharusnya sudah selesai di
 * layar.
 */
export const URUTAN_METER: StatusMeter[] = [
  "insiden",
  "alarm",
  "offline",
  "normal",
];
