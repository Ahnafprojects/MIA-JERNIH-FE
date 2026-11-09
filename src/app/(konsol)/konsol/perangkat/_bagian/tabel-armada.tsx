import { Badge } from "@/components/ui/badge";
import { Tabel, type Kolom } from "@/components/ui/tabel";
import type { MeterArmada } from "../_tipe";

export function TabelArmada({
  rows,
  ids,
  setIds,
}: {
  rows: MeterArmada[];
  ids: string[];
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const kolom: Kolom<MeterArmada>[] = [
    {
      kunci: "node",
      label: "Node / Serial",
      render: (m) => (
        <span className="font-mono text-xs">
          <span className="font-bold text-ink">{m.id}</span>
          <br />
          <span className="text-muted">{m.serial}</span>
        </span>
      ),
    },
    { kunci: "zona", label: "Zona", render: (m) => <span className="text-xs">{m.zona || "—"}</span> },
    {
      kunci: "firmware",
      label: "Firmware",
      sembunyiKecil: true,
      render: (m) => <span className="font-mono text-xs text-muted">{m.versiFirmware}</span>,
    },
    {
      kunci: "status",
      /*
       * "Status", bukan "RSSI / Status".
       *
       * Kolomnya hanya menggambar lencana Online/Offline; nilai RSSI tidak
       * pernah dirender dan `MeterArmada` memang tidak membawanya. Judul yang
       * menjanjikan angka kekuatan sinyal lalu tidak menampilkannya membuat
       * petugas mengira datanya hilang, bukan mengira datanya memang tidak
       * ada. Kalau RSSI kelak dikirim server, judulnya boleh kembali.
       */
      label: "Status",
      render: (m) => (
        <Badge nada={m.daring ? "sukses" : "bahaya"} titik>
          {m.daring ? "Online" : "Offline"}
        </Badge>
      ),
    },
    {
      kunci: "pilih",
      label: "Pilih",
      rata: "kanan",
      render: (m) => (
        <input
          type="checkbox"
          /*
           * `accent-brand-600` + `cincin-fokus`, bukan `focus:ring-brand-500`.
           *
           * Tiga dari kelas sebelumnya TIDAK BERPENGARUH apa pun pada kotak
           * centang bawaan: `rounded-[2px]` terukur menjadi `0px`, `border-line`
           * tidak terpakai, dan `focus:ring-brand-500` hanya menyetel WARNA
           * cincin tanpa lebarnya — `--tw-ring-width` kosong dan
           * `box-shadow: none`, jadi tidak ada cincin yang pernah tergambar.
           *
           * Yang sebenarnya menandai fokus adalah aturan global
           * `:focus-visible` yang memakai `brand-500`, terukur 2,88:1 di atas
           * putih, di bawah lantai 3:1 untuk penanda non-teks. `cincin-fokus`
           * memakai `brand-600` yang terukur 5,11-6,08:1.
           *
           * `accent-color` satu-satunya cara mewarnai kotak centang bawaan
           * tanpa `appearance-none` berikut seluruh gambar ulangnya.
           */
          className="cincin-fokus size-4 accent-brand-600"
          checked={ids.includes(m.id)}
          onChange={(e) =>
            setIds((x) => (e.target.checked ? [...x, m.id] : x.filter((y) => y !== m.id)))
          }
        />
      ),
    },
  ];

  return (
    <Tabel
      kolom={kolom}
      data={rows}
      kunciBaris={(m) => m.id}
      kosong={<p className="py-10 text-center text-xs text-muted">Belum ada meter terdaftar.</p>}
      lebarMin="40rem"
    />
  );
}
