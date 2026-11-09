export function PenyaringInsiden({
  status,
  setStatus,
}: {
  status: string;
  setStatus: (v: string) => void;
}) {
  return (
    <div className="border-b border-line p-3">
      <select
        className="h-9 w-full rounded-input border border-line bg-canvas px-2 text-xs text-ink outline-none focus:border-brand-600"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Semua status</option>
        <option value="BARU">Baru</option>
        <option value="DITUGASKAN">Ditugaskan</option>
        <option value="SELESAI">Selesai</option>
      </select>
    </div>
  );
}
