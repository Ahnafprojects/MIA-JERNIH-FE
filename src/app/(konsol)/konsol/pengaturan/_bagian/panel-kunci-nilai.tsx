import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import type { Pengaturan } from "../_tipe";

interface Props {
  nilai: Pengaturan;
  setNilai: (v: Pengaturan) => void;
  /** Tombol simpan hanya untuk supervisor. */
  bisaSimpan: boolean;
  onSimpan: () => void;
}

/** Daftar pengaturan kunci-nilai yang dipakai tab Keamanan dan Notifikasi. */
export function PanelKunciNilai({ nilai, setNilai, bisaSimpan, onSimpan }: Props) {
  return (
    <Panel>
      <div className="space-y-4">
        {Object.entries(nilai).map(([k, v]) => (
          <div className="flex items-center justify-between gap-4 text-sm" key={k}>
            <span className="text-muted">{k}</span>
            <TextField
              label=""
              className="w-40 [&_input]:font-mono"
              value={String(v)}
              onChange={(e) => setNilai({ ...nilai, [k]: e.target.value })}
            />
          </div>
        ))}
        {bisaSimpan && <Button onClick={onSimpan}>Simpan</Button>}
      </div>
    </Panel>
  );
}
