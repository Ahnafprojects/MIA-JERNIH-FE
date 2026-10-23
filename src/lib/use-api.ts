"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

export interface HasilApi<T> {
  data: T | null;
  memuat: boolean;
  galat: string | null;
  muatUlang: () => void;
}

interface Keadaan<T> {
  /** Permintaan mana yang menghasilkan isi ini. */
  kunci: string;
  data: T | null;
  galat: string | null;
}

/**
 * Pengambil data sederhana untuk komponen klien.
 *
 * Sengaja TIDAK memakai data tiruan sebagai cadangan saat API gagal. Versi
 * sebelumnya dari proyek ini melakukannya, dan akibatnya halaman tampak
 * baik-baik saja sambil menampilkan angka karangan — tidak ada yang sadar
 * servernya mati sampai angkanya dicocokkan dengan database.
 *
 * Kalau gagal: `data` tetap null dan `galat` berisi pesan dari server.
 * Halaman wajib menampilkan keadaan galat itu apa adanya.
 */
export default function useApi<T>(
  jalur: string | null,
  opsi: RequestInit = {},
): HasilApi<T> {
  const [tik, setTik] = useState(0);
  const [keadaan, setKeadaan] = useState<Keadaan<T>>({
    kunci: "",
    data: null,
    galat: null,
  });

  const kunci = jalur ? `${jalur}#${tik}` : "";
  const muatUlang = useCallback(() => setTik((t) => t + 1), []);

  useEffect(() => {
    if (!jalur) return;
    let batal = false;

    api<T>(jalur, opsi)
      .then((hasil) => {
        if (!batal) setKeadaan({ kunci, data: hasil, galat: null });
      })
      .catch((e: unknown) => {
        if (batal) return;
        setKeadaan({
          kunci,
          data: null,
          galat:
            e instanceof ApiError
              ? e.message
              : "Terjadi gangguan. Coba lagi beberapa saat.",
        });
      });

    return () => {
      batal = true;
    };
    // `opsi` sengaja tidak masuk daftar: objek literal berganti identitas tiap
    // render dan akan memicu pengambilan ulang tanpa henti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jalur, kunci]);

  /*
   * `memuat` DITURUNKAN, bukan disimpan sebagai state tersendiri.
   *
   * Menyimpannya berarti memanggil setState di awal effect, dan itu memicu
   * render berantai: satu untuk menyalakan "memuat", satu lagi saat datanya
   * tiba. Dengan membandingkan kunci permintaan terhadap kunci isi yang
   * tersimpan, keadaan memuat terbaca langsung tanpa render tambahan — dan
   * tetap benar saat `muatUlang()` dipanggil.
   */
  const memuat = jalur !== null && keadaan.kunci !== kunci;

  return {
    data: memuat ? null : keadaan.data,
    memuat,
    galat: memuat ? null : keadaan.galat,
    muatUlang,
  };
}
