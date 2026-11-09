"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface SlideToConfirmProps {
  onKonfirmasi: () => void;
  memuat?: boolean;
  disabled?: boolean;
  teks?: string;
  teksBerhasil?: string;
}

export function SlideToConfirm({
  onKonfirmasi,
  memuat = false,
  disabled = false,
  teks = "Geser untuk konfirmasi",
  teksBerhasil = "Dikonfirmasi",
}: SlideToConfirmProps) {
  const [posisi, setPosisi] = useState(0);
  const [sedangGeser, setSedangGeser] = useState(false);
  const [selesai, setSelesai] = useState(false);
  const wadahRef = useRef<HTMLDivElement>(null);

  const lebarMaksimal = 200; // Jarak geser maksimal

  const handleMulai = () => {
    if (disabled || memuat || selesai) return;
    setSedangGeser(true);
  };

  const handleGerak = (clientX: number) => {
    if (!sedangGeser || !wadahRef.current || selesai) return;
    const rect = wadahRef.current.getBoundingClientRect();
    const geser = Math.max(0, Math.min(clientX - rect.left - 24, lebarMaksimal));
    setPosisi(geser);

    if (geser >= lebarMaksimal - 10) {
      setSedangGeser(false);
      setSelesai(true);
      setPosisi(lebarMaksimal);
      onKonfirmasi();
    }
  };

  const handleSelesai = () => {
    if (!sedangGeser) return;
    setSedangGeser(false);
    if (!selesai) {
      setPosisi(0);
    }
  };

  useEffect(() => {
    const mouseUp = () => handleSelesai();
    const mouseMove = (e: MouseEvent) => handleGerak(e.clientX);
    const touchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleGerak(e.touches[0].clientX);
    };

    if (sedangGeser) {
      window.addEventListener("mousemove", mouseMove);
      window.addEventListener("mouseup", mouseUp);
      window.addEventListener("touchmove", touchMove);
      window.addEventListener("touchend", mouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", mouseUp);
    };
  });

  return (
    <div
      ref={wadahRef}
      className={cn(
        "relative flex h-12 w-full items-center overflow-hidden rounded-full border border-line bg-soft px-1 select-none",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Latar progres terisi */}
      <div
        className="absolute inset-y-0 left-0 bg-brand-500/20 transition-all"
        style={{ width: `${(posisi / lebarMaksimal) * 100}%` }}
      />

      {/* Teks Petunjuk */}
      <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-muted">
        {selesai ? teksBerhasil : teks}
      </div>

      {/* Tombol Penggeser (Handle Slider) */}
      {/*
        Penggesernya `<button>`, bukan `<div>`.

        Sebelumnya ia div dengan `onMouseDown` saja: tidak pernah menerima
        fokus, tidak muncul di urutan Tab, dan tidak punya padanan papan
        ketik sama sekali. Pada kendali yang dipakai untuk MENUTUP KATUP AIR,
        itu berarti sebagian orang tidak punya jalan untuk melakukannya.

        Enter dan spasi mengonfirmasi langsung — menuntut orang "menggeser"
        dengan tombol panah hanya meniru gerakan tetikus tanpa menambah
        keamanan apa pun; yang dicegah pola geser ini adalah klik TIDAK
        SENGAJA, dan menekan Enter pada elemen yang sudah difokus sengaja
        bukan hal yang tidak sengaja.
      */}
      <button
        type="button"
        disabled={disabled || memuat || selesai}
        aria-label={selesai ? teksBerhasil : teks}
        onMouseDown={handleMulai}
        onTouchStart={handleMulai}
        onKeyDown={(e) => {
          if (disabled || memuat || selesai) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPosisi(lebarMaksimal);
            setSelesai(true);
            onKonfirmasi();
          }
        }}
        style={{ transform: `translateX(${posisi}px)` }}
        className={cn(
          "cincin-fokus-gelap relative z-10 grid size-10 cursor-grab place-items-center rounded-[8px] bg-brand-600 text-white shadow-[var(--kilau-tepi),var(--kedalaman-1)] transition-transform active:cursor-grabbing",
          "enabled:hover:bg-brand-700 enabled:hover:shadow-[var(--kedalaman-2)]",
          selesai && "bg-success",
        )}
      >
        {memuat ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : selesai ? (
          <Check size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
      </button>
    </div>
  );
}
