import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function FormMasuk({
  email,
  setEmail,
  kataSandi,
  setKataSandi,
  ingat,
  setIngat,
  lihatSandi,
  setLihatSandi,
  memuat,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  kataSandi: string;
  setKataSandi: (v: string) => void;
  ingat: boolean;
  setIngat: (v: boolean) => void;
  lihatSandi: boolean;
  setLihatSandi: (v: boolean) => void;
  memuat: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        disabled={memuat}
      />

      <TextField
        label="Kata Sandi"
        type={lihatSandi ? "text" : "password"}
        required
        autoComplete="current-password"
        placeholder="••••••••"
        value={kataSandi}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKataSandi(e.target.value)}
        disabled={memuat}
        kananLabel={
          <Link
            href="/lupa-sandi"
            className="text-xs font-medium text-brand-700 hover:underline dark:text-accent"
          >
            Lupa sandi?
          </Link>
        }
        belakang={
          <button
            type="button"
            onClick={() => setLihatSandi(!lihatSandi)}
            className="text-muted hover:text-ink"
            aria-label={lihatSandi ? "Sembunyikan sandi" : "Lihat sandi"}
          >
            {lihatSandi ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="flex items-center gap-2 pt-1">
        <input
          id="ingat"
          type="checkbox"
          checked={ingat}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIngat(e.target.checked)}
          disabled={memuat}
          className="size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="ingat" className="text-xs text-muted">
          Ingat perangkat ini
        </label>
      </div>

      <Button type="submit" varian="utama" blok memuat={memuat}>
        Masuk
        {!memuat ? <ArrowRight size={16} /> : null}
      </Button>

      <div className="takar-kepala mt-6 pt-4 text-center text-xs text-muted">
        Belum punya akun warga?{" "}
        <Link href="/daftar" className="font-semibold text-brand-700 hover:underline dark:text-accent">
          Daftar sekarang
        </Link>
      </div>
    </form>
  );
}
