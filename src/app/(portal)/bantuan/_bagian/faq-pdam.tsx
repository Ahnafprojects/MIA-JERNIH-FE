import { LifeBuoy, Phone } from "lucide-react";

export function FaqPdam() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-[4px] border border-line bg-surface p-5 shadow-xs">
        <h2 className="font-display text-base font-bold text-ink">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-muted">
          <div className="rounded-[3px] border border-line bg-soft p-3">
            <strong className="block text-ink">Bagaimana cara mengisi saldo air setelah membeli token?</strong>
            Masukkan 4–10 digit kode token melalui keypad fisik meter air (tekan * lalu kode lalu A) atau ketik langsung di halaman <strong>Isi Token</strong> portal Jernih.
          </div>
          <div className="rounded-[3px] border border-line bg-soft p-3">
            <strong className="block text-ink">Mengapa air tidak mengalir padahal saldo masih ada?</strong>
            Periksa saklar mekanik fisik pada badan meter JM-200. Katup relay hanya akan terbuka bila saklar fisik berada pada posisi ON.
          </div>
          <div className="rounded-[3px] border border-line bg-soft p-3">
            <strong className="block text-ink">Berapa lama laporan kebocoran pipa ditangani?</strong>
            Sesuai Piagam Kepatuhan SLA Jernih, insiden kebocoran pipa distribusi ditargetkan selesai ditangani maksimal dalam 6 jam.
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[4px] border border-line bg-surface p-5 shadow-xs">
        <h2 className="font-display text-base font-bold text-ink">
          Kontak Darurat PDAM Jernih
        </h2>
        <p className="text-xs text-muted">
          Petugas call center siap membantu penanganan darurat 24 jam.
        </p>

        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-center gap-3 rounded-[3px] border border-line bg-soft p-3">
            <Phone size={18} className="text-brand-600 dark:text-accent" />
            <div>
              <span className="block font-semibold text-ink">Hotline Gangguan 24 Jam</span>
              <span className="font-mono text-xs text-muted">(022) 1500-247</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[3px] border border-line bg-soft p-3">
            <LifeBuoy size={18} className="text-brand-600 dark:text-accent" />
            <div>
              <span className="block font-semibold text-ink">WhatsApp Aduan Teknis</span>
              <span className="font-mono text-xs text-muted">+62 811-234-5678</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
