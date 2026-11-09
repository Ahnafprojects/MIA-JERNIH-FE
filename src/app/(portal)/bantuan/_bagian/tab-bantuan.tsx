import type { TabAktif } from "../_tipe";

export function TabBantuan({
  tabAktif,
  setTabAktif,
  jumlahTiket,
}: {
  tabAktif: TabAktif;
  setTabAktif: (t: TabAktif) => void;
  jumlahTiket: number;
}) {
  return (
    <div className="flex rounded-[3px] border border-line bg-soft p-1">
      <button
        type="button"
        onClick={() => setTabAktif("lapor")}
        className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
          tabAktif === "lapor" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        Lapor Gangguan
      </button>
      <button
        type="button"
        onClick={() => setTabAktif("tiket")}
        className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
          tabAktif === "tiket" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        Tiket Saya ({jumlahTiket})
      </button>
      <button
        type="button"
        onClick={() => setTabAktif("faq")}
        className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
          tabAktif === "faq" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        Bantuan & FAQ
      </button>
    </div>
  );
}
