import { Eye, EyeOff } from "lucide-react";
import { TextField } from "@/components/ui/field";
import type { KekuatanSandi } from "../_tipe";
import { IndikatorSandi } from "./indikator-sandi";

export function FieldSandi({
  kataSandi,
  setKataSandi,
  lihatSandi,
  setLihatSandi,
  memuat,
  kekuatan,
}: {
  kataSandi: string;
  setKataSandi: (v: string) => void;
  lihatSandi: boolean;
  setLihatSandi: (v: boolean) => void;
  memuat: boolean;
  kekuatan: KekuatanSandi;
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

      {kataSandi ? <IndikatorSandi kekuatan={kekuatan} /> : null}
    </div>
  );
}
