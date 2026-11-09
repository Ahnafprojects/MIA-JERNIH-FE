import { CreditCard, QrCode, Building, Store } from "lucide-react";

const METODE_BAYAR = [
  { id: "QRIS", nama: "QRIS", sub: "GoPay, OVO, Dana, ShopeePay", Ikon: QrCode },
  { id: "VA", nama: "Virtual Account", sub: "BCA, Mandiri, BNI, BRI", Ikon: Building },
  { id: "EWALLET", nama: "E-Wallet Langsung", sub: "AstraPay, LinkAja", Ikon: CreditCard },
  { id: "GERAI", nama: "Gerai Retail", sub: "Indomaret, Alfamart", Ikon: Store },
];

export function PilihanMetode({
  metode,
  setMetode,
}: {
  metode: string;
  setMetode: (m: string) => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <h2 className="mb-3 text-sm font-bold text-ink">Metode Pembayaran</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {METODE_BAYAR.map(({ id, nama, sub, Ikon }) => {
          const terpilih = metode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMetode(id)}
              className={`flex items-start gap-3 rounded-[3px] border p-3 text-left transition-colors ${
                terpilih
                  ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                  : "border-line bg-surface hover:bg-soft"
              }`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[2px] bg-soft text-brand-600 dark:text-accent">
                <Ikon size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-ink">{nama}</p>
                <p className="text-[10px] text-muted">{sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
