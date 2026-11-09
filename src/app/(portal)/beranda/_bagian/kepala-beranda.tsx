import Link from "next/link";
import { Droplet, KeyRound, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KepalaBeranda({
  nama,
  tanggalPanjang,
  sapaanSekarang,
  labelMeter,
  alamatMeter,
  zonaMeter,
}: {
  nama: string | null | undefined;
  tanggalPanjang: string;
  sapaanSekarang: string;
  labelMeter: string | null;
  alamatMeter: string | null;
  zonaMeter: string | null;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          {tanggalPanjang}
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {sapaanSekarang}, {nama ?? "Warga"}
        </h1>
        {/*
          Label dan alamat berasal dari server, bukan dikarang. Selama
          permintaannya belum selesai yang tampil hanya "Meter aktif" —
          menampilkan alamat sementara lalu menukarnya dengan alamat
          sungguhan akan terbaca sebagai data yang berubah sendiri.

          Nomor seri TIDAK ADA di baris ini; tempatnya di kartu saldo. Di
          sini ia berdiri sebagai potongan kode di ujung kalimat alamat dan
          tidak menjelaskan apa-apa. Di sebelah angka saldo, ia menjawab
          "saldo ini milik meter yang mana" — satu-satunya pertanyaan yang
          bisa dijawab sebuah nomor seri.
        */}
        <p className="mt-1 text-xs text-muted">
          <strong className="text-ink">{labelMeter ?? "Meter aktif"}</strong>
          {alamatMeter ? ` · ${alamatMeter}` : null}
          {zonaMeter ? ` · ${zonaMeter}` : null}
        </p>
      </div>

      {/*
        Tombol aksi: ikon saja di ponsel, ikon + label mulai `sm`.

        Ketiganya sebelumnya memaksakan label penuh di setiap lebar, dan
        pada 390px "Beli Token" serta "Laporkan Gangguan" pecah di tengah
        kata menjadi dua baris — tombolnya tumbuh ke bawah dan barisnya
        terbaca rusak. Menyusut jadi ikon lebih jujur daripada memotong
        kata: ikonnya sama persis dengan yang dipakai di navigasi, jadi
        artinya sudah dikenali sebelum pertama kali ditekan.

        `aria-label` dipasang di SEMUA lebar, bukan hanya saat labelnya
        hilang — pembaca layar membaca atribut itu, bukan apa yang kebetulan
        terlihat pada lebar jendela saat itu.
      */}
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/beli">
          <Button varian="utama" ukuran="sm" aria-label="Beli token">
            <Droplet size={14} aria-hidden />
            <span className="hidden whitespace-nowrap sm:inline">
              Beli Token
            </span>
          </Button>
        </Link>
        <Link href="/token">
          <Button
            varian="sekunder"
            ukuran="sm"
            aria-label="Buka keypad dan tukar token"
          >
            <KeyRound size={14} aria-hidden />
            <span className="hidden whitespace-nowrap sm:inline">
              Keypad &amp; Tukar
            </span>
          </Button>
        </Link>
        <Link href="/bantuan">
          <Button
            varian="bahaya"
            ukuran="sm"
            className="font-bold shadow-sm"
            aria-label="Laporkan gangguan"
          >
            <LifeBuoy size={14} aria-hidden />
            <span className="hidden whitespace-nowrap sm:inline">
              Laporkan Gangguan
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
