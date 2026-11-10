import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { TARGET } from "../_tipe";
import type { Zona } from "../_tipe";

interface Props {
  daftarZona: Zona[];
  judul: string;
  setJudul: (v: string) => void;
  pesan: string;
  setPesan: (v: string) => void;
  target: string;
  setTarget: (v: string) => void;
  zona: string;
  setZona: (v: string) => void;
  push: boolean;
  setPush: (v: boolean) => void;
  email: boolean;
  setEmail: (v: boolean) => void;
  telegram: boolean;
  setTelegram: (v: boolean) => void;
  loading: boolean;
  bisaKirim: boolean;
  galat: string | null;
  berhasil: string | null;
  onKirim: () => void;
}

const kelasPilihan =
  "mt-1 h-11 w-full rounded-input border border-line-strong bg-surface px-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600";

export function FormBroadcast(p: Props) {
  return (
    <Panel judul="Tulis Pesan">
      <div className="space-y-4">
        <label className="block text-[13px] font-semibold">
          Penerima
          <select
            className={kelasPilihan}
            value={p.target}
            onChange={(e) => p.setTarget(e.target.value)}
          >
            {Object.entries(TARGET).map(([id, t]) => (
              <option key={id} value={id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] font-normal text-muted">
            {TARGET[p.target]?.arti}
          </span>
        </label>

        {p.target === "ZONA" && (
          <label className="block text-[13px] font-semibold">
            Zona
            <select
              className={kelasPilihan}
              value={p.zona}
              onChange={(e) => p.setZona(e.target.value)}
            >
              <option value="">Pilih zona…</option>
              {p.daftarZona.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nama}
                </option>
              ))}
            </select>
          </label>
        )}

        <TextField
          label="Judul pesan"
          maxLength={120}
          placeholder="Judul pesan"
          value={p.judul}
          onChange={(e) => p.setJudul(e.target.value)}
        />

        <label className="block text-[13px] font-semibold">
          Isi pesan
          <textarea
            className="mt-1 min-h-32 w-full rounded-input border border-line-strong bg-surface p-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600"
            maxLength={500}
            placeholder="Isi pesan"
            value={p.pesan}
            onChange={(e) => p.setPesan(e.target.value)}
          />
        </label>
        <p className="text-right font-mono text-[11px] text-muted">
          {p.pesan.length}/500
        </p>

        <div className="flex gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="cincin-fokus size-4 accent-brand-600"
              checked={p.push}
              onChange={(e) => p.setPush(e.target.checked)}
            />{" "}
            Notifikasi aplikasi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="cincin-fokus size-4 accent-brand-600"
              checked={p.email}
              onChange={(e) => p.setEmail(e.target.checked)}
            />{" "}
            Email
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="cincin-fokus size-4 accent-brand-600"
              checked={p.telegram}
              onChange={(e) => p.setTelegram(e.target.checked)}
            />{" "}
            Telegram
          </label>
        </div>
        {/* WhatsApp sengaja tidak tersedia untuk siaran massal: pengirimnya
            menahan laju 2,5 detik per pesan, dan ratusan pesan beruntun
            dari satu nomor bisnis adalah pola tercepat untuk diblokir.
            Lihat komentar kolom `kanalTelegram` di skema backend. */}
        <p className="text-[11px] text-muted">
          Telegram hanya sampai ke warga yang sudah menautkan akunnya.
          WhatsApp tidak dipakai untuk siaran massal.
        </p>

        <div className="cekung p-4">
          <p className="eyebrow text-muted">Pratinjau</p>
          <p className="mt-2 font-bold text-ink">{p.judul || "Judul broadcast"}</p>
          <p className="mt-1 text-xs text-muted">
            {p.pesan || "Isi pesan akan tampil di sini."}
          </p>
        </div>

        <Button onClick={p.onKirim} disabled={!p.bisaKirim}>
          {p.loading ? "Mengirim..." : "Kirim Broadcast"}
        </Button>

        {p.galat ? (
          <p
            role="alert"
            className="rounded-[10px] border border-danger/40 bg-danger-soft p-2.5 text-xs font-medium text-danger"
          >
            {p.galat}
          </p>
        ) : null}
        {p.berhasil ? (
          <p
            role="status"
            className="rounded-[10px] border border-success/40 bg-success-soft p-2.5 text-xs font-medium text-success"
          >
            {p.berhasil}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
