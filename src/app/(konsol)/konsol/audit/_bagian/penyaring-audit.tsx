import { TIPE_AUDIT } from "../_tipe";

interface Props {
  tipe: string;
  setTipe: (v: string) => void;
  user: string;
  setUser: (v: string) => void;
}

export function PenyaringAudit({ tipe, setTipe, user, setUser }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="h-9 rounded-input border border-line bg-surface px-2 text-xs text-ink outline-none focus:border-brand-600"
        value={tipe}
        onChange={(e) => setTipe(e.target.value)}
      >
        <option value="">Semua tipe</option>
        {TIPE_AUDIT.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <input
        className="h-9 rounded-input border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand-600"
        placeholder="ID pengguna"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
    </div>
  );
}
