export interface AnggotaTim {
  id: string;
  nama: string;
  email: string;
  peran: string;
  emailVerified: boolean;
}

export interface Golongan {
  id: string;
  nama: string;
  tarifPerLiter: number;
}

export type Pengaturan = Record<string, unknown>;

export interface HasilSandi {
  tipe: "sukses" | "galat";
  teks: string;
}

export interface TabPengaturan {
  id: string;
  label: string;
}
