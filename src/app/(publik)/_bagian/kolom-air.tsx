"use client";

import { useEffect, useRef, useState } from "react";
import { angka } from "@/lib/format";

const MAKS_L = 6000;
const AWAL_L = 4820.5;
const TAU = Math.PI * 2;
const JUMLAH_GELEMBUNG = 16;

type Rgb = [number, number, number];

/**
 * Warna diambil dari token CSS, tidak pernah ditulis sebagai hex di sini.
 *
 * Kalau hex ditulis di komponen, tema gelap tidak ikut berubah — dan di
 * canvas kesalahan itu tidak kelihatan sampai seseorang menyalakan tema
 * kedua. Dibaca sekali tiap pergantian tema, bukan tiap bingkai, karena
 * `getComputedStyle` memaksa kalkulasi ulang gaya.
 */
interface Palet {
  /** Tiga henti gradien badan air, dari permukaan ke dasar. */
  air: [Rgb, Rgb, Rgb];
  /** Muka air yang terkena cahaya — lebih terang dari badannya. */
  muka: Rgb;
  /** Cahaya: caustics, kilau spekular, dinding gelembung. */
  kilau: Rgb;
  /** Kaca kosong di atas permukaan. */
  kaca: Rgb;
  garis: Rgb;
  garisKuat: Rgb;
  /** Bayangan. Sengaja tinta pekat yang sama di kedua tema. */
  bayang: Rgb;
}

function keRgb(nilai: string): Rgb {
  const s = nilai.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    const bagian =
      h.length === 3
        ? [h[0] + h[0], h[1] + h[1], h[2] + h[2]]
        : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)];
    const n = bagian.map((x) => parseInt(x, 16));
    if (n.every((x) => Number.isFinite(x))) return [n[0], n[1], n[2]];
  }
  // `oklch()`/`rgb()` bila suatu saat token ditulis dalam ruang warna lain.
  const m = s.match(/(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return [0, 0, 0];
}

const warna = (c: Rgb, alfa: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${alfa})`;

/**
 * Tangga `brand` di tema gelap sengaja TERBALIK: angka besar justru lebih
 * terang. Memakai urutan yang sama di kedua tema membuat air di malam hari
 * makin terang ke bawah — kebalikan dari kedalaman. Jadi hentinya dipilih
 * per tema, bukan dibalik secara otomatis.
 */
function bacaPalet(): Palet {
  const gaya = getComputedStyle(document.documentElement);
  const t = (nama: string) => keRgb(gaya.getPropertyValue(nama));
  const gelap = document.documentElement.classList.contains("dark");

  return {
    air: gelap
      ? [t("--color-brand-500"), t("--color-brand-300"), t("--color-brand-200")]
      : [t("--color-brand-400"), t("--color-brand-500"), t("--color-brand-700")],
    muka: gelap ? t("--color-brand-600") : t("--color-brand-300"),
    kilau: gelap ? t("--color-brand-700") : t("--color-brand-100"),
    kaca: t("--color-surface"),
    garis: t("--color-line"),
    garisKuat: t("--color-line-strong"),
    bayang: t("--color-brand-900"),
  };
}

interface Gelembung {
  /** 0..1 melintang tabung. */
  x: number;
  /** Piksel dari dasar air ke atas. */
  y: number;
  r: number;
  laju: number;
  fase: number;
}

function gelembungBaru(tinggi: number, dariBawah: boolean): Gelembung {
  return {
    x: Math.random(),
    y: dariBawah ? Math.random() * 6 : Math.random() * tinggi,
    r: 0.9 + Math.random() * 2.1,
    laju: 10 + Math.random() * 26,
    fase: Math.random() * TAU,
  };
}

/**
 * Kolom air — tabung ukur silinder yang terisi setinggi saldo meter.
 *
 * Ini thesis halaman, bukan hiasan. Produk ini menjual satu hal: warga bisa
 * MELIHAT sisa airnya, bukan menunggu tagihan. Kolom ini memperlihatkan
 * persis itu — angka yang sama dengan yang dilihat petugas, bergerak turun
 * di depan mata.
 *
 * Digambar di `<canvas>`, bukan div. Yang membuatnya terbaca sebagai SILINDER
 * dan bukan kotak ada empat: gradien MENDATAR melintang tabung (gelap di dua
 * tepi, terang di tengah), permukaan dan dasar air berupa ELIPS karena kita
 * memandangnya sedikit dari atas, bayangan dalam di kedua tepi, dan kilau
 * spekular yang berdiri di satu sisi saja. Permukaannya jumlah tiga sinus
 * dengan frekuensi berbeda, jadi riaknya tidak pernah berulang terlihat.
 *
 * Canvas-nya `aria-hidden`: ia gambar. Angkanya elemen HTML di atasnya supaya
 * tetap terbaca pembaca layar dan bisa disalin.
 */
export function KolomAir() {
  const [saldoL, setSaldoL] = useState(AWAL_L);
  const [debit, setDebit] = useState(2.4);

  const kanvasRef = useRef<HTMLCanvasElement>(null);
  const saldoRef = useRef(saldoL);
  const diamRef = useRef(false);
  const gambarRef = useRef<((ms: number) => void) | null>(null);

  // Air berkurang di depan mata — satu detik sekali, sebesar debitnya.
  // Debit disimpan di ref juga supaya intervalnya cukup dipasang SEKALI;
  // versi sebelumnya memasang ulang tiap detik karena debit jadi dependensi.
  const debitRef = useRef(debit);
  useEffect(() => {
    const jam = setInterval(() => {
      const d = Math.min(
        4.2,
        Math.max(0.8, debitRef.current + (Math.random() - 0.5) * 0.6),
      );
      debitRef.current = d;
      setDebit(d);
      setSaldoL((s) => {
        const berikut = s - d / 60;
        return berikut < 120 ? AWAL_L : berikut;
      });
    }, 1000);
    return () => clearInterval(jam);
  }, []);

  // Saldo dipakai canvas lewat ref, bukan dependensi effect: kalau jadi
  // dependensi, seluruh loop rAF dibongkar-pasang tiap detik.
  useEffect(() => {
    saldoRef.current = saldoL;
    // Saat gerak dikurangi tidak ada rAF, jadi bingkai diamnya digambar ulang
    // di sini supaya angkanya tetap cocok dengan tinggi airnya.
    if (diamRef.current) gambarRef.current?.(0);
  }, [saldoL]);

  useEffect(() => {
    const kanvas = kanvasRef.current;
    if (!kanvas) return;
    const ctx = kanvas.getContext("2d");
    if (!ctx) return;

    let palet = bacaPalet();
    let lebar = 0;
    let tinggi = 0;
    let nivo = -1; // -1 = belum pernah digambar; bingkai pertama tanpa lerp.
    let gelembung: Gelembung[] = [];
    let rafId = 0;
    let lalu = 0;

    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)");

    function ukur() {
      const kanvasEl = kanvasRef.current;
      if (!kanvasEl) return;
      const kotak = kanvasEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      lebar = kotak.width;
      tinggi = kotak.height;
      kanvasEl.width = Math.round(lebar * dpr);
      kanvasEl.height = Math.round(tinggi * dpr);
      if (gelembung.length === 0 && tinggi > 0) {
        gelembung = Array.from({ length: JUMLAH_GELEMBUNG }, () =>
          gelembungBaru(tinggi, false),
        );
      }
    }

    function gambar(ms: number) {
      if (!ctx || lebar < 8 || tinggi < 8) return;

      const dt = lalu === 0 ? 0 : Math.min(0.05, (ms - lalu) / 1000);
      lalu = ms;
      const t = ms / 1000;

      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, lebar, tinggi);

      // ── Geometri silinder ────────────────────────────────────────────
      // `ry` adalah kedalaman elips: seberapa dari atas kita memandangnya.
      const cx = lebar / 2;
      const rx = lebar / 2 - 2;
      const ry = Math.min(rx * 0.27, tinggi * 0.08);
      const atas = ry + 2;
      const bawah = tinggi - ry - 3;
      const rentang = bawah - atas;

      // Tinggi air mengejar saldo, tidak melompat. `dt <= 0` berarti bingkai
      // diam (mode kurangi gerak): di situ nilainya dipasang langsung, kalau
      // tidak airnya membeku di tinggi pertama sementara angkanya terus turun.
      const sasaran = Math.max(0, Math.min(1, saldoRef.current / MAKS_L));
      nivo =
        nivo < 0 || dt <= 0
          ? sasaran
          : nivo + (sasaran - nivo) * Math.min(1, dt * 3);
      const permukaan = bawah - nivo * rentang;

      /** Setengah tinggi elips pada absis x — 0 di tepi, penuh di tengah. */
      const dyElips = (x: number) => {
        const u = (x - cx) / rx;
        return ry * Math.sqrt(Math.max(0, 1 - u * u));
      };

      // Tiga sinus berbeda frekuensi dan arah: polanya tidak pernah terlihat
      // berulang, tidak seperti satu gelombang tunggal.
      const a1 = ry * 0.16;
      const a2 = ry * 0.1;
      const a3 = ry * 0.055;
      const riak = (x: number) => {
        const u = (x - cx + rx) / (2 * rx);
        return (
          a1 * Math.sin(u * TAU * 1.5 + t * 1.45) +
          a2 * Math.sin(u * TAU * 2.9 - t * 1.05 + 1.7) +
          a3 * Math.sin(u * TAU * 4.6 + t * 2.3)
        );
      };

      const RUAS = 40;
      const absis = (i: number) => cx - rx + (2 * rx * i) / RUAS;

      // Silinder utuh: setengah belakang bibir atas, dua sisi, setengah
      // depan dasar. Semua yang digambar di dalam dikurung ke sini.
      const tabung = new Path2D();
      tabung.ellipse(cx, atas, rx, ry, 0, Math.PI, TAU);
      tabung.lineTo(cx + rx, bawah);
      tabung.ellipse(cx, bawah, rx, ry, 0, 0, Math.PI);
      tabung.closePath();

      // Badan air: batas atasnya tepi BELAKANG permukaan (yang terlihat
      // sebagai siluet), dasarnya elips depan.
      const badanAir = new Path2D();
      for (let i = 0; i <= RUAS; i++) {
        const x = absis(i);
        const y = permukaan + riak(x) - dyElips(x);
        if (i === 0) badanAir.moveTo(x, y);
        else badanAir.lineTo(x, y);
      }
      badanAir.lineTo(cx + rx, bawah);
      badanAir.ellipse(cx, bawah, rx, ry, 0, 0, Math.PI);
      badanAir.closePath();

      // Muka air: elips penuh yang ikut bergelombang. Inilah yang membuat
      // permukaannya terbaca sebagai bidang, bukan garis lurus.
      const mukaAir = new Path2D();
      for (let i = 0; i <= RUAS; i++) {
        const x = absis(i);
        const y = permukaan + riak(x) - dyElips(x);
        if (i === 0) mukaAir.moveTo(x, y);
        else mukaAir.lineTo(x, y);
      }
      for (let i = RUAS; i >= 0; i--) {
        const x = absis(i);
        mukaAir.lineTo(x, permukaan + riak(x) + dyElips(x));
      }
      mukaAir.closePath();

      ctx.save();
      ctx.clip(tabung);

      // ── Kaca kosong ──────────────────────────────────────────────────
      const isiKaca = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
      isiKaca.addColorStop(0, warna(palet.garis, 0.55));
      isiKaca.addColorStop(0.35, warna(palet.kaca, 0.95));
      isiKaca.addColorStop(0.7, warna(palet.kaca, 0.9));
      isiKaca.addColorStop(1, warna(palet.garis, 0.6));
      ctx.fillStyle = isiKaca;
      ctx.fill(tabung);

      // Garis takar di dinding dalam — digambar sebagai BUSUR elips, bukan
      // garis lurus, karena busurnya sendiri yang memberi tahu mata bahwa
      // dindingnya melengkung.
      ctx.strokeStyle = warna(palet.garisKuat, 0.4);
      ctx.lineWidth = 1;
      for (let i = 1; i < 10; i++) {
        const y = atas + (rentang * i) / 10;
        const panjang = i % 2 === 0 ? 0.62 : 0.34;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          y,
          rx,
          ry,
          0,
          Math.PI * (1 - panjang / 2),
          Math.PI * (1 + panjang / 2),
        );
        ctx.stroke();
      }

      // ── Badan air ────────────────────────────────────────────────────
      const dalam = ctx.createLinearGradient(0, permukaan - ry, 0, bawah + ry);
      dalam.addColorStop(0, warna(palet.air[0], 0.96));
      dalam.addColorStop(0.45, warna(palet.air[1], 0.97));
      dalam.addColorStop(1, warna(palet.air[2], 1));
      ctx.fillStyle = dalam;
      ctx.fill(badanAir);

      ctx.save();
      ctx.clip(badanAir);

      // Gradien MENDATAR melintang tabung. Satu-satunya hal yang paling
      // menentukan apakah ini terbaca bulat atau kotak.
      const bulat = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
      bulat.addColorStop(0, warna(palet.bayang, 0.46));
      bulat.addColorStop(0.1, warna(palet.bayang, 0.2));
      bulat.addColorStop(0.3, warna(palet.kilau, 0.06));
      bulat.addColorStop(0.46, warna(palet.kilau, 0.14));
      bulat.addColorStop(0.62, warna(palet.kilau, 0.05));
      bulat.addColorStop(0.88, warna(palet.bayang, 0.22));
      bulat.addColorStop(1, warna(palet.bayang, 0.5));
      ctx.fillStyle = bulat;
      ctx.fill(badanAir);

      // ── Caustics ─────────────────────────────────────────────────────
      // Pita cahaya melengkung yang merayap pelan. Bentuknya fungsi sinus,
      // jadi tidak ada satu pun lengkung yang digambar tangan.
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (let p = 0; p < 4; p++) {
        const laju = 11 + p * 5;
        const tinggiAir = Math.max(1, bawah - permukaan);
        const geser = ((t * laju + p * 70) % (tinggiAir + 90)) - 45;
        const yc = permukaan + geser;
        const pudar =
          Math.min(1, Math.max(0, geser / 36)) *
          Math.min(1, Math.max(0, (tinggiAir - geser) / 60));
        if (pudar <= 0.01) continue;

        ctx.lineWidth = 1.6 + (p % 3) * 1.5;
        ctx.strokeStyle = warna(palet.kilau, 0.1 * pudar);
        ctx.beginPath();
        for (let i = 0; i <= RUAS; i++) {
          const x = absis(i);
          const u = (x - cx + rx) / (2 * rx);
          const y =
            yc +
            ry * 0.5 * Math.sin(u * TAU * (1.1 + p * 0.45) + t * 0.8 + p) +
            ry * 0.22 * Math.sin(u * TAU * 2.6 - t * 1.3 + p * 2);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      // ── Gelembung ────────────────────────────────────────────────────
      for (const g of gelembung) {
        if (dt > 0) g.y += g.laju * dt;
        const gx =
          cx - rx * 0.74 + rx * 1.48 * g.x + Math.sin(g.y * 0.05 + g.fase) * rx * 0.09;
        const gy = bawah - g.y;
        const mukaDiSitu = permukaan + riak(gx) + dyElips(gx) * 0.3;
        if (gy < mukaDiSitu - 2) {
          Object.assign(g, gelembungBaru(bawah - permukaan, true));
          continue;
        }
        // Memudar saat mendekati permukaan, dan muncul perlahan dari dasar.
        const alfa =
          Math.min(1, (gy - mukaDiSitu) / 42) * Math.min(1, (bawah - gy) / 14);
        if (alfa <= 0.02) continue;
        ctx.beginPath();
        ctx.arc(gx, gy, g.r, 0, TAU);
        ctx.fillStyle = warna(palet.kilau, 0.2 * alfa);
        ctx.fill();
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = warna(palet.kilau, 0.55 * alfa);
        ctx.stroke();
      }

      // Cahaya menggenang di dasar, bagian paling dalam tetap gelap.
      const dasar = ctx.createRadialGradient(
        cx,
        bawah - ry * 0.2,
        0,
        cx,
        bawah,
        rx * 1.1,
      );
      dasar.addColorStop(0, warna(palet.kilau, 0.14));
      dasar.addColorStop(1, warna(palet.kilau, 0));
      ctx.fillStyle = dasar;
      ctx.fill(badanAir);

      ctx.restore(); // keluar dari kurungan badan air

      // ── Muka air ─────────────────────────────────────────────────────
      const bidang = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
      bidang.addColorStop(0, warna(palet.air[1], 0.95));
      bidang.addColorStop(0.42, warna(palet.muka, 0.98));
      bidang.addColorStop(1, warna(palet.air[1], 0.92));
      ctx.fillStyle = bidang;
      ctx.fill(mukaAir);

      // Tepi depan permukaan: garis tipis paling terang di seluruh gambar —
      // meniskus, tempat air menempel ke kaca.
      ctx.beginPath();
      for (let i = 0; i <= RUAS; i++) {
        const x = absis(i);
        const y = permukaan + riak(x) + dyElips(x);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = warna(palet.kilau, 0.75);
      ctx.stroke();

      // ── Kaca: kilau spekular dan rim light ───────────────────────────
      /*
       * Kilau digambar sebagai gumpalan radial yang diregangkan, bukan
       * persegi atau elips berisi warna rata. Alasannya: tepi yang tajam
       * terbaca sebagai goresan pada kaca, sedangkan pantulan cahaya
       * sungguhan memudar ke segala arah. `scale()` yang tidak seragam
       * mengubah lingkaran lembut itu jadi pita tegak yang tetap lembut.
       */
      const gumpal = (
        x: number,
        y: number,
        lebarGumpal: number,
        tinggiGumpal: number,
        alfa: number,
      ) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(Math.max(0.5, lebarGumpal), Math.max(0.5, tinggiGumpal));
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, warna(palet.kilau, alfa));
        g.addColorStop(0.5, warna(palet.kilau, alfa * 0.5));
        g.addColorStop(1, warna(palet.kilau, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, TAU);
        ctx.fill();
        ctx.restore();
      };

      // Cahaya datang dari kiri atas: kilau utamanya lebar dan agak ke atas,
      // didampingi satu pita tipis lebih dekat ke tepi.
      const pusatKilau = atas + rentang * 0.42;
      gumpal(cx - rx * 0.58, pusatKilau, rx * 0.12, rentang * 0.42, 0.34);
      gumpal(cx - rx * 0.8, pusatKilau, rx * 0.035, rentang * 0.34, 0.45);

      // Rim light: cahaya yang menyelip di belakang tabung dan menyala tipis
      // di tepi kanan. Tepi yang menyala membuat silindernya punya "belakang".
      gumpal(cx + rx * 0.95, atas + rentang * 0.52, rx * 0.04, rentang * 0.4, 0.3);

      // Bayangan dalam di kedua tepi, di atas segalanya: tanpa ini tepi
      // tabung tetap terbaca rata betapapun airnya digarap.
      const tepi = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
      tepi.addColorStop(0, warna(palet.bayang, 0.3));
      tepi.addColorStop(0.11, warna(palet.bayang, 0.08));
      tepi.addColorStop(0.4, warna(palet.bayang, 0));
      tepi.addColorStop(0.66, warna(palet.bayang, 0));
      tepi.addColorStop(0.9, warna(palet.bayang, 0.1));
      tepi.addColorStop(1, warna(palet.bayang, 0.32));
      ctx.fillStyle = tepi;
      ctx.fill(tabung);

      ctx.restore(); // keluar dari kurungan tabung

      // ── Dinding kaca ─────────────────────────────────────────────────
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = warna(palet.garisKuat, 0.9);
      ctx.stroke(tabung);

      // Bibir atas: elips penuh, bukan garis. Separuh belakangnya lebih
      // samar karena terlihat menembus kaca.
      ctx.beginPath();
      ctx.ellipse(cx, atas, rx, ry, 0, Math.PI, TAU);
      ctx.strokeStyle = warna(palet.garisKuat, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, atas, rx, ry, 0, 0, Math.PI);
      ctx.strokeStyle = warna(palet.garisKuat, 0.45);
      ctx.stroke();

      // Dasar tabung lebih tebal — kaca menumpuk di situ.
      ctx.beginPath();
      ctx.ellipse(cx, bawah, rx, ry, 0, 0, Math.PI);
      ctx.lineWidth = 3;
      ctx.strokeStyle = warna(palet.garisKuat, 0.95);
      ctx.stroke();
    }

    gambarRef.current = gambar;

    function putar(ms: number) {
      gambar(ms);
      rafId = requestAnimationFrame(putar);
    }

    function mulai() {
      cancelAnimationFrame(rafId);
      rafId = 0;
      lalu = 0;
      diamRef.current = kurangiGerak.matches;
      if (kurangiGerak.matches) {
        // Satu bingkai diam. Tidak ada rAF sama sekali, bukan rAF yang
        // menggambar hal yang sama berulang kali.
        gambar(0);
      } else {
        rafId = requestAnimationFrame(putar);
      }
    }

    function saatUkuranBerubah() {
      ukur();
      if (diamRef.current) gambar(0);
    }

    ukur();
    mulai();

    const pengamatUkuran = new ResizeObserver(saatUkuranBerubah);
    pengamatUkuran.observe(kanvas);

    // Tema diganti → token berubah → palet dibaca ulang.
    const pengamatTema = new MutationObserver(() => {
      palet = bacaPalet();
      if (diamRef.current) gambar(0);
    });
    pengamatTema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    kurangiGerak.addEventListener("change", mulai);

    return () => {
      cancelAnimationFrame(rafId);
      pengamatUkuran.disconnect();
      pengamatTema.disconnect();
      kurangiGerak.removeEventListener("change", mulai);
      gambarRef.current = null;
    };
  }, []);

  const takar = [6000, 4500, 3000, 1500, 0];

  return (
    <figure className="relative mx-auto flex items-end gap-5">
      {/* Skala liter di sisi kiri tabung — tetap HTML supaya angkanya bisa
          dipilih dan diperbesar bersama teks halaman. */}
      <div className="relative h-[clamp(18rem,42vw,25rem)] w-14 shrink-0">
        {takar.map((t) => (
          <div
            key={t}
            className="absolute right-0 flex w-full items-center justify-end gap-1.5"
            style={{ bottom: `${(t / MAKS_L) * 100}%`, transform: "translateY(50%)" }}
          >
            <span className="tabular font-mono text-[10px] text-muted">
              {angka(t)}
            </span>
            <span aria-hidden className="h-px w-2.5 bg-line-strong" />
          </div>
        ))}
      </div>

      {/* Tabung. */}
      <div className="relative h-[clamp(18rem,42vw,25rem)] w-[clamp(9rem,22vw,12.5rem)]">
        <canvas
          ref={kanvasRef}
          aria-hidden
          className="absolute inset-0 block h-full w-full"
        />

        {/* Angka dibaca MENEMBUS air — persis arti nama produknya. Sengaja
            HTML, bukan digambar di canvas: isi halaman tidak boleh hilang
            bagi pembaca layar hanya karena hiasannya pindah ke canvas. */}
        <figcaption className="absolute inset-x-0 bottom-[13%] px-3 text-center">
          <p
            className="tabular font-mono text-[clamp(1.9rem,6vw,2.6rem)] leading-none font-bold text-white"
            style={{
              textShadow:
                "0 1px 14px color-mix(in srgb, var(--color-brand-900) 60%, transparent)",
            }}
          >
            {angka(saldoL, 1)}
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-widest text-white/85 uppercase">
            liter tersisa
          </p>
        </figcaption>
      </div>

      {/* Debit — ditempel di sisi kanan seperti label alat ukur. */}
      <div className="absolute top-2 -right-1 flex items-center gap-2 rounded-full border border-line bg-surface/90 py-1 pr-3 pl-2 backdrop-blur sm:-right-6">
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-accent"
          style={{ animation: "denyut 1.8s ease-in-out infinite" }}
        />
        <span className="tabular font-mono text-[12px] font-semibold">
          {angka(debit, 1)}
        </span>
        <span className="text-[11px] text-muted">L/mnt</span>
      </div>
    </figure>
  );
}
