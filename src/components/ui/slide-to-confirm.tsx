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
        "relative flex h-12 w-full items-center overflow-hidden rounded-[3px] border border-line bg-soft px-1 select-none",
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
      <div
        onMouseDown={handleMulai}
        onTouchStart={handleMulai}
        style={{ transform: `translateX(${posisi}px)` }}
        className={cn(
          "relative z-10 grid size-10 place-items-center rounded-[2px] bg-brand-600 text-white shadow-sm transition-transform cursor-grab active:cursor-grabbing",
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
      </div>
    </div>
  );
}
