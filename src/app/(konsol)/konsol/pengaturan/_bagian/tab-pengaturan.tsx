import { cn } from "@/lib/cn";
import type { TabPengaturan } from "../_tipe";

interface Props {
  tabs: TabPengaturan[];
  tabAktif: string;
  onPilih: (id: string) => void;
}

export function TabPengaturanNav({ tabs, tabAktif, onPilih }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onPilih(t.id)}
          aria-current={tabAktif === t.id ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors",
            tabAktif === t.id
              ? "border-brand-600 text-brand-700 dark:text-accent"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
