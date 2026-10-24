import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/keadaan";
import type { KanalLapor } from "./tipe";

/**
 * Jalan lain untuk melapor.
 *
 * Tanpa bagian ini halaman pelacakan adalah jalan buntu: orang yang belum
 * pernah melapor datang ke sini, menemukan kotak yang menuntut nomor yang
 * tidak ia punya, lalu pergi. Karena itu letaknya MENEMPEL pada kotak
 * pencarian — satu kartu, dipisah garis — bukan di dasar halaman.
 *
 * Jam layanan ikut ditulis. Nomor tanpa jam layanan membuat orang menelepon
 * pukul sebelas malam, tidak diangkat, dan menyimpulkan layanannya mati.
 *
 * Susunannya berdampingan, bukan bertumpuk: ketiganya setara, dan kolom
 * tegak yang panjang di sisi kanan menyisakan ruang kosong selebar layar di
 * sebelah kotak pencarian yang pendek.
 */

const IKON: Record<string, typeof Phone> = {
  telepon: Phone,
  whatsapp: MessageCircle,
  kantor: MapPin,
};

export function KanalLaporan({
  kanal,
  memuat,
  galat,
  onCoba,
}: {
  kanal: KanalLapor[];
  memuat: boolean;
  galat: string | null;
  onCoba: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
          Belum punya nomor pengaduan?
        </h2>
        <p className="max-w-[62ch] text-[13px] leading-relaxed text-muted">
          Laporkan lebih dulu lewat salah satu kanal berikut. Nomor pengaduan
          terbit saat laporan tercatat, lalu bisa dilacak di kotak atas.
        </p>
      </div>

      {galat ? (
        <div className="mt-5" role="alert">
          <p className="text-[13px] text-muted">
            Daftar kanal pelaporan tidak bisa dimuat. {galat}
          </p>
          <Button
            varian="sekunder"
            ukuran="sm"
            className="mt-3"
            onClick={onCoba}
          >
            Coba lagi
          </Button>
        </div>
      ) : memuat ? (
        <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 border-t border-line pt-4">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {kanal.map((k) => {
            const Ikon = IKON[k.kunci] ?? Phone;
            return (
              <li key={k.kunci} className="border-t border-line pt-4">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
                  <Ikon size={14} aria-hidden className="shrink-0" />
                  {k.nama}
                </p>

                {/* Nomor telepon dan WhatsApp adalah sasaran ketukan di
                    ponsel, dan sebaris teks setinggi 20px bukan sasaran yang
                    bisa dikenai jempol. Tingginya dinaikkan ke 44px lewat
                    kotaknya sendiri, bukan lewat jarak antarbaris — jaraknya
                    akan ikut melebarkan seluruh daftar. */}
                <p className="mt-1.5 text-[15px] font-semibold break-words">
                  {k.tautan ? (
                    <a
                      href={k.tautan}
                      className="tabular inline-flex min-h-11 items-center font-mono text-brand-600 hover:underline"
                    >
                      {k.nilai}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-11 items-center">
                      {k.nilai}
                    </span>
                  )}
                </p>

                <p className="mt-1 text-[12.5px] font-medium">{k.jam}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {k.catatan}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* "Masuk" dikeluarkan dari tengah kalimat dan berdiri sebagai sasaran
          tersendiri. Tautan sepanjang lima huruf di dalam paragraf hanya
          setinggi hurufnya, dan di ponsel itu sasaran 39×15 — meleset sedikit
          saja mengenai teks biasa. Kalimatnya tetap utuh tanpa tautannya. */}
      <div className="mt-6 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p className="max-w-[54ch] text-[12.5px] leading-relaxed text-muted">
            Sudah punya akun Jernih? Dari akun Anda, pengaduan bisa dikirim
            berikut fotonya, dan seluruh laporan Anda terkumpul dalam satu
            daftar.
          </p>
          <Link
            href="/masuk"
            className="inline-flex min-h-11 shrink-0 items-center rounded-[3px] border border-line-strong px-3.5 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-soft"
          >
            Masuk ke akun
          </Link>
        </div>
        {/* Angka tiruan tidak boleh disajikan seolah sungguhan. */}
        <p className="mt-3 text-[11.5px] text-muted">
          Nomor dan alamat masih contoh selama layanan ini dikembangkan.
        </p>
      </div>
    </div>
  );
}
