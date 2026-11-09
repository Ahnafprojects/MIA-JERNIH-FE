import { Button } from "@/components/ui/button";

export function PaginasiRiwayat({
  halaman,
  totalData,
  setHalaman,
}: {
  halaman: number;
  totalData: number;
  setHalaman: (updater: (p: number) => number) => void;
}) {
  if (totalData <= 12) return null;

  return (
    <div className="flex items-center justify-between text-xs text-muted">
      <span>
        Menampilkan halaman {halaman} dari {Math.ceil(totalData / 12)}
      </span>
      <div className="flex gap-2">
        <Button
          varian="sekunder"
          ukuran="sm"
          disabled={halaman <= 1}
          onClick={() => setHalaman((p) => p - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          varian="sekunder"
          ukuran="sm"
          disabled={halaman >= Math.ceil(totalData / 12)}
          onClick={() => setHalaman((p) => p + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
