export function StrukMemuat({ invoiceId }: { invoiceId: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-[4px] border border-line bg-surface p-8 shadow-xs">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <h2 className="mt-4 font-display text-base font-bold text-ink">
          Memuat Status Pembayaran
        </h2>
        <p className="mt-1 font-mono text-xs text-muted">
          Memeriksa penerbitan token air untuk invoice #{invoiceId}...
        </p>
      </div>
    </div>
  );
}
