"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { StepperAuth } from "@/components/auth/stepper";
import { useHubungkanMeter } from "./_hooks/use-hubungkan-meter";
import { IsiHubungkanMeter } from "./_bagian/isi-hubungkan-meter";

export default function HalamanHubungkanMeter() {
  const hubungkan = useHubungkanMeter();

  return (
    <AuthShell
      judul="Hubungkan Meter Fisik"
      keterangan="Langkah terakhir pendaftaran: sambungkan akun dengan meter air prabayar di rumah Anda."
    >
      <StepperAuth langkahAktif={3} />
      <IsiHubungkanMeter hubungkan={hubungkan} />
    </AuthShell>
  );
}
