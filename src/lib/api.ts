/**
 * Pembungkus panggilan ke backend Jernih (MIA-JERNIH-BE).
 *
 * Dua hal yang WAJIB dijaga di sini dan gampang salah:
 *
 * 1. **401 dari `/auth/*` bukan "sesi habis".** Itu jawaban tentang kredensial
 *    — kata sandi salah. Menyamakannya dengan sesi kedaluwarsa membuat setiap
 *    salah ketik kata sandi menampilkan "Sesi Anda sudah berakhir", dan
 *    pengguna mengira sistemnya rusak.
 * 2. **Pesan dari server menang.** Backend sudah mengirim kalimat Bahasa
 *    Indonesia yang siap tampil di `{error:{code,message}}`. Jangan ditimpa
 *    dengan pesan generik berdasarkan kode status.
 */

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const PESAN_CADANGAN: Record<number, string> = {
  400: "Permintaan tidak valid. Periksa kembali data yang Anda isi.",
  401: "Sesi Anda sudah berakhir. Silakan masuk lagi.",
  403: "Anda tidak punya akses ke halaman ini.",
  404: "Data yang Anda cari tidak ditemukan.",
  429: "Terlalu banyak permintaan. Coba lagi beberapa saat.",
  500: "Terjadi gangguan di server. Coba lagi beberapa saat.",
};

export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError(
      "CONFIG_MISSING",
      "Alamat server belum diatur. Isi NEXT_PUBLIC_API_URL di .env.local.",
      0,
    );
  }
  const bersih = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/+$/, "")}${bersih}`;
}

/** `true` bila 401 di jalur ini berarti kredensial salah, bukan sesi habis. */
const jawabanKredensial = (path: string): boolean => path.includes("/auth/");

let tokenAksesMemori: string | null = null;
let penanganRefresh: (() => Promise<string | null>) | null = null;

export function aturTokenAkses(token: string | null) {
  tokenAksesMemori = token;
}

export function aturPenanganRefresh(penangan: (() => Promise<string | null>) | null) {
  penanganRefresh = penangan;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const kirimPermintaan = async (token: string | null) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    };

    try {
      return await fetch(apiUrl(path), {
        ...init,
        credentials: "include",
        headers,
      });
    } catch {
      throw new ApiError(
        "NETWORK",
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        0,
      );
    }
  };

  let res = await kirimPermintaan(tokenAksesMemori);

  // Jika 401 di luar jalur kredensial auth dan kita punya handler refresh, lakukan refresh otomatis
  if (res.status === 401 && !jawabanKredensial(path) && penanganRefresh) {
    const tokenBaru = await penanganRefresh();
    if (tokenBaru) {
      tokenAksesMemori = tokenBaru;
      res = await kirimPermintaan(tokenBaru);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = body?.error;
    throw new ApiError(
      err?.code ?? "UNKNOWN",
      err?.message ?? PESAN_CADANGAN[res.status] ?? "Terjadi gangguan.",
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const jalurKredensial = jawabanKredensial;
