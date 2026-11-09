import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { LcdDisplay } from "@/components/domain/lcd";
import type { FormKonfigurasi } from "../_tipe";

const FIELD: { kunci: keyof Omit<FormKonfigurasi, "alasan">; label: string }[] = [
  { kunci: "ambangPeringatanL", label: "ambangPeringatanL" },
  { kunci: "ambangKritisL", label: "ambangKritisL" },
  { kunci: "kalibrasi", label: "kalibrasi" },
  { kunci: "panjangToken", label: "panjangToken" },
];

export function PanelKonfigurasi({
  versi,
  form,
  setForm,
  ids,
  kirim,
}: {
  versi: string;
  form: FormKonfigurasi;
  setForm: React.Dispatch<React.SetStateAction<FormKonfigurasi>>;
  ids: string[];
  kirim: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Versi terbaru: <strong className="font-mono text-ink">{versi || "—"}</strong>
      </p>

      <div className="space-y-3">
        {FIELD.map(({ kunci, label }) => (
          <TextField
            key={kunci}
            label={label}
            type="number"
            className="[&_input]:font-mono"
            value={form[kunci]}
            onChange={(e) => setForm({ ...form, [kunci]: Number(e.target.value) })}
          />
        ))}
      </div>

      <TextField
        label="Alasan perubahan"
        placeholder="Alasan perubahan"
        value={form.alasan}
        onChange={(e) => setForm({ ...form, alasan: e.target.value })}
      />

      <LcdDisplay baris1={`S=0.00L  OFF`} baris2={`D=0.0   V=0.0`} />

      <Button blok onClick={kirim} disabled={!ids.length || form.alasan.length < 3}>
        Kirim Konfigurasi
      </Button>
    </div>
  );
}
