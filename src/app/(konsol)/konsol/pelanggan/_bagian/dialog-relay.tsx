"use client";

/**
 * Dialog tutup aliran (relay).
 *
 * Tindakan paling berat di seluruh konsol: air di rumah orang berhenti.
 * Karena itu tiga penghalang dipasang berurutan, dan tidak satu pun boleh
 * dilewati —
 *
 * 1. **Judulnya menyebut JUMLAHNYA.** "Tutup aliran untuk 14 pelanggan?",
 *    bukan "Tutup aliran?". Satu baris salah pilih di tabel 8.219 baris
 *    tidak terlihat sampai angkanya ditulis di depan mata.
 * 2. **Alasan wajib.** Bukan formalitas: alasannyalah yang masuk ke audit
 *    log dan yang dibaca orang lain tiga bulan kemudian saat pelanggan
 *    protes. Tanpa alasan, catatan audit hanya mencatat bahwa ada yang
 *    terjadi, bukan kenapa.
 * 3. **Konfirmasi geser.** Lihat `geser.tsx`.
 *
 * Petugas juga diberi tahu DI DEPAN bahwa tindakannya tercatat atas namanya.
 * Memberitahukannya setelah tindakan selesai tidak mengubah keputusan siapa
 * pun; memberitahukannya sebelum, mengubah.
 */

import { useId, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Pemberitahuan } from "@/components/ui/keadaan";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Dialog } from "./dialog";
import { GeserKonfirmasi } from "./geser";
import { LABEL_PERAN, PERAN_SEKARANG } from "./peran";

/**
 * Alasan baku, bukan kotak teks kosong.
 *
 * Kotak kosong menghasilkan "tutup" dan "sesuai arahan" — tulisan yang lolos
 * validasi tapi tidak menjelaskan apa pun di audit log. Daftar tertutup
 * membuat alasannya bisa dihitung dan dibandingkan antar zona.
 */
const ALASAN = [
  "Tunggakan pembayaran",
  "Permintaan pelanggan",
  "Dugaan kebocoran di instalasi pelanggan",
  "Perbaikan jaringan terjadwal",
  "Indikasi pencurian air",
  "Lainnya",
] as const;

export interface IsiTutupRelay {
  alasan: string;
  keterangan: string;
  kirimEmail: boolean;
}

export function DialogTutupRelay({
  jumlah,
  namaTunggal,
  onBatal,
  onKonfirmasi,
}: {
  jumlah: number;
  /** Nama pelanggan bila hanya satu — lebih jelas daripada "1 pelanggan". */
  namaTunggal?: string;
  onBatal: () => void;
  onKonfirmasi: (isi: IsiTutupRelay) => void;
}) {
  const [alasan, setAlasan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [kirimEmail, setKirimEmail] = useState(true);
  const idKeterangan = useId();
  const idEmail = useId();

  const butuhKeterangan = alasan === "Lainnya";
  const sahKeterangan = !butuhKeterangan || keterangan.trim().length >= 10;
  const siap = alasan !== "" && sahKeterangan;

  const sasaran =
    jumlah === 1 && namaTunggal
      ? namaTunggal
      : `${angka(jumlah)} pelanggan`;

  return (
    <Dialog
      judul={`Tutup aliran untuk ${sasaran}?`}
      sub={
        jumlah === 1
          ? "Air di titik ini berhenti seketika setelah perintah diterima meter."
          : `Air di ${angka(jumlah)} rumah berhenti seketika setelah perintah diterima tiap meter. Membukanya kembali harus dilakukan satu per satu.`
      }
      onTutup={onBatal}
      /* Dialog ini sudah berisi ketikan: jangan hilang karena salah klik. */
      tutupDiLuar={false}
      lebar="34rem"
      kaki={
        <GeserKonfirmasi
          label="menutup aliran"
          labelPanjang={`tutup aliran untuk ${sasaran}`}
          labelSelesai="Perintah tutup aliran dikirim"
          nonaktif={!siap}
          alasanNonaktif={
            alasan === ""
              ? "Pilih alasan dulu — alasannya yang masuk ke audit log."
              : "Keterangan minimal 10 karakter untuk alasan “Lainnya”."
          }
          onSelesai={() =>
            onKonfirmasi({
              alasan,
              keterangan: keterangan.trim(),
              kirimEmail,
            })
          }
        />
      }
    >
      <div className="space-y-4">
        <Select
          label="Alasan penutupan (wajib)"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
        >
          <option value="">— Pilih alasan —</option>
          {ALASAN.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>

        <div>
          <label
            htmlFor={idKeterangan}
            className="mb-1.5 block text-[13px] font-semibold"
          >
            Keterangan{" "}
            <span className="font-normal text-muted">
              {butuhKeterangan ? "(wajib)" : "(opsional)"}
            </span>
          </label>
          <textarea
            id={idKeterangan}
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Nomor surat, nama pelapor, atau konteks lain yang perlu dibaca orang berikutnya."
            aria-invalid={butuhKeterangan && !sahKeterangan ? true : undefined}
            className={cn(
              "w-full resize-y rounded-input border bg-surface px-3 py-2.5",
              "text-[15px] outline-none focus:ring-2 focus:ring-brand-500/30",
              butuhKeterangan && !sahKeterangan
                ? "border-danger"
                : "border-line-strong",
            )}
          />
        </div>

        <div className="flex items-start gap-2.5 border-t border-line pt-4">
          <input
            id={idEmail}
            type="checkbox"
            checked={kirimEmail}
            onChange={(e) => setKirimEmail(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-brand-600"
          />
          <label htmlFor={idEmail} className="text-[13.5px] leading-snug">
            Kirim email pemberitahuan ke{" "}
            {jumlah === 1 ? "pelanggan" : `${angka(jumlah)} pelanggan`}
            <span className="mt-0.5 block text-[12.5px] text-muted">
              Berisi alasan di atas dan cara mengaktifkan kembali. Tanpa ini
              pelanggan hanya tahu airnya mati.
            </span>
          </label>
        </div>

        <Pemberitahuan nada="peringatan" judul="Tindakan ini tercatat">
          <p className="flex items-start gap-2">
            <ShieldAlert size={15} aria-hidden className="mt-0.5 shrink-0" />
            <span>
              Penutupan aliran masuk ke audit log atas nama akun Anda
              <span className="text-muted">
                {" "}
                (peran {LABEL_PERAN[PERAN_SEKARANG]})
              </span>
              , lengkap dengan waktu, alasan, dan daftar meter yang terdampak.
              Catatan audit tidak bisa dihapus dari konsol.
            </span>
          </p>
        </Pemberitahuan>
      </div>
    </Dialog>
  );
}

/**
 * Konfirmasi aksi massal yang TIDAK merusak (email, terbitkan token).
 *
 * Tetap menyebut jumlahnya — mengirim email ke 480 orang karena satu
 * centang "pilih semua" yang terlupa juga tidak bisa ditarik kembali.
 * Tanpa geser: akibatnya bisa dijelaskan, bukan diperbaiki, tapi tidak ada
 * rumah yang kehilangan air.
 */
export function DialogKonfirmasiMassal({
  judul,
  sub,
  labelAksi,
  jumlah,
  onBatal,
  onKonfirmasi,
}: {
  judul: string;
  sub: string;
  labelAksi: string;
  jumlah: number;
  onBatal: () => void;
  onKonfirmasi: () => void;
}) {
  return (
    <Dialog judul={judul} sub={sub} onTutup={onBatal} lebar="30rem">
      <div className="flex items-baseline gap-2 border-y border-line py-4">
        <span className="tabular font-mono text-[32px] leading-none font-bold text-brand-600">
          {angka(jumlah)}
        </span>
        <span className="text-[13px] text-muted">
          pelanggan terpilih akan menerima tindakan ini
        </span>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button varian="sekunder" onClick={onBatal}>
          Batal
        </Button>
        <Button onClick={onKonfirmasi}>{labelAksi}</Button>
      </div>
    </Dialog>
  );
}
