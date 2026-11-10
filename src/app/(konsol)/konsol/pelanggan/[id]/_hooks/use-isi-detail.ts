"use client";

import { useMemo, useState } from "react";
import {
  alasanRelay,
  EMAIL_PENGINGAT,
  emailPenutupan,
  kirimEmailPelanggan,
  pesanGalat,
  ubahRelay,
} from "../../_bagian/aksi-pelanggan";
import type { IsiTutupRelay } from "../../_bagian/dialog-relay";
import { useBacaanLive } from "../../_bagian/meter-live";
import { STATUS_METER, nadaSaldo, type DetailPelanggan } from "../../_bagian/tipe";

/** State, bacaan hidup, dan aksi (relay, email) untuk isi halaman detail pelanggan. */
export function useIsiDetail(data: DetailPelanggan) {
  /* Keadaan relay sesudah perintah terakhir yang DITERIMA server. Hanya
     diubah setelah `POST /relay` berhasil, tidak pernah sebelumnya. */
  const [relay, setRelay] = useState(data.relayOn);
  const [dialogTutup, setDialogTutup] = useState(false);
  const [dialogEmail, setDialogEmail] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [kabar, setKabar] = useState<{
    nada: "sukses" | "info" | "peringatan" | "bahaya";
    judul: string;
    teks: string;
  } | null>(null);

  const pakai = data.pakaiHarian.points;
  const total30 = useMemo(() => pakai.reduce((t, n) => t + n, 0), [pakai]);
  const rata = pakai.length > 0 ? total30 / pakai.length : null;

  // Air mengalir hanya bila SEMUA syaratnya terpenuhi. Lihat `meter-live.tsx`.
  const mengalir =
    data.saklarOn && relay && data.online && data.debitLpm > 0 && data.saldoL > 0;
  const bacaan = useBacaanLive(data.saldoL, total30, data.debitLpm, mengalir);

  const s = STATUS_METER[data.status];
  const nada = nadaSaldo(bacaan.saldoL);

  /*
   * Sebelumnya ketiga aksi di bawah hanya mengubah state halaman lalu
   * menampilkan "Perintah dikirim" dan "Tercatat di audit log", tanpa satu
   * permintaan pun ke server. Sekarang pesan sukses hanya muncul sesudah
   * server menerima perintahnya, dan penolakan (saldo habis, saklar OFF,
   * peran tidak cukup) ditampilkan dengan kalimat dari server.
   */
  const meterId = data.meterId;

  async function tutupRelay(isi: IsiTutupRelay) {
    if (!meterId) return;
    const alasan = alasanRelay(isi);
    setDialogTutup(false);
    setSibuk(true);
    try {
      await ubahRelay(meterId, "tutup", alasan);
      setRelay(false);

      let catatanEmail = "Tanpa email pemberitahuan ke pelanggan.";
      if (isi.kirimEmail) {
        const email = emailPenutupan(alasan);
        catatanEmail = await kirimEmailPelanggan(data.id, email.subjek, email.pesan)
          .then(() => "Email pemberitahuan terkirim ke pelanggan.")
          .catch(
            (e: unknown) =>
              `Email pemberitahuan GAGAL: ${pesanGalat(e, "server menolak.")}`,
          );
      }

      setKabar({
        nada: "peringatan",
        judul: "Aliran ditutup",
        teks: `Alasan: ${alasan}. ${catatanEmail} Tercatat di audit log atas nama akun Anda.`,
      });
    } catch (e) {
      setKabar({
        nada: "bahaya",
        judul: "Aliran tidak ditutup",
        teks: pesanGalat(e, "Server menolak perintah tutup aliran."),
      });
    } finally {
      setSibuk(false);
    }
  }

  async function bukaRelay() {
    if (!meterId) return;
    setSibuk(true);
    try {
      await ubahRelay(meterId, "buka", "Dibuka kembali oleh petugas dari konsol");
      setRelay(true);
      setKabar({
        nada: "sukses",
        judul: "Aliran dibuka",
        teks: "Tercatat di audit log atas nama akun Anda.",
      });
    } catch (e) {
      setKabar({
        nada: "bahaya",
        judul: "Aliran tidak dibuka",
        teks: pesanGalat(e, "Server menolak perintah buka aliran."),
      });
    } finally {
      setSibuk(false);
    }
  }

  async function kirimEmail() {
    setDialogEmail(false);
    setSibuk(true);
    try {
      await kirimEmailPelanggan(data.id, EMAIL_PENGINGAT.subjek, EMAIL_PENGINGAT.pesan);
      setKabar({
        nada: "sukses",
        judul: "Email terkirim",
        teks: `Pengingat cara memeriksa saldo dan mengisi ulang dikirim ke ${data.email || data.nama}.`,
      });
    } catch (e) {
      setKabar({
        nada: "bahaya",
        judul: "Email tidak terkirim",
        teks: pesanGalat(e, "Server menolak pengiriman email."),
      });
    } finally {
      setSibuk(false);
    }
  }

  return {
    relay,
    dialogTutup,
    setDialogTutup,
    dialogEmail,
    setDialogEmail,
    sibuk,
    kabar,
    setKabar,
    total30,
    rata,
    mengalir,
    bacaan,
    s,
    nada,
    meterId,
    tutupRelay,
    bukaRelay,
    kirimEmail,
  };
}
