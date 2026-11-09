import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { LcdDisplay } from "@/components/domain/lcd";
import type { FormKonfigurasi } from "../_tipe";

/*
 * Label dibaca PETUGAS, jadi bukan nama variabelnya.
 *
 * Sebelum ini keempat label berisi identifier mentah — `ambangPeringatanL`,
 * `panjangToken`, dan seterusnya — karena kuncinya dipakai langsung sebagai
 * teks. Yang membaca layar ini petugas PDAM, bukan yang menulis kodenya, dan
 * "ambangPeringatanL" tidak memberi tahu satuannya maupun apa yang diubahnya.
 *
 * Satuan ikut ditulis karena ketiganya berbeda: dua dalam liter, satu dalam
 * pulsa per liter, satu dalam jumlah digit. Tanpa satuan, angka 10 di kolom
 * terakhir sama masuk akalnya dibaca sebagai liter.
 */
const FIELD: {
  kunci: keyof Omit<FormKonfigurasi, "alasan">;
  label: string;
  bantuan: string;
}[] = [
  {
    kunci: "ambangPeringatanL",
    label: "Ambang peringatan (liter)",
    bantuan: "Meter mulai berbunyi saat saldo menyentuh angka ini.",
  },
  {
    kunci: "ambangKritisL",
    label: "Ambang kritis (liter)",
    bantuan: "Bunyi dipercepat saat saldo menyentuh angka ini.",
  },
  {
    kunci: "kalibrasi",
    label: "Kalibrasi (pulsa per liter)",
    bantuan: "Jumlah pulsa sensor yang dihitung sebagai satu liter.",
  },
  {
    kunci: "panjangToken",
    label: "Panjang token (digit)",
    bantuan: "Banyak digit kode token yang diterima meter.",
  },
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
        {FIELD.map(({ kunci, label, bantuan }) => (
          <TextField
            key={kunci}
            label={label}
            hint={bantuan}
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
