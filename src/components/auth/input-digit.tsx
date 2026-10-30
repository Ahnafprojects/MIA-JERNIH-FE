"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

interface InputDigitProps {
  panjang?: number;
  nilai: string;
  onChange: (nilai: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function InputDigit({
  panjang = 6,
  nilai,
  onChange,
  disabled = false,
  autoFocus = true,
}: InputDigitProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, indeks: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const salinan = nilai.split("");
      salinan[indeks] = "";
      onChange(salinan.join(""));
      return;
    }

    const digit = val.slice(-1);
    const arr = nilai.split("");
    arr[indeks] = digit;
    const hasil = arr.join("").slice(0, panjang);
    onChange(hasil);

    // Otomatis lompat ke kotak berikutnya
    if (indeks < panjang - 1 && inputRefs.current[indeks + 1]) {
      inputRefs.current[indeks + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, indeks: number) => {
    if (e.key === "Backspace" && !nilai[indeks] && indeks > 0) {
      inputRefs.current[indeks - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const dataTempel = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, panjang);
    if (dataTempel) {
      onChange(dataTempel);
      const fokusIndeks = Math.min(dataTempel.length, panjang - 1);
      inputRefs.current[fokusIndeks]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length: panjang }).map((_, i) => {
        const digit = nilai[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              "size-12 rounded-[3px] border border-line bg-surface text-center font-mono text-xl font-bold text-ink transition-colors focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 sm:size-14",
              digit && "border-brand-500/60",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            aria-label={`Digit ke-${i + 1}`}
          />
        );
      })}
    </div>
  );
}
