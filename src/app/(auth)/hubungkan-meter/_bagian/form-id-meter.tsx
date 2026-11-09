import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export function FormIdMeter({
  targetId,
  setTargetId,
  memuatCari,
  memuatHubung,
  onCari,
}: {
  targetId: string;
  setTargetId: (v: string) => void;
  memuatCari: boolean;
  memuatHubung: boolean;
  onCari: (id: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCari(targetId);
      }}
      className="space-y-4"
    >
      <TextField
        label="ID Pelanggan / Nomor Seri Meter"
        type="text"
        required
        placeholder="Contoh: P0001 atau JRN-10000"
        value={targetId}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetId(e.target.value)}
        disabled={memuatCari || memuatHubung}
        hint="Lihat stiker barcode atau plat kuningan di badan meter air Anda."
      />

      <Button type="submit" varian="sekunder" blok memuat={memuatCari}>
        Cari & Periksa Meter
      </Button>
    </form>
  );
}
