"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./auth-context";

/**
 * Kabar seketika dari kamar WebSocket `meter:<id>` (BE src/ws.ts).
 *
 * ── Apa yang datang lewat sini ────────────────────────────────────────
 *
 * - `meter:saldo`  token baru ditukarkan, termasuk dari perangkat lain.
 * - `meter:relay`  katup dibuka atau ditutup, termasuk oleh PETUGAS dari
 *                  konsol. Tanpa ini warga baru tahu airnya ditutup pada
 *                  penarikan lima detik berikutnya, atau tidak sama sekali
 *                  kalau halamannya tidak sedang membaca relay.
 * - `meter:status` meter dihubungkan atau dilepas dari akun.
 *
 * ── Kenapa polling `/live` TETAP berjalan ─────────────────────────────
 *
 * Backend tidak punya jalur masuk telemetri; pemeriksaan isi otomatis dan
 * peringatan saldo menipis MENUMPANG pada `GET /api/meter/:id/live`
 * (BE src/rute/meter.ts). Menggantikan polling dengan WebSocket sepenuhnya
 * akan mematikan kedua fitur itu diam-diam. WebSocket di sini menambah
 * kecepatan; polling tetap menjadi sumber kebenaran.
 *
 * ── Token lewat subprotokol, bukan query string ───────────────────────
 *
 * Server menerima `?token=` maupun subprotokol `bearer.<jwt>`. Query string
 * tercatat di log akses proksi (Cloudflare) beserta token aksesnya, jadi
 * yang dipakai subprotokol. Pustaka `ws` di server memilih subprotokol
 * pertama yang diminta, sehingga jabat tangannya tetap sah di peramban.
 */

export type KabarMeter =
  | { event: "meter:saldo"; data: { meterId: string; saldoBaruL: number; tambahL?: number } }
  | { event: "meter:relay"; data: { meterId: string; relay: "AKTIF" | "NONAKTIF" } }
  | { event: "meter:status"; data: Record<string, unknown> };

/** `https://api.x` → `wss://api.x/ws`. `null` bila alamat API belum diatur. */
function alamatWs(): string | null {
  const dasar = process.env.NEXT_PUBLIC_API_URL;
  if (!dasar) return null;
  return `${dasar.replace(/\/+$/, "").replace(/^http/, "ws")}/ws`;
}

const JEDA_AWAL_MS = 2_000;
const JEDA_MAKS_MS = 60_000;

export function useKabarMeter(
  meterId: string | null | undefined,
  saatKabar: (kabar: KabarMeter) => void,
): void {
  const { accessToken } = useAuth();

  /* Penangan disimpan di ref supaya fungsi baru tiap render tidak
     memutus dan menyambung ulang soketnya. */
  const penangan = useRef(saatKabar);
  useEffect(() => {
    penangan.current = saatKabar;
  }, [saatKabar]);

  /* Token terbaru dibaca saat MENYAMBUNG ULANG, bukan dijadikan dependensi.
     Token akses berganti tiap 15 menit; memutus soket yang sehat hanya
     karena token berganti tidak ada gunanya, sebab server memeriksanya
     sekali saat jabat tangan. */
  const tokenRef = useRef(accessToken);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);
  const adaToken = accessToken !== null;

  useEffect(() => {
    const alamat = alamatWs();
    if (!meterId || !alamat || !adaToken || typeof WebSocket === "undefined") {
      return;
    }

    let soket: WebSocket | null = null;
    let penanda: number | null = null;
    let jeda = JEDA_AWAL_MS;
    let berhenti = false;

    const sambung = () => {
      const token = tokenRef.current;
      if (berhenti || !token) return;

      const url = `${alamat}?rooms=${encodeURIComponent(`meter:${meterId}`)}`;
      try {
        soket = new WebSocket(url, [`bearer.${token}`]);
      } catch {
        jadwalUlang();
        return;
      }

      soket.onopen = () => {
        jeda = JEDA_AWAL_MS;
      };
      soket.onmessage = (m) => {
        try {
          const isi = JSON.parse(String(m.data)) as { event?: string; data?: unknown };
          if (
            isi.event === "meter:saldo" ||
            isi.event === "meter:relay" ||
            isi.event === "meter:status"
          ) {
            penangan.current(isi as KabarMeter);
          }
        } catch {
          // Bingkai yang tidak terbaca diabaikan; polling tetap berjalan.
        }
      };
      soket.onclose = () => {
        soket = null;
        jadwalUlang();
      };
    };

    /* Mundur bertahap sampai satu menit. Server yang sedang dideploy
       menolak sambungan beberapa puluh detik; mencecarnya tiap detik tidak
       mempercepat apa pun. */
    const jadwalUlang = () => {
      if (berhenti) return;
      penanda = window.setTimeout(sambung, jeda);
      jeda = Math.min(jeda * 2, JEDA_MAKS_MS);
    };

    sambung();

    return () => {
      berhenti = true;
      if (penanda !== null) window.clearTimeout(penanda);
      if (soket) {
        soket.onclose = null;
        soket.close();
      }
    };
  }, [meterId, adaToken]);
}
