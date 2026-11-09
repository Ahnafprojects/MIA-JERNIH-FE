export const HARI_LABEL = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const JAM_LABEL = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export function warnaSelPetaPanas(vol: number | null): string {
  if (vol === null) return "bg-soft/40 border-dashed border-line/50";
  if (vol === 0) return "bg-surface border-line/40";
  if (vol < 5) return "bg-brand-500/15 border-brand-500/20";
  if (vol < 15) return "bg-brand-500/35 border-brand-500/40";
  if (vol < 30) return "bg-brand-500/65 border-brand-500/70 text-white";
  return "bg-brand-600 border-brand-600 text-white font-bold";
}
