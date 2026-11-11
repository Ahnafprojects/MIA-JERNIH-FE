import { Badge } from "@/components/ui/badge";
import { KeadaanKosong } from "@/components/ui/keadaan";
import { Kolom, Tabel } from "@/components/ui/tabel";
import { liter, tanggal } from "@/lib/format";
import type { TokenPelanggan } from "../../_bagian/tipe";

export function TabelToken({ token }: { token: TokenPelanggan[] }) {
  const kolom: Kolom<TokenPelanggan>[] = [
    {
      kunci: "kode",
      label: "Kode token",
      render: (t) => (
        <span className="tabular font-mono text-[13px] font-semibold">
          ••••• {t.kode.split(" ")[1] ?? t.kode.slice(-5)}
        </span>
      ),
    },
    {
      kunci: "liter",
      label: "Nilai",
      rata: "kanan",
      render: (t) => (
        <span className="tabular font-mono text-[13px]">{liter(t.liter, 0)}</span>
      ),
    },
    {
      kunci: "pada",
      label: "Diterbitkan",
      sembunyiKecil: true,
      render: (t) => <span className="text-[13px]">{tanggal(t.pada)}</span>,
    },
    {
      kunci: "status",
      label: "Status",
      rata: "kanan",
      render: (t) => (
        <Badge nada={t.dipakai ? "netral" : "sukses"} titik>
          {t.dipakai ? "Sudah ditukar" : "Belum ditukar"}
        </Badge>
      ),
    },
  ];

  return (
    <Tabel
      kolom={kolom}
      data={token}
      kunciBaris={(t) => t.kode}
      lebarMin="22rem"
      kosong={
        <KeadaanKosong
          judul="Belum ada token"
          pesan="Meter ini belum pernah menerima token. Terbitkan satu dari tombol di atas."
        />
      }
    />
  );
}
