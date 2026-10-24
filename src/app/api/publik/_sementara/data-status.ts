/**
 * SUMBER DATA SEMENTARA — HAPUS SETELAH BACKEND SIAP.
 *
 * Riwayat keandalan zona untuk halaman J02 (Status Layanan). Bentuk
 * jawabannya mengikuti kontrak di `src/app/(publik)/status/_bagian/tipe.ts`.
 * Cara mematikannya sama seperti `data.ts`: arahkan `NEXT_PUBLIC_API_URL` ke
 * backend sungguhan, lalu hapus seluruh folder `src/app/api/publik`.
 *
 * ── Satu aturan yang menentukan seluruh berkas ini ──────────────────────
 *
 * Yang ditulis tangan HANYA daftar kejadian (`BENIH`). Keandalan, jumlah
 * gangguan, total jam, dan strip harian semuanya DITURUNKAN darinya.
 *
 * Arahnya sengaja begitu. Kalau keandalan ditulis sebagai konstanta, cepat
 * atau lambat akan ada zona bertuliskan "normal 100%" yang riwayatnya penuh
 * gangguan — dan itu justru hal pertama yang dicocokkan pembaca pada halaman
 * yang seluruh gunanya adalah membandingkan janji dengan kenyataan. Dengan
 * diturunkan, keduanya tidak bisa berselisih sekalipun angkanya diubah.
 *
 * Kejadian yang masih berlangsung (`durasiJam: null`) juga SENGAJA dicocokkan
 * dengan `ZONA` di `data.ts`: Bandung Timur terganggu 5 jam dan Cimahi dalam
 * perbaikan 22 jam. Dua endpoint yang menceritakan gangguan berbeda untuk
 * zona yang sama akan langsung terbaca sebagai karangan.
 *
 * Angkanya dipilih supaya masuk akal untuk PDAM di Indonesia: keandalan
 * 94–99% sebulan, bukan 99,99% ala pusat data. Jaringan distribusi air
 * memang berhenti beberapa kali sebulan.
 */

import { ZONA } from "./data";
import type {
  AmbangMutu,
  HariStatus,
  Insiden,
  JenisInsiden,
  KeandalanZona,
  Kontak,
  Pemeliharaan,
  RiwayatZona,
  TitikAir,
} from "@/app/(publik)/status/_bagian/tipe";
import type { StatusZona } from "@/types/publik";

const JAM = 3600_000;
const HARI = 86400_000;

/** Panjang jendela pemantauan. Dipakai untuk strip harian DAN untuk keandalan. */
const HARI_PANTAU = 30;
const JAM_PANTAU = HARI_PANTAU * 24;

/**
 * Ambang mutu air minum — Permenkes No. 2 Tahun 2023, Lampiran parameter
 * wajib. Sisa klor bebas 0,2–0,5 mg/L, kekeruhan maksimum 3 NTU, pH 6,5–8,5.
 */
const AMBANG: AmbangMutu = {
  klor: [0.2, 0.5],
  kekeruhanMaks: 3,
  ph: [6.5, 8.5],
  acuan: "Permenkes No. 2 Tahun 2023",
};

interface Benih {
  zonaId: string;
  jenis: JenisInsiden;
  /** Berapa jam sebelum "sekarang" kejadian ini dimulai. */
  mulaiJamLalu: number;
  /** Lama kejadian dalam jam. `null` berarti masih berlangsung. */
  durasiJam: number | null;
  sebab: string;
  pelangganTerdampak: number;
}

/**
 * Daftar kejadian 30 hari terakhir.
 *
 * Diurutkan dari yang paling baru. `mulaiJamLalu` terjauh adalah 640 jam
 * (±26,7 hari) — sengaja di dalam jendela, supaya tidak ada kejadian yang
 * separuhnya terpotong di tepi strip dan membuat totalnya tidak cocok.
 */
const BENIH: Benih[] = [
  // ── Bandung Timur — zona tersibuk dan paling sering terganggu ──────
  {
    zonaId: "z1",
    jenis: "gangguan",
    mulaiJamLalu: 5,
    durasiJam: null,
    sebab: "Perbaikan pipa induk di Jl. Soekarno-Hatta.",
    pelangganTerdampak: 312,
  },
  {
    zonaId: "z1",
    jenis: "gangguan",
    mulaiJamLalu: 86,
    durasiJam: 9,
    sebab: "Pipa distribusi Ø200 mm pecah tertimpa alat berat proyek drainase.",
    pelangganTerdampak: 540,
  },
  {
    zonaId: "z1",
    jenis: "perbaikan",
    mulaiJamLalu: 212,
    durasiJam: 6,
    sebab: "Pembersihan reservoir Cibiru, aliran digilir per blok.",
    pelangganTerdampak: 1180,
  },
  {
    zonaId: "z1",
    jenis: "gangguan",
    mulaiJamLalu: 430,
    durasiJam: 14,
    sebab: "Pompa booster Ujungberung berhenti saat pemadaman listrik PLN.",
    pelangganTerdampak: 860,
  },
  {
    zonaId: "z1",
    jenis: "perbaikan",
    mulaiJamLalu: 640,
    durasiJam: 4,
    sebab: "Penggantian katup induk di Jl. A.H. Nasution.",
    pelangganTerdampak: 420,
  },

  // ── Cimahi ─────────────────────────────────────────────────────────
  {
    zonaId: "z3",
    jenis: "perbaikan",
    mulaiJamLalu: 22,
    durasiJam: null,
    sebab: "Penggantian meter induk, aliran bergilir.",
    pelangganTerdampak: 74,
  },
  {
    zonaId: "z3",
    jenis: "gangguan",
    mulaiJamLalu: 150,
    durasiJam: 7,
    sebab: "Kekeruhan air baku Sungai Cimahi naik tajam setelah hujan deras.",
    pelangganTerdampak: 610,
  },
  {
    zonaId: "z3",
    jenis: "perbaikan",
    mulaiJamLalu: 390,
    durasiJam: 5,
    sebab: "Pemeliharaan pompa distribusi Cimahi Tengah.",
    pelangganTerdampak: 380,
  },

  // ── Sumedang ───────────────────────────────────────────────────────
  {
    zonaId: "z4",
    jenis: "gangguan",
    mulaiJamLalu: 96,
    durasiJam: 8,
    sebab: "Pipa transmisi Cimalaka bocor di bahu jalan.",
    pelangganTerdampak: 290,
  },
  {
    zonaId: "z4",
    jenis: "perbaikan",
    mulaiJamLalu: 340,
    durasiJam: 6,
    sebab: "Pembersihan bak pelepas tekan Tanjungsari.",
    pelangganTerdampak: 450,
  },

  // ── Cileunyi — zona paling tenang ──────────────────────────────────
  {
    zonaId: "z2",
    jenis: "gangguan",
    mulaiJamLalu: 268,
    durasiJam: 6,
    sebab: "Kebocoran pipa dinas di Jl. Raya Cileunyi saat pengerjaan trotoar.",
    pelangganTerdampak: 180,
  },
  {
    zonaId: "z2",
    jenis: "perbaikan",
    mulaiJamLalu: 520,
    durasiJam: 3,
    sebab: "Pembilasan jaringan setelah perbaikan pipa dinas.",
    pelangganTerdampak: 180,
  },
];

/** Hasil uji mutu air terakhir per zona, dalam jam sebelum sekarang. */
const MUTU: Record<
  string,
  {
    klorMgL: number;
    kekeruhanNtu: number;
    ph: number;
    diujiJamLalu: number;
    titikUji: string;
  }
> = {
  // Kekeruhan 3,4 NTU — di atas ambang. Konsisten dengan pipa induk yang
  // sedang dibongkar di zona ini: pembongkaran memang mengaduk endapan.
  z1: {
    klorMgL: 0.26,
    kekeruhanNtu: 3.4,
    ph: 7.1,
    diujiJamLalu: 3,
    titikUji: "Kran pelanggan, Jl. Cigagak",
  },
  z2: {
    klorMgL: 0.31,
    kekeruhanNtu: 1.2,
    ph: 7.4,
    diujiJamLalu: 9,
    titikUji: "Kran pelanggan, Jl. Percobaan",
  },
  // Sisa klor 0,19 mg/L — tepat di bawah ambang, sejalan dengan meter induk
  // yang sedang diganti dan aliran yang digilir.
  z3: {
    klorMgL: 0.19,
    kekeruhanNtu: 2.1,
    ph: 7.0,
    diujiJamLalu: 2,
    titikUji: "Kran pelanggan, Jl. Kebon Kopi",
  },
  z4: {
    klorMgL: 0.28,
    kekeruhanNtu: 1.6,
    ph: 7.6,
    diujiJamLalu: 14,
    titikUji: "Kran pelanggan, Jl. Raya Tanjungsari",
  },
};

/** Pemeliharaan yang AKAN datang: hari ke depan, jam mulai, lama, pekerjaan. */
const JADWAL: {
  zonaId: string;
  hariLagi: number;
  jamMulai: number;
  durasiJam: number;
  pekerjaan: string;
  pelangganTerdampak: number;
}[] = [
  {
    zonaId: "z2",
    hariLagi: 2,
    jamMulai: 8,
    durasiJam: 6,
    pekerjaan: "Pembersihan reservoir Cileunyi dan pembilasan jaringan.",
    pelangganTerdampak: 2016,
  },
  {
    zonaId: "z4",
    hariLagi: 5,
    jamMulai: 22,
    durasiJam: 6,
    pekerjaan: "Penggantian pipa transmisi Ø300 mm ruas Cimalaka–Tanjungsari.",
    pelangganTerdampak: 1179,
  },
  {
    zonaId: "z1",
    hariLagi: 9,
    jamMulai: 9,
    durasiJam: 6,
    pekerjaan: "Interkoneksi pipa baru Gedebage, aliran digilir per blok.",
    pelangganTerdampak: 3140,
  },
  {
    zonaId: "z3",
    hariLagi: 16,
    jamMulai: 8,
    durasiJam: 4,
    pekerjaan: "Kalibrasi meter induk Cimahi Utara.",
    pelangganTerdampak: 1884,
  },
];

/**
 * Titik air darurat hanya disiapkan untuk zona yang SEDANG tidak normal.
 *
 * Mencantumkan tangki di zona yang airnya mengalir normal membuat daftarnya
 * panjang tanpa ada yang bisa dilakukan, dan menyembunyikan dua titik yang
 * benar-benar dibutuhkan hari ini.
 */
const TITIK: { zonaId: string; nama: string; alamat: string; kapasitasLiter: number; jamLayanan: string }[] = [
  {
    zonaId: "z1",
    nama: "Tangki air Kantor Kecamatan Ujungberung",
    alamat: "Jl. A.H. Nasution No. 12, Ujungberung",
    kapasitasLiter: 5000,
    jamLayanan: "06.00 – 18.00",
  },
  {
    zonaId: "z1",
    nama: "Mobil tangki keliling Blok Cigagak",
    alamat: "Lapangan RW 07 Cigagak, Jl. Cigagak Raya",
    kapasitasLiter: 4000,
    jamLayanan: "07.00 – 11.00 dan 15.00 – 19.00",
  },
  {
    zonaId: "z3",
    nama: "Tangki air Lapangan RW 04 Cimahi Tengah",
    alamat: "Jl. Rd. Demang Hardjakusumah, Cimahi Tengah",
    kapasitasLiter: 5000,
    jamLayanan: "07.00 – 19.00",
  },
];

/**
 * Nomor layanan. TIRUAN sampai backend mengirim yang sebenarnya — jangan
 * disebarkan sebagai nomor yang benar-benar bisa dihubungi.
 */
const KONTAK: Kontak[] = [
  {
    jenis: "telepon",
    label: "Pengaduan gangguan air",
    nilai: "(022) 7207-5555",
    keterangan: "24 jam, termasuk hari libur",
  },
  {
    jenis: "whatsapp",
    label: "WhatsApp permintaan tangki air",
    nilai: "0811-2200-0119",
    keterangan: "Sebutkan nama zona dan jumlah rumah terdampak",
  },
  {
    jenis: "surel",
    label: "Surel pengaduan tertulis",
    nilai: "pengaduan@jernih.id",
    keterangan: "Dibalas maksimal 2 hari kerja",
  },
];

/* ── Turunan ────────────────────────────────────────────────────────── */

const bulat = (n: number, desimal = 1) => {
  const f = 10 ** desimal;
  return Math.round(n * f) / f;
};

/** Awal hari waktu setempat — batas petak pada strip harian. */
const awalHari = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Status satu hari = kejadian TERPARAH yang menyentuh hari itu.
 *
 * Bukan rata-rata, dan bukan kejadian terlama. Satu petak hanya punya satu
 * warna, dan hari yang airnya mati tiga jam tetap hari yang airnya mati —
 * meringkasnya jadi "sebagian besar normal" menghapus persis hal yang dicari
 * orang di strip ini.
 */
function statusHari(
  mulaiHari: number,
  akhirHari: number,
  insiden: { jenis: JenisInsiden; mulaiMs: number; selesaiMs: number }[],
): StatusZona {
  let hasil: StatusZona = "normal";
  for (const i of insiden) {
    if (i.mulaiMs >= akhirHari || i.selesaiMs <= mulaiHari) continue;
    if (i.jenis === "gangguan") return "gangguan";
    hasil = "perbaikan";
  }
  return hasil;
}

export function riwayatZona(): RiwayatZona {
  const sekarang = new Date();
  const kini = sekarang.getTime();
  const awalJendela = kini - JAM_PANTAU * JAM;

  const namaZona = new Map(ZONA.map((z) => [z.id, z.nama]));

  /* Kejadian: bentuk jadi tanggal sungguhan, lalu urutkan terbaru lebih dulu. */
  const terhitung = BENIH.map((b, i) => {
    const mulaiMs = kini - b.mulaiJamLalu * JAM;
    const durasiJam = b.durasiJam ?? b.mulaiJamLalu;
    const selesaiMs = mulaiMs + durasiJam * JAM;
    return { benih: b, indeks: i, mulaiMs, selesaiMs, durasiJam };
  }).sort((a, b) => b.mulaiMs - a.mulaiMs);

  const insiden: Insiden[] = terhitung.map((t) => ({
    id: `INS-${String(t.indeks + 1).padStart(3, "0")}`,
    zonaId: t.benih.zonaId,
    zonaNama: namaZona.get(t.benih.zonaId) ?? t.benih.zonaId,
    jenis: t.benih.jenis,
    mulai: new Date(t.mulaiMs).toISOString(),
    selesai: t.benih.durasiJam === null ? null : new Date(t.selesaiMs).toISOString(),
    durasiJam: bulat(t.durasiJam),
    sebab: t.benih.sebab,
    pelangganTerdampak: t.benih.pelangganTerdampak,
  }));

  /* Strip harian + keandalan, keduanya dari daftar yang sama. */
  const akhirStrip = awalHari(kini) + HARI;
  const zona: KeandalanZona[] = ZONA.map((z) => {
    const milik = terhitung.filter((t) => t.benih.zonaId === z.id);

    const harian: HariStatus[] = Array.from({ length: HARI_PANTAU }, (_, i) => {
      const mulaiHari = akhirStrip - (HARI_PANTAU - i) * HARI;
      return {
        tanggal: new Date(mulaiHari).toISOString(),
        status: statusHari(
          mulaiHari,
          Math.min(mulaiHari + HARI, kini),
          milik.map((t) => ({
            jenis: t.benih.jenis,
            mulaiMs: t.mulaiMs,
            selesaiMs: t.selesaiMs,
          })),
        ),
      };
    });

    /* Jam terganggu dipotong ke jendela 30 hari, bukan dijumlah mentah —
       kejadian yang sebagian berada di luar periode tidak boleh ikut penuh. */
    const totalJam = milik.reduce((a, t) => {
      const mulai = Math.max(t.mulaiMs, awalJendela);
      const selesai = Math.min(t.selesaiMs, kini);
      return a + Math.max(0, selesai - mulai) / JAM;
    }, 0);

    const mutu = MUTU[z.id];
    return {
      id: z.id,
      nama: z.nama,
      keandalanPct: bulat(((JAM_PANTAU - totalJam) / JAM_PANTAU) * 100),
      jumlahGangguan: milik.length,
      totalJamTerganggu: bulat(totalJam),
      harian,
      kualitas: mutu
        ? {
            klorMgL: mutu.klorMgL,
            kekeruhanNtu: mutu.kekeruhanNtu,
            ph: mutu.ph,
            diujiPada: new Date(kini - mutu.diujiJamLalu * JAM).toISOString(),
            titikUji: mutu.titikUji,
          }
        : { klorMgL: null, kekeruhanNtu: null, ph: null, diujiPada: null, titikUji: null },
    };
  });

  const sahPct = zona
    .map((z) => z.keandalanPct)
    .filter((p): p is number => p !== null);

  const pemeliharaan: Pemeliharaan[] = JADWAL.map((j, i) => {
    const d = new Date(kini + j.hariLagi * HARI);
    d.setHours(j.jamMulai, 0, 0, 0);
    return {
      id: `PML-${String(i + 1).padStart(3, "0")}`,
      zonaId: j.zonaId,
      zonaNama: namaZona.get(j.zonaId) ?? j.zonaId,
      mulai: d.toISOString(),
      selesai: new Date(d.getTime() + j.durasiJam * JAM).toISOString(),
      durasiJam: j.durasiJam,
      pekerjaan: j.pekerjaan,
      pelangganTerdampak: j.pelangganTerdampak,
    };
  }).sort((a, b) => a.mulai.localeCompare(b.mulai));

  const terganggu = new Set(
    ZONA.filter((z) => z.status !== "normal").map((z) => z.id),
  );
  const titikAir: TitikAir[] = TITIK.filter((t) => terganggu.has(t.zonaId)).map(
    (t, i) => ({
      id: `TTK-${String(i + 1).padStart(3, "0")}`,
      zonaId: t.zonaId,
      zonaNama: namaZona.get(t.zonaId) ?? t.zonaId,
      nama: t.nama,
      alamat: t.alamat,
      kapasitasLiter: t.kapasitasLiter,
      jamLayanan: t.jamLayanan,
    }),
  );

  return {
    periode: {
      mulai: new Date(awalJendela).toISOString(),
      selesai: sekarang.toISOString(),
      hari: HARI_PANTAU,
    },
    ambang: AMBANG,
    keandalanJaringanPct:
      sahPct.length > 0
        ? bulat(sahPct.reduce((a, b) => a + b, 0) / sahPct.length)
        : null,
    zona,
    insiden,
    pemeliharaan,
    titikAir,
    kontak: KONTAK,
    ts: sekarang.toISOString(),
  };
}
