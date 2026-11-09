"use client";

import { use } from "react";
import { useInvoice } from "./_hooks/use-invoice";
import { StrukMemuat } from "./_bagian/struk-memuat";
import { StrukBerhasil } from "./_bagian/struk-berhasil";
import { StrukMenunggu } from "./_bagian/struk-menunggu";

export default function HalamanBayarInvoice({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const resolvedParams = use(params);
  const invoice = useInvoice(resolvedParams.invoice);

  if (invoice.memuat && !invoice.transaksi) {
    return <StrukMemuat invoiceId={invoice.invoiceId} />;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {invoice.isLunas ? (
        <StrukBerhasil
          invoiceId={invoice.invoiceId}
          transaksi={invoice.transaksi}
          kodeToken={invoice.kodeToken}
          sudahSalin={invoice.sudahSalin}
          onSalinKode={invoice.handleSalinKode}
        />
      ) : (
        <StrukMenunggu invoiceId={invoice.invoiceId} transaksi={invoice.transaksi} />
      )}
    </div>
  );
}
