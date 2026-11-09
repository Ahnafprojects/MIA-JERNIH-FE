import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink, Info, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KeyakinanLokasi, ValidasiLaporan } from "../_tipe";

/**
 * Kalimat untuk tiap tingkat keyakinan lokasi.
 *
 * Nadanya sengaja tidak menuduh, bahkan pada tingkat terendah. Warga yang
 * baru melaporkan pipa bocor tidak sedang diaudit; yang dibutuhkannya adalah
 * tahu apakah petugas akan menemukan lokasinya. Karena itu tiap kalimat
 * diakhiri hal yang BISA dilakukan, bukan penilaian atas laporannya.
 */
const PESAN_KEYAKINAN: Record<KeyakinanLokasi, { nada: string; teks: string }> = {
  TINGGI: {
    nada: "text-success",
    teks: "Titik lokasi kuat. Petugas dapat langsung menuju tempatnya.",
  },
  SEDANG: {
    nada: "text-info",
    teks: "Titik lokasi memadai. Petugas mungkin masih perlu mencari di sekitar titik ini.",
  },
  RENDAH: {
    nada: "text-warn",
    teks: "Titik lokasi masih kasar. Menambahkan patokan di deskripsi akan sangat membantu petugas.",
  },
  TIDAK_DIKETAHUI: {
    nada: "text-warn",
    teks: "Laporan ini belum memuat koordinat. Petugas akan menghubungi Anda untuk memastikan lokasinya.",
  },
};

export function ModalNomorTiket({
  nomor,
  validasi,
  sudahSalin,
  onSalin,
  onTutup,
  onLihatTiket,
}: {
  nomor: string;
  validasi?: ValidasiLaporan | null;
  sudahSalin: boolean;
  onSalin: () => void;
  onTutup: () => void;
  onLihatTiket: () => void;
}) {
  const pesan = validasi ? PESAN_KEYAKINAN[validasi.keyakinanLokasi] : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onTutup}
        className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
        aria-label="Tutup popup"
      />

      <div className="relative z-10 w-full max-w-md rounded-[6px] border border-line bg-surface p-6 shadow-2xl text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={28} />
        </div>

        <span className="mt-3 inline-block font-mono text-[11px] font-bold text-success uppercase">
          Laporan Berhasil Terkirim
        </span>
        <h3 className="font-display text-xl font-bold text-ink">
          Tiket Pengaduan Diterbitkan
        </h3>

        <div className="my-5 rounded-[4px] border-2 border-dashed border-brand-500 bg-brand-500/5 p-4">
          <span className="font-mono text-[10px] uppercase text-muted">
            Nomor Tiket Anda
          </span>
          <div className="my-1 font-mono text-2xl font-black tracking-wider text-ink">
            {nomor}
          </div>
          <Button type="button" varian="sekunder" ukuran="sm" onClick={onSalin}>
            <Copy size={13} />
            <span>{sudahSalin ? "Nomor Tersalin!" : "Salin Nomor Tiket"}</span>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted text-balance">
          Simpan nomor ini. Anda dapat melacak perkembangan penanganan di halaman <strong className="text-ink">Lacak Pengaduan</strong> publik tanpa perlu masuk ke akun.
        </p>

        {pesan ? (
          <div className="cekung mt-4 space-y-2 p-3 text-left">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed">
              <MapPin size={13} className={`mt-0.5 shrink-0 ${pesan.nada}`} aria-hidden />
              <span className="text-muted">{pesan.teks}</span>
            </p>

            {/*
              Dugaan ganda disampaikan sebagai KABAR, bukan peringatan.
              Saat pipa induk pecah, puluhan warga melapor hal yang sama dalam
              satu jam, dan banyaknya laporan justru menunjukkan luas dampak.
              Laporannya tetap tercatat, dan kalimat ini tidak pernah
              menyiratkan laporannya ditolak.
            */}
            {validasi?.catatanGanda ? (
              <p className="flex items-start gap-2 text-[11px] leading-relaxed">
                <Info size={13} className="mt-0.5 shrink-0 text-info" aria-hidden />
                <span className="text-muted">{validasi.catatanGanda}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/lacak?nomor=${nomor}`}>
            <Button varian="utama" blok>
              Buka Pelacakan Tiket Publik
              <ExternalLink size={14} />
            </Button>
          </Link>
          <Button varian="halus" blok onClick={onLihatTiket}>
            Tutup & Lihat Tiket Saya
          </Button>
        </div>
      </div>
    </div>
  );
}
