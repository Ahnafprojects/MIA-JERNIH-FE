"use client";

/**
 * W04 — Konsol: detail satu pelanggan.
 *
 * Halaman ini dibuka setelah petugas menemukan orangnya di daftar, dan
 * hampir selalu karena ada yang akan DILAKUKAN: menutup aliran, menerbitkan
 * token, atau menjawab telepon yang sedang berlangsung. Jadi urutannya
 * mengikuti urutan percakapan itu —
 *
 *   1. siapa dan sedang bagaimana   → kepala + status + aksi cepat
 *   2. apa yang terbaca sekarang    → layar meter hidup, saklar, relay
 *   3. kenapa begitu                → ambang alarm, pemakaian 30 hari
 *   4. apa yang sudah terjadi       → riwayat token, lini masa aktivitas
 *
 * Layar LCD di kolom kanan adalah satu-satunya hal mencolok di halaman ini;
 * sisanya sengaja tenang. Ia juga bukan hiasan: dua barisnya sama persis
 * dengan yang sedang menyala di dinding rumah pelanggan, jadi petugas dan
 * penelepon membaca benda yang sama.
 */
import { Suspense, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KeadaanGalat } from "@/components/ui/keadaan";
import useApi from "@/lib/use-api";
import { rapikanDetail, type DetailPelangganMentah } from "../_bagian/tipe";
import { IsiDetail } from "./_bagian/isi-detail";
import { RangkaDetail } from "./_bagian/rangka-detail";

/**
 * `params` adalah Promise di Next 16, dan membacanya dengan `use()` berarti
 * komponen ini MENANGGUHKAN diri.
 *
 * Dengan `cacheComponents: true` di `next.config.ts`, data tak ter-cache yang
 * dibaca DI LUAR `<Suspense>` membatalkan prerender seluruh rute — Next
 * melaporkannya sebagai galat merah di konsol browser, dan halamannya
 * dikirim lebih lambat karena tidak ada satu bagian pun yang bisa
 * digambar lebih dulu. Batas di bawah ini yang membuat rangka pemuatan
 * terkirim dari server sementara segmen `[id]`-nya diselesaikan.
 *
 * Fallback-nya RANGKA yang sama dengan rangka pengambilan data, bukan layar
 * kosong: dua keadaan menunggu yang berurutan tidak boleh terlihat sebagai
 * dua halaman yang berbeda.
 */
export default function HalamanDetailPelanggan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
          <RangkaDetail />
        </div>
      }
    >
      <PembacaDetail params={params} />
    </Suspense>
  );
}

function PembacaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: mentah, memuat, galat, muatUlang } =
    useApi<DetailPelangganMentah>(
      `/api/admin/pelanggan/${encodeURIComponent(id)}`,
    );

  /*
   * Jawaban server bersarang dan halaman ini membaca objek datar, jadi
   * pemetaannya dilakukan di satu tempat. `useMemo` menjaga identitas
   * objeknya stabil antar render, sebab `IsiDetail` memakainya sebagai
   * nilai awal keadaannya sendiri.
   */
  const data = useMemo(() => rapikanDetail(mentah), [mentah]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      <Link
        href="/konsol/pelanggan"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-brand-600"
      >
        <ArrowLeft size={15} aria-hidden />
        Kembali ke daftar pelanggan
      </Link>

      {galat ? (
        <Card className="mt-6">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
          <div className="border-t border-line px-6 py-5 text-center">
            <p className="mx-auto max-w-[52ch] text-[13px] leading-relaxed text-muted">
              ID yang diminta:{" "}
              <span className="tabular font-mono font-semibold text-ink">
                {id}
              </span>
              . Nomor pelanggan Jernih berbentuk{" "}
              <span className="tabular font-mono">JRN-10153</span> — periksa
              kembali, atau cari namanya di daftar.
            </p>
            {/* Tautan, bukan tombol ber-`window.location`: jalur keluar dari
                halaman galat harus tetap bekerja sebagai tautan biasa —
                bisa dibuka di tab baru, dan tidak bergantung pada JavaScript
                yang barusan saja gagal mengambil datanya. */}
            <Link
              href="/konsol/pelanggan"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-input border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-soft"
            >
              Buka daftar pelanggan
            </Link>
          </div>
        </Card>
      ) : memuat || !data ? (
        <RangkaDetail />
      ) : (
        /*
          `key` berisi id pelanggan, dan itu bukan formalitas: `IsiDetail`
          menyimpan keadaan relay dan bacaan meter yang berjalan sendiri.
          Tanpa `key`, berpindah dari satu pelanggan ke pelanggan lain
          memakai ulang komponen yang sama — dan saldo orang sebelumnya
          masih berjalan di layar selama beberapa bingkai.
        */
        <IsiDetail key={data.id} data={data} />
      )}
    </div>
  );
}
