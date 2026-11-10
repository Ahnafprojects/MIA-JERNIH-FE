export interface Seri {
  name: string;
  unit?: string;
  points: number[];
}

export interface Analitik {
  kpi: { key: string; label: string; value: number; unit?: string }[];
  labels: string[];
  series: Seri[];
  zonaList: { id: string; nama: string }[];
}

export const PILIHAN_RENTANG = [7, 30, 90, 365];
