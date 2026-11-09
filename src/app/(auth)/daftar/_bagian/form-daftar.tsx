import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import type { SyaratSandi } from "../_tipe";
import { FieldSandi } from "./field-sandi";

export function FormDaftar({
  nama,
  setNama,
  email,
  setEmail,
  hp,
  setHp,
  kataSandi,
  setKataSandi,
  setujuSyarat,
  setSetujuSyarat,
  lihatSandi,
  setLihatSandi,
  memuat,
  syarat,
  onSubmit,
}: {
  nama: string;
  setNama: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  hp: string;
  setHp: (v: string) => void;
  kataSandi: string;
  setKataSandi: (v: string) => void;
  setujuSyarat: boolean;
  setSetujuSyarat: (v: boolean) => void;
  lihatSandi: boolean;
  setLihatSandi: (v: boolean) => void;
  memuat: boolean;
  syarat: SyaratSandi;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextField
        label="Nama Lengkap"
        type="text"
        required
        autoComplete="name"
        placeholder="Sesuai kartu identitas"
        value={nama}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNama(e.target.value)}
        disabled={memuat}
      />

      <TextField
        label="Alamat Email"
        type="email"
        required
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        disabled={memuat}
      />

      <TextField
        label="Nomor Ponsel (WhatsApp / Telepon)"
        type="tel"
        autoComplete="tel-national"
        placeholder="8123456789"
        value={hp}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHp(e.target.value.replace(/\D/g, ""))}
        disabled={memuat}
        depan="+62"
        hint="Nomor ini hanya untuk dihubungi petugas jika ada kendala meter fisik. Tidak ada OTP SMS."
      />

      <FieldSandi
        kataSandi={kataSandi}
        setKataSandi={setKataSandi}
        lihatSandi={lihatSandi}
        setLihatSandi={setLihatSandi}
        memuat={memuat}
        syarat={syarat}
      />

      <div className="flex items-start gap-2 pt-2">
        <input
          id="syarat"
          type="checkbox"
          checked={setujuSyarat}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSetujuSyarat(e.target.checked)}
          disabled={memuat}
          className="mt-0.5 size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="syarat" className="text-xs leading-relaxed text-muted">
          Saya menyetujui ketentuan privasi dan transparansi data air Jernih.
        </label>
      </div>

      <Button type="submit" varian="utama" blok memuat={memuat}>
        Lanjut ke Verifikasi
        {!memuat ? <ArrowRight size={16} /> : null}
      </Button>

      <div className="takar-kepala mt-6 pt-4 text-center text-xs text-muted">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-brand-700 hover:underline dark:text-accent">
          Masuk sekarang
        </Link>
      </div>
    </form>
  );
}
