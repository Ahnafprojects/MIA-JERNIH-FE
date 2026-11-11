"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import { stempel, unduhCsv, type KolomCsv } from "../_bagian/csv";
import type { IsiTutupRelay } from "../_bagian/dialog-relay";
import {
  alasanRelay,
  EMAIL_PENGINGAT,
  emailPenutupan,
  jalankanBanyak,
  kirimEmailPelanggan,
  ubahRelay,
  type HasilBanyak,
} from "../_bagian/aksi-pelanggan";
import {
  STATUS_METER,
  URUTAN,
  type BarisPelanggan,
  type DaftarPelanggan,
  type SaringKunci,
} from "../_bagian/tipe";

/** Kolom berkas unduhan. Urutannya sama dengan yang dibaca di layar. */
const KOLOM_CSV: KolomCsv<BarisPelanggan>[] = [
  { label: "ID pelanggan", nilai: (b) => b.id },
  { label: "Nama", nilai: (b) => b.nama },
  { label: "Zona", nilai: (b) => b.zona },
  { label: "Saldo (L)", nilai: (b) => b.saldoL, desimal: 2 },
  { label: "Debit (L/mnt)", nilai: (b) => b.debitLpm, desimal: 1 },
  { label: "Saklar ON", nilai: (b) => b.saklarOn },
  { label: "Relay terbuka", nilai: (b) => b.relayOn },
  { label: "Online", nilai: (b) => b.online },
  { label: "Ada insiden", nilai: (b) => b.adaInsiden },
  { label: "Status", nilai: (b) => STATUS_METER[b.status].label },
  { label: "Telemetri terakhir", nilai: (b) => stempel(b.terakhirLapor) },
];

export type AksiMassal = "email" | "relay" | null;

export interface KabarAksi {
  nada: "sukses" | "info" | "peringatan";
  judul: string;
  teks: string;
}

/**
 * Semua state, pengambilan data, dan aksi massal halaman daftar pelanggan.
 *
 * - Paginasi dari server: yang berpindah hanya `?halaman=`.
 * - Pencarian ditunda 300 ms supaya mengetik tidak jadi belasan permintaan.
 * - Pilihan melintasi halaman; jumlahnya selalu ditampilkan sebelum aksi.
 */
export function usePelanggan() {
  const [cari, setCari] = useState("");
  const [cariTunda, setCariTunda] = useState("");
  const [zona, setZona] = useState("");
  const [saring, setSaring] = useState<SaringKunci | "">("");
  const [urutan, setUrutan] = useState(URUTAN[0].kunci);
  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState(25);

  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [aksi, setAksi] = useState<AksiMassal>(null);
  const [kabar, setKabar] = useState<KabarAksi | null>(null);

  /* Aksi massal sedang berjalan. Mengunci tombol supaya satu klik ganda
     tidak menutup aliran atau mengirim email dua kali. */
  const [sibuk, setSibuk] = useState(false);

  // Pencarian ditunda; sisanya berlaku seketika karena datang dari klik.
  useEffect(() => {
    const t = setTimeout(() => setCariTunda(cari.trim()), 300);
    return () => clearTimeout(t);
  }, [cari]);

  /*
   * Tiap perubahan penyaring mengembalikan ke halaman 1.
   *
   * Tanpa ini, mencari "Budi" dari halaman 300 menghasilkan daftar kosong
   * yang terbaca sebagai "tidak ada Budi" padahal hanya salah halaman.
   *
   * Dikerjakan di PENANGAN PERISTIWA, bukan di `useEffect` yang mengamati
   * penyaringnya. Effect yang memanggil setState menjalankan render
   * berantai — satu untuk penyaring barunya, satu lagi untuk halamannya —
   * dan di antaranya sempat ada satu putaran dengan penyaring baru di
   * halaman lama, yaitu permintaan ke server yang hasilnya langsung
   * dibuang. Mengubah penyaring memang tindakan pengguna; tempatnya di
   * sini.
   */
  function gantiSaringan(ubah: () => void) {
    ubah();
    setHalaman(1);
  }

  const pilihanUrut = URUTAN.find((u) => u.kunci === urutan) ?? URUTAN[0];

  const jalur = useMemo(() => {
    const q = new URLSearchParams({
      halaman: String(halaman),
      per: String(perHalaman),
      urut: pilihanUrut.urut,
      arah: pilihanUrut.arah,
    });
    if (cariTunda) q.set("cari", cariTunda);
    if (zona) q.set("zona", zona);
    if (saring) q.set("saring", saring);
    return `/api/admin/pelanggan?${q.toString()}`;
  }, [halaman, perHalaman, pilihanUrut, cariTunda, zona, saring]);

  const { data, memuat, menyegarkan, galat, muatUlang } =
    useApi<DaftarPelanggan>(jalur);

  /* Baris apa adanya dari server. Sesudah aksi relay, halaman memuat ulang
     dari server alih-alih menimpa barisnya di klien: yang tampil harus
     keadaan yang memang tersimpan. */
  const baris = useMemo(() => data?.baris ?? [], [data]);

  const semuaHalamanTerpilih =
    baris.length > 0 && baris.every((b) => terpilih.has(b.id));
  const sebagianTerpilih =
    !semuaHalamanTerpilih && baris.some((b) => terpilih.has(b.id));

  const togglePilih = useCallback((id: string) => {
    setTerpilih((lama) => {
      const baru = new Set(lama);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });
  }, []);

  const toggleHalaman = useCallback(
    (pilihSemua: boolean) => {
      setTerpilih((lama) => {
        const baru = new Set(lama);
        for (const b of baris) {
          if (pilihSemua) baru.add(b.id);
          else baru.delete(b.id);
        }
        return baru;
      });
    },
    [baris],
  );

  const idTerpilih = useMemo(() => [...terpilih], [terpilih]);
  const jumlahTerpilih = idTerpilih.length;

  /** Satu nama hanya bila yang dipilih memang satu DAN ada di halaman ini. */
  const namaTunggal =
    jumlahTerpilih === 1
      ? baris.find((b) => b.id === idTerpilih[0])?.nama
      : undefined;

  /*
   * Yang diekspor adalah YANG SEDANG TAMPIL — atau yang dicentang bila ada.
   *
   * Bukan seluruh 8.219 baris: berkas yang isinya tidak sama dengan layar
   * membuat orang pertama yang mencocokkannya berhenti percaya pada
   * keduanya. Tombolnya menyebutkan jumlah barisnya supaya tidak ada yang
   * perlu menebak.
   */
  const barisEkspor = useMemo(
    () => (jumlahTerpilih > 0 ? baris.filter((b) => terpilih.has(b.id)) : baris),
    [baris, terpilih, jumlahTerpilih],
  );

  function ekspor() {
    unduhCsv("pelanggan-jernih", KOLOM_CSV, barisEkspor);
    setKabar({
      nada: "info",
      judul: "Berkas CSV diunduh",
      teks: `${angka(barisEkspor.length)} baris, pemisah titik koma dan desimal koma — langsung rapi di Excel berlokal Indonesia.`,
    });
  }

  /** Ringkasan hasil aksi banyak pelanggan, menyebut yang gagal apa adanya. */
  function laporkan(judulBerhasil: string, hasil: HasilBanyak, catatan = "") {
    const gagal = hasil.gagal.length;
    const contoh = hasil.gagal[0]?.pesan;
    setKabar({
      nada: gagal === 0 ? "sukses" : "peringatan",
      judul:
        gagal === 0
          ? `${judulBerhasil} untuk ${angka(hasil.berhasil.length)} pelanggan`
          : `${angka(hasil.berhasil.length)} berhasil, ${angka(gagal)} gagal`,
      teks: [
        gagal > 0 ? `Contoh penolakan server: ${contoh}` : "",
        catatan,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  async function jalankanEmail() {
    const sasaran = idTerpilih;
    setAksi(null);
    setSibuk(true);
    try {
      const hasil = await jalankanBanyak(sasaran, (id) =>
        kirimEmailPelanggan(id, EMAIL_PENGINGAT.subjek, EMAIL_PENGINGAT.pesan),
      );
      laporkan("Email pengingat terkirim", hasil);
      setTerpilih(new Set(hasil.gagal.map((g) => g.id)));
    } finally {
      setSibuk(false);
    }
  }

  async function jalankanTutupRelay(isi: IsiTutupRelay) {
    const sasaran = idTerpilih;
    const alasan = alasanRelay(isi);
    setAksi(null);
    setSibuk(true);
    try {
      /* Id baris di daftar ini adalah id METER (BE src/rute/konsol.ts). */
      const hasil = await jalankanBanyak(sasaran, async (id) => {
        await ubahRelay(id, "tutup", alasan);
        if (isi.kirimEmail) {
          const email = emailPenutupan(alasan);
          // Email gagal tidak membatalkan penutupan yang sudah terjadi.
          await kirimEmailPelanggan(id, email.subjek, email.pesan).catch(() => {});
        }
      });
      laporkan(
        "Aliran ditutup",
        hasil,
        "Tercatat di audit log atas nama akun Anda.",
      );
      setTerpilih(new Set(hasil.gagal.map((g) => g.id)));
      muatUlang();
    } finally {
      setSibuk(false);
    }
  }

  return {
    // data
    data,
    baris,
    memuat,
    menyegarkan,
    galat,
    muatUlang,
    total: data?.total ?? null,
    // penyaring
    cari,
    setCari,
    zona,
    setZona,
    saring,
    setSaring,
    urutan,
    setUrutan,
    setHalaman,
    setPerHalaman,
    gantiSaringan,
    // pilihan
    terpilih,
    setTerpilih,
    togglePilih,
    toggleHalaman,
    semuaHalamanTerpilih,
    sebagianTerpilih,
    jumlahTerpilih,
    namaTunggal,
    // ekspor + aksi massal
    barisEkspor,
    ekspor,
    aksi,
    setAksi,
    kabar,
    setKabar,
    sibuk,
    jalankanEmail,
    jalankanTutupRelay,
  };
}
