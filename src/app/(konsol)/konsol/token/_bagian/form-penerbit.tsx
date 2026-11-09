import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function FormPenerbit({
  nilaiL,
  setNilaiL,
  jumlah,
  setJumlah,
  meterId,
  setMeterId,
  alasan,
  setAlasan,
  loading,
  onTerbitkan,
}: {
  nilaiL: number;
  setNilaiL: (v: number) => void;
  jumlah: number;
  setJumlah: (v: number) => void;
  meterId: string;
  setMeterId: (v: string) => void;
  alasan: string;
  setAlasan: (v: string) => void;
  loading: boolean;
  onTerbitkan: () => void;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <TextField
          label="Liter"
          type="number"
          placeholder="Liter"
          className="[&_input]:font-mono"
          value={nilaiL}
          onChange={(e) => setNilaiL(Number(e.target.value))}
        />
        <TextField
          label="Jumlah"
          type="number"
          min="1"
          placeholder="Jumlah"
          className="[&_input]:font-mono"
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
        />
        <TextField
          label="ID meter"
          placeholder="ID meter opsional"
          className="[&_input]:font-mono"
          value={meterId}
          onChange={(e) => setMeterId(e.target.value)}
        />
        <TextField
          label="Alasan penerbitan"
          placeholder="Alasan penerbitan"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
        />
      </div>
      <Button
        className="mt-4"
        onClick={() => {
          if (
            jumlah > 1 &&
            !confirm(
              `Buat ${jumlah} token senilai ${nilaiL.toLocaleString("id-ID")} L?`,
            )
          )
            return;
          onTerbitkan();
        }}
        disabled={loading || alasan.length < 3}
      >
        Terbitkan Token
      </Button>
    </div>
  );
}
