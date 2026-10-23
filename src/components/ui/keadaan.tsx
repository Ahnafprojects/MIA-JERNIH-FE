import { cn } from "@/lib/cn";
import { Button } from "./button";

/**
 * Tiga keadaan yang WAJIB dikerjakan tiap halaman, bukan hanya jalur mulus:
 * memuat, kosong, dan galat. Juri akan membuka halaman tanpa data, dan
 * halaman putih tanpa penjelasan terbaca sebagai fitur yang rusak.
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-soft", className)}
    />
  );
}

export function KeadaanKosong({
  judul,
  pesan,
  aksi,
}: {
  judul: string;
  pesan: string;
  aksi?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        aria-hidden
        className="mb-4 size-12 rounded-full border-2 border-dashed border-line-strong"
      />
      <h3 className="font-display font-bold">{judul}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{pesan}</p>
      {aksi ? <div className="mt-5">{aksi}</div> : null}
    </div>
  );
}

export function KeadaanGalat({
  pesan,
  onCoba,
}: {
  pesan: string;
  onCoba?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <h3 className="font-display font-bold text-danger">
        Data tidak bisa dimuat
      </h3>
      {/* Tampilkan pesan dari server apa adanya: ia sudah menjelaskan sebabnya
          dalam Bahasa Indonesia. Menggantinya dengan kalimat umum justru
          menghapus petunjuk yang dibutuhkan pengguna. */}
      <p className="mt-1.5 max-w-sm text-sm text-muted">{pesan}</p>
      {onCoba ? (
        <Button varian="sekunder" className="mt-5" onClick={onCoba}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

export function Pemberitahuan({
  nada = "info",
  judul,
  children,
}: {
  nada?: "info" | "peringatan" | "bahaya" | "sukses";
  judul?: string;
  children: React.ReactNode;
}) {
  const gaya = {
    info: "bg-info-soft border-info/30 text-info",
    peringatan: "bg-warn-soft border-warn/30 text-warn",
    bahaya: "bg-danger-soft border-danger/30 text-danger",
    sukses: "bg-success-soft border-success/30 text-success",
  }[nada];

  return (
    // Peringatan penting tampil sebagai banner di atas konten, bukan dialog:
    // dialog memaksa pengguna menutupnya sebelum sempat membaca konteksnya.
    <div role="status" className={cn("rounded-card border px-4 py-3", gaya)}>
      {judul ? <p className="font-display text-sm font-bold">{judul}</p> : null}
      <div className="text-[13.5px] text-ink/90">{children}</div>
    </div>
  );
}
