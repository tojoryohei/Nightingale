/** CSVの生データ型 */
export interface RawData {
  rownames: string;
  Date: string;
  Month: string;
  Year: string;
  Army: string;
  Disease: string;
  Wounds: string;
  Other: string;
  "Disease.rate": string;
  "Wounds.rate": string;
  "Other.rate": string;
}

/** 可視化用加工済みデータ型 */
export interface ProcessedData {
  /** ISO日付文字列 "1854-04-01" */
  date: string;
  /** 表示ラベル "1854年4月" */
  label: string;
  army: number;
  disease: number;
  wounds: number;
  other: number;
  diseaseRate: number;
  woundsRate: number;
  otherRate: number;
  totalDeaths: number;
  /** 衛生委員会派遣(1855年3月)効果が現れた1855年4月以降 = true */
  isAfterIntervention: boolean;
  /**
   * 改善点2: 「衛生改善がなければ」の仮想感染症死者数
   * - 介入前の月は null（グラフに描画しない）
   * - 介入後: army × peakDiseaseRate(1022.8) / 12000 で計算
   */
  virtualDiseaseWithoutIntervention: number | null;
}

/** フェーズ番号（0-indexed）*/
export type PhaseNumber = 0 | 1 | 2 | 3;

/** フェーズメタデータ */
export interface PhaseConfig {
  phase: PhaseNumber;
  title: string;
  subtitle: string;
  claim: string;
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 0,
    title: "Phase I",
    subtitle: "衝撃の実態",
    claim: "我々の最大の敵はロシア軍ではなく、自陣の不衛生である",
  },
  {
    phase: 1,
    title: "Phase II",
    subtitle: "死の加速",
    claim: "このままでは軍が壊滅する ― 1854年冬、感染症死が急激に増加した",
  },
  {
    phase: 2,
    title: "Phase III",
    subtitle: "介入の証拠",
    claim: "気候が暖かくなったからではなく、衛生環境を改善したから死者が減った",
  },
  {
    phase: 3,
    title: "Phase IV",
    subtitle: "予算の根拠",
    claim: "衛生管理への投資は、最も費用対効果の高い軍事投資である",
  },
];

/** チャート配色定数 */
export const COLORS = {
  disease: "#7C3AED",    // 深紫 — 腐敗・不衛生
  wounds: "#DC2626",     // 深紅 — 名誉の戦死
  other: "#6B7280",      // ライトグレー — その他
  army: "#1E40AF",       // ネイビー — イギリス軍
  virtual: "#F59E0B",    // アンバー — 仮想（介入なし）
  intervention: "#10B981", // エメラルド — 衛生委員会介入
  background: "#0A0F1E",
  surface: "#111827",
  border: "#1F2937",
  text: "#F9FAFB",
  textMuted: "#9CA3AF",
} as const;
