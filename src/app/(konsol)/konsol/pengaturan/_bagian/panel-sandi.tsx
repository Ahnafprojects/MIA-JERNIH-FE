import type { FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import type { HasilSandi } from "../_tipe";

interface Props {
  sandiLama: string;
  setSandiLama: (v: string) => void;
  sandiBaru: string;
  setSandiBaru: (v: string) => void;
  sandiUlang: string;
  setSandiUlang: (v: string) => void;
  kirim: boolean;
  hasil: HasilSandi | null;
  onSubmit: (e: FormEvent) => void;
}

export function PanelSandi(p: Props) {
  return (
    <Panel judul="Ganti Kata Sandi" sub="Sesi lain akan dikeluarkan setelah berhasil">
      <form onSubmit={p.onSubmit} className="max-w-md space-y-4">
        <TextField
          label="Kata sandi lama"
          type="password"
          autoComplete="current-password"
          value={p.sandiLama}
          onChange={(e) => p.setSandiLama(e.target.value)}
        />
        <TextField
          label="Kata sandi baru"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          value={p.sandiBaru}
          onChange={(e) => p.setSandiBaru(e.target.value)}
        />
        <TextField
          label="Ulangi kata sandi baru"
          type="password"
          autoComplete="new-password"
          value={p.sandiUlang}
          onChange={(e) => p.setSandiUlang(e.target.value)}
        />
        {p.hasil ? (
          <p
            role="status"
            className={cn(
              "rounded-[3px] border p-3 text-xs font-medium",
              p.hasil.tipe === "sukses"
                ? "border-success/40 bg-success/10 text-success"
                : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {p.hasil.teks}
          </p>
        ) : null}
        <Button type="submit" disabled={p.kirim || !p.sandiLama || p.sandiBaru.length < 8}>
          {p.kirim ? "Menyimpan..." : "Simpan kata sandi"}
        </Button>
      </form>
    </Panel>
  );
}
