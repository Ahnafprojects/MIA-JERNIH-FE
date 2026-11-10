"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AnggotaTim, Golongan, HasilSandi, Pengaturan, TabPengaturan } from "../_tipe";

export function usePengaturan() {
  const [tab, setTab] = useState("tim");
  const [members, setMembers] = useState<AnggotaTim[]>([]);
  const [golongan, setGolongan] = useState<Golongan[]>([]);
  const [security, setSecurity] = useState<Pengaturan>({});
  const [notif, setNotif] = useState<Pengaturan>({});
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [sandiUlang, setSandiUlang] = useState("");
  const [kirimSandi, setKirimSandi] = useState(false);
  const [hasilSandi, setHasilSandi] = useState<HasilSandi | null>(null);
  const { pengguna } = useAuth();
  const supervisor = pengguna?.peran === "SUPERVISOR";

  useEffect(() => {
    const load = async () => {
      try {
        const [m, t, s, n] = await Promise.all([
          api<{ members: AnggotaTim[] }>("/api/admin/pengaturan/tim"),
          api<{ golongan: Golongan[] }>("/api/admin/pengaturan/tarif"),
          api<Pengaturan>("/api/admin/pengaturan/keamanan"),
          api<Pengaturan>("/api/admin/pengaturan/notifikasi"),
        ]);
        setMembers(m.members);
        setGolongan(t.golongan);
        setSecurity(s);
        setNotif(n);
      } catch {}
    };
    load();
  }, []);

  const save = async (path: string, value: Pengaturan) => {
    await api(path, { method: "PATCH", body: JSON.stringify(value) });
    alert("Pengaturan tersimpan");
  };

  /*
   * Ganti kata sandi sendiri lewat `PUT /api/me/kata-sandi`.
   * Kecocokan "ulangi sandi" diperiksa di klien dan tidak dikirim ke server;
   * galat server (SANDI_LAMA_SALAH / SANDI_SAMA) ditampilkan apa adanya.
   */
  const gantiSandi = async (e: FormEvent) => {
    e.preventDefault();
    setHasilSandi(null);
    if (sandiBaru !== sandiUlang) {
      setHasilSandi({ tipe: "galat", teks: "Ulangan kata sandi baru tidak sama." });
      return;
    }
    setKirimSandi(true);
    try {
      await api("/api/me/kata-sandi", {
        method: "PUT",
        body: JSON.stringify({ kataSandiLama: sandiLama, kataSandiBaru: sandiBaru }),
      });
      setHasilSandi({
        tipe: "sukses",
        teks: "Kata sandi berhasil diubah. Sesi lain sudah dikeluarkan.",
      });
      setSandiLama("");
      setSandiBaru("");
      setSandiUlang("");
    } catch (err) {
      setHasilSandi({
        tipe: "galat",
        teks: err instanceof ApiError ? err.message : "Gagal mengubah kata sandi. Coba lagi.",
      });
    } finally {
      setKirimSandi(false);
    }
  };

  const tabs: TabPengaturan[] = [
    ...(supervisor
      ? [
          { id: "tim", label: "Tim & akses" },
          { id: "tarif", label: "Tarif & golongan" },
        ]
      : []),
    { id: "sandi", label: "Kata sandi" },
    { id: "keamanan", label: "Keamanan" },
    { id: "notifikasi", label: "Notifikasi operator" },
  ];

  /*
   * Tab aktif DITURUNKAN, bukan dipercaya apa adanya dari state.
   *
   * Keadaan awalnya `"tim"`, sementara tab "Tim & akses" hanya ada untuk
   * SUPERVISOR. Akibatnya petugas berperan OPERATOR atau TEKNISI membuka
   * halaman ini dengan `tab === "tim"` yang tidak cocok dengan satu pun tab
   * yang tampil: tidak ada tab yang tersorot, dan panel di bawahnya tetap
   * menggambar daftar tim lengkap dengan nama, surel, dan peran seluruh
   * petugas. Gerbang `supervisor` dipasang pada TOMBOL tab-nya, tidak pada
   * panelnya.
   *
   * Menurunkannya juga menangani pemuatan yang belum selesai: saat `pengguna`
   * masih null, `supervisor` bernilai false dan tab jatuh ke yang pertama
   * tersedia; begitu datanya tiba dan tabnya bertambah, pilihan supervisor
   * kembali sah tanpa perlu effect apa pun.
   */
  const tabAktif = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id ?? "sandi");

  return {
    supervisor,
    tabs,
    tabAktif,
    setTab,
    members,
    golongan,
    security,
    setSecurity,
    notif,
    setNotif,
    save,
    sandiLama,
    setSandiLama,
    sandiBaru,
    setSandiBaru,
    sandiUlang,
    setSandiUlang,
    kirimSandi,
    hasilSandi,
    gantiSandi,
  };
}
