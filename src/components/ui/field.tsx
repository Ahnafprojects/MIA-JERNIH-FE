"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function TextField({
  label,
  hint,
  galat,
  kananLabel,
  depan,
  belakang,
  className,
  ...sisa
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  galat?: string | null;
  kananLabel?: React.ReactNode;
  depan?: React.ReactNode;
  belakang?: React.ReactNode;
}) {
  const id = useId();
  const idPesan = `${id}-pesan`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        {kananLabel}
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-input border bg-surface px-3",
          "focus-within:ring-2 focus-within:ring-brand-500/30",
          galat ? "border-danger" : "border-line-strong",
        )}
      >
        {depan ? <span className="text-muted">{depan}</span> : null}
        <input
          id={id}
          // Hubungkan pesan galat ke input supaya pembaca layar ikut
          // membacakannya; tanpa ini pengguna buta hanya tahu "ada yang merah".
          aria-invalid={galat ? true : undefined}
          aria-describedby={galat || hint ? idPesan : undefined}
          className={cn(
            "h-11 w-full bg-transparent text-[15px] outline-none",
            "placeholder:text-muted/70",
          )}
          {...sisa}
        />
        {belakang}
      </div>
      {galat || hint ? (
        <p
          id={idPesan}
          className={cn(
            "mt-1.5 text-[12.5px]",
            galat ? "text-danger" : "text-muted",
          )}
        >
          {galat || hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  className,
  children,
  ...sisa
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const id = useId();
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-input border border-line-strong bg-surface px-3",
          "text-[15px] outline-none focus:ring-2 focus:ring-brand-500/30",
        )}
        {...sisa}
      >
        {children}
      </select>
    </div>
  );
}

export function Switch({
  aktif,
  onChange,
  label,
}: {
  aktif: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aktif}
      onClick={() => onChange(!aktif)}
      className="inline-flex items-center gap-2.5 text-left text-sm"
    >
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          aktif ? "bg-brand-600" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-[left]",
            aktif ? "left-[1.125rem]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
