import { Eye, EyeOff } from "lucide-react";
import { TextField } from "@/components/ui/field";
import type { SyaratSandi } from "../_tipe";
import { SyaratSandiBaris } from "./syarat-sandi";

export function FieldSandi({
  kataSandi,
  setKataSandi,
  lihatSandi,
  setLihatSandi,
  memuat,
  syarat,
}: {
  kataSandi: string;
  setKataSandi: (v: string) => void;
  lihatSandi: boolean;
  setLihatSandi: (v: boolean) => void;
  memuat: boolean;
  syarat: SyaratSandi;
}) {
  return (
    <div>
      <TextField
        label="Kata Sandi"
        type={lihatSandi ? "text" : "password"}
        required
        autoComplete="new-password"
        placeholder="Minimal 8 karakter"
        value={kataSandi}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKataSandi(e.target.value)}
        disabled={memuat}
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

      {/*
        Syaratnya SELALU tergambar, bukan hanya setelah orang mulai
        mengetik. Aturan yang baru muncul setelah kolomnya disentuh tidak
        pernah sempat membantu orang memilih sandi — ia cuma menilai
        sesudahnya.
      */}
      <SyaratSandiBaris syarat={syarat} />
    </div>
  );
}
