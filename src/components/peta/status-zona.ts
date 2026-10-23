import type { Nada } from "@/components/ui/badge";
import type { StatusZona } from "@/types/publik";

/**
 * Satu-satunya sumber arti status zona.
 *
 * Halaman, legenda peta, dan poligon di atas peta membacanya dari sini supaya
 * tidak pernah terjadi kuning di legenda tapi jingga di peta.
 *
 * `label` WAJIB ada di setiap tempat warnanya dipakai. Warna sendirian tidak
 * terbaca oleh pengguna buta warna, hilang saat halaman dicetak hitam-putih,
 * dan tidak pernah sampai ke pembaca layar.
 */
export const STATUS: Record<
  StatusZona,
  {
    label: string;
    /** Nada lencana — menentukan warna latar dan garis lencana. */
    nada: Nada;
    /** Kelas Tailwind untuk titik penanda. Token, bukan hex. */
    titik: string;
    /** Nama variabel CSS yang dibaca peta. Lihat `token-warna.ts`. */
    tokenWarna: string;
    /** Kalimat singkat untuk legenda — warna saja tidak menjelaskan apa pun. */
    arti: string;
  }
> = {
  normal: {
    label: "Normal",
    nada: "sukses",
    titik: "bg-success",
    tokenWarna: "--color-success",
    arti: "Air mengalir sesuai jadwal",
  },
  gangguan: {
    label: "Gangguan",
    nada: "bahaya",
    titik: "bg-danger",
    tokenWarna: "--color-danger",
    arti: "Aliran terhenti di luar rencana",
  },
  perbaikan: {
    label: "Perbaikan",
    nada: "peringatan",
    titik: "bg-warn",
    tokenWarna: "--color-warn",
    arti: "Pekerjaan terjadwal sedang berjalan",
  },
};

/** Urutan tetap: paling genting lebih dulu, di legenda maupun di ringkasan. */
export const URUTAN_STATUS: StatusZona[] = ["gangguan", "perbaikan", "normal"];
