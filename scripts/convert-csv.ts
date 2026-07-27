import fs from "fs";
import path from "path";
import Papa from "papaparse";

// ---- 型定義 ----
interface RawData {
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

export interface ProcessedData {
  date: string;
  label: string;
  army: number;
  disease: number;
  wounds: number;
  other: number;
  diseaseRate: number;
  woundsRate: number;
  otherRate: number;
  totalDeaths: number;
  isAfterIntervention: boolean;
  /** 改善点2: ビルド時に静的計算済みの「介入なし仮想感染症死者数」
   * 介入前(~1855-03)の月は null、介入後(1855-04~)の月のみ数値 */
  virtualDiseaseWithoutIntervention: number | null;
}

// ---- パス ----
const CSV_PATH = path.resolve(__dirname, "../../raw.csv");
const OUT_PATH = path.resolve(__dirname, "../public/data/nightingale.json");

// ---- メイン ----
const csvText = fs.readFileSync(CSV_PATH, "utf-8");
const parsed = Papa.parse<RawData>(csvText, { header: true, skipEmptyLines: true });
const rows = parsed.data;

// 月ラベルマップ（英語→日本語）
const monthJP: Record<string, string> = {
  Jan: "1月", Feb: "2月", Mar: "3月", Apr: "4月",
  May: "5月", Jun: "6月", Jul: "7月", Aug: "8月",
  Sep: "9月", Oct: "10月", Nov: "11月", Dec: "12月",
};

// 全期間のうち Disease.rate の最大値（ピーク）を取得
// 1855年1月 = 1022.8 /1000/年 が最大
const peakDiseaseRate = Math.max(...rows.map((r) => parseFloat(r["Disease.rate"])));
console.log(`Peak Disease.rate: ${peakDiseaseRate} /1000/year (used for virtual counterfactual)`);

// 「衛生委員会派遣」は1855年3月に行われたため、
// 効果が現れるのは1855年4月以降と判断
const INTERVENTION_DATE = new Date("1855-04-01");

const processed: ProcessedData[] = rows.map((r) => {
  const date = new Date(r.Date);
  const army = parseInt(r.Army, 10);
  const disease = parseInt(r.Disease, 10);
  const wounds = parseInt(r.Wounds, 10);
  const other = parseInt(r.Other, 10);
  const diseaseRate = parseFloat(r["Disease.rate"]);
  const woundsRate = parseFloat(r["Wounds.rate"]);
  const otherRate = parseFloat(r["Other.rate"]);
  const isAfterIntervention = date >= INTERVENTION_DATE;

  // 改善点2: 仮想死者数の計算（介入後の月のみ）
  // = army × peakDiseaseRate (per 1000/year) ÷ 12 (月次換算) ÷ 1000
  const virtualDiseaseWithoutIntervention = isAfterIntervention
    ? Math.round((army * peakDiseaseRate) / 12000)
    : null;

  return {
    date: r.Date,
    label: `${r.Year}年${monthJP[r.Month]}`,
    army,
    disease,
    wounds,
    other,
    diseaseRate,
    woundsRate,
    otherRate,
    totalDeaths: disease + wounds + other,
    isAfterIntervention,
    virtualDiseaseWithoutIntervention,
  };
});

// ---- 統計サマリー（デバッグ用） ----
const totalDisease = processed.reduce((s, d) => s + d.disease, 0);
const totalWounds = processed.reduce((s, d) => s + d.wounds, 0);
const totalOther = processed.reduce((s, d) => s + d.other, 0);
const virtualTotal = processed
  .filter((d) => d.virtualDiseaseWithoutIntervention !== null)
  .reduce((s, d) => s + (d.virtualDiseaseWithoutIntervention ?? 0), 0);
const actualAfter = processed
  .filter((d) => d.isAfterIntervention)
  .reduce((s, d) => s + d.disease, 0);

console.log(`Total Disease deaths: ${totalDisease}`);
console.log(`Total Wounds deaths:  ${totalWounds}`);
console.log(`Total Other deaths:   ${totalOther}`);
console.log(`Virtual disease (post-intervention): ${virtualTotal}`);
console.log(`Actual disease (post-intervention):  ${actualAfter}`);
console.log(`Lives saved by intervention: ${virtualTotal - actualAfter}`);

// ---- 書き出し ----
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(processed, null, 2), "utf-8");
console.log(`✓ Written to ${OUT_PATH}`);
