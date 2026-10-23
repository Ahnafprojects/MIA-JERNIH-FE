import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabung kelas Tailwind; kelas belakangan menang saat bentrok. */
export const cn = (...v: ClassValue[]) => twMerge(clsx(v));
