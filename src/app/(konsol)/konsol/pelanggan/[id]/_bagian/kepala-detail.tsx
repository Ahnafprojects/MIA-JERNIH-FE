import Link from "next/link";
import { KeyRound, Mail, Power, PowerOff, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tanggalJam } from "@/lib/format";
import { STATUS_METER, type DetailPelanggan } from "../../_bagian/tipe";

interface Props {
  data: DetailPelanggan;
  relay: boolean;
  sibuk: boolean;
  onEmail: () => void;
  onTutup: () => void;
  onBuka: () => void;
}

export function KepalaDetail({ data, relay, sibuk, onEmail, onTutup, onBuka }: Props) {
  const s = STATUS_METER[data.status];
  const meterId = data.meterId;

  return (
        <header className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="eyebrow text-brand-600">Pelanggan</p>
            <h1 className="mt-1.5 font-display text-[clamp(1.6rem,4vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
              {data.nama}
            </h1>
            {/*
              ID dan zona di satu baris, waktu telemetri di baris sendiri.
              Versi sebelumnya menyatukan ketiganya dengan pemisah "·", dan di
              390px barisnya patah tepat sesudah pemisah — meninggalkan titik
              menggantung di ujung baris seperti salah ketik.
            */}
            <p className="tabular mt-2 font-mono text-[13px] text-muted">
              <span className="font-semibold text-ink">{data.id}</span>
              <span aria-hidden> · </span>
              <span className="font-sans">{data.zona}</span>
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {data.terakhirLapor
                ? `Telemetri terakhir ${tanggalJam(data.terakhirLapor)}`
                : "Belum ada telemetri dari meter ini"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge nada={s.nada} titik>
                {s.label}
              </Badge>
              <Badge nada={data.online ? "sukses" : "netral"} titik>
                {data.online ? (
                  <>
                    <Wifi size={12} aria-hidden /> Online
                  </>
                ) : (
                  <>
                    <WifiOff size={12} aria-hidden /> Offline
                  </>
                )}
              </Badge>
              <Badge nada={relay ? "sukses" : "bahaya"} titik>
                Relay {relay ? "terbuka" : "tertutup"}
              </Badge>
              {data.adaInsiden ? (
                <Badge nada="bahaya" titik>
                  Insiden terbuka
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Token darurat diterbitkan di halaman Token, dengan meter ini
                sudah terisi. Backend mengembalikan kodenya ke PETUGAS untuk
                diserahkan; tombol lama menjanjikan kode "dikirim ke pelanggan"
                tanpa memanggil server sama sekali. */}
            {meterId ? (
              <Link
                href={`/konsol/token?meter=${encodeURIComponent(meterId)}`}
                className="cincin-fokus inline-flex h-11 items-center gap-2 rounded-input border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-brand-500/60 hover:bg-soft"
              >
                <KeyRound size={15} aria-hidden />
                Buat token
              </Link>
            ) : null}
            <Button varian="sekunder" onClick={() => onEmail()} memuat={sibuk}>
              <Mail size={15} aria-hidden />
              Kirim email
            </Button>
            {!meterId ? null : relay ? (
              <Button varian="bahaya" onClick={() => onTutup()} memuat={sibuk}>
                <PowerOff size={15} aria-hidden />
                Tutup aliran
              </Button>
            ) : (
              <Button onClick={onBuka} memuat={sibuk}>
                <Power size={15} aria-hidden />
                Buka aliran
              </Button>
            )}
          </div>
        </header>
  );
}
