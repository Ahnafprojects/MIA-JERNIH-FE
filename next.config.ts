import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Jangan hasilkan AGENTS.md.
   *
   * Next.js 16 menuliskannya otomatis di akar proyek setiap kali `next dev`
   * berjalan. Berkas itu tidak boleh ikut masuk repositori: ia menandai
   * repo ini sebagai hasil kerja AI.
   *
   * Mengabaikannya lewat .git/info/exclude TIDAK cukup — berkas itu hanya ada
   * di mesin yang memasangnya dan tidak pernah ikut di-clone, jadi klon rekan
   * tim tetap akan menyertakannya tanpa sadar. Satu-satunya cara yang berlaku
   * untuk semua orang adalah mematikannya di sini.
   */
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
