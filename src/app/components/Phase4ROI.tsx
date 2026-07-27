"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import type { ProcessedData } from "@/types/data";
import { COLORS } from "@/types/data";

interface Phase4Props {
  data: ProcessedData[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}

const COST_PER_SOLDIER = 50; // £/人/年（推計値）
const COST_NOTE = `※ 算出根拠について

当時の英国軍事予算の詳細記録は欠損しているため、
以下からの推計値 £${COST_PER_SOLDIER}/人・年 を使用:
  - 1850年代の熟練労働者年収: 約 £25〜35
  - 装備・補給・訓練コスト:   約 £15〜25

（参考文献: Finlaison 1857; Mitchell 1988 "Abstract of British
 Historical Statistics"）

厳密な値は史料に依存するため、この試算はあくまで
オーダーを示す参考値として解釈してください。`;

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const nameMap: Record<string, string> = {
    disease: "実際の感染症死",
    virtualDiseaseWithoutIntervention: "介入なし（仮想）",
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "8px 12px", fontSize: "12px", minWidth: "200px" }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#495057" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
          <span style={{ color: p.color ?? "#495057" }}>{nameMap[p.dataKey] ?? p.dataKey}</span>
          <span>{p.value != null ? `${p.value.toLocaleString()}人` : "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function Phase4ROI({ data }: Phase4Props) {
  const [showNote, setShowNote] = useState(false);

  const postData = data.filter((d) => d.isAfterIntervention);
  const virtualTotal = postData.reduce((s, d) => s + (d.virtualDiseaseWithoutIntervention ?? 0), 0);
  const actualTotal = postData.reduce((s, d) => s + d.disease, 0);
  const livesSaved = virtualTotal - actualTotal;
  const savingsGBP = Math.round((livesSaved * COST_PER_SOLDIER) / 12 * postData.length);
  const savingsRatio = Math.round((livesSaved / virtualTotal) * 100);
  const maxValue = Math.ceil(Math.max(...postData.map((d) => d.virtualDiseaseWithoutIntervention ?? 0)) / 500) * 500;

  const gaugeData = [{ name: "削減率", value: savingsRatio, fill: COLORS.intervention }];

  return (
    <div style={{ height: "100%", display: "flex", gap: "24px", padding: "20px", overflow: "auto" }}>
      {/* 左: テキスト & KPI */}
      <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#212529" }}>
            衛生改善の費用対効果
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#6c757d", lineHeight: 1.6 }}>
            衛生委員会未派遣の場合、ピーク死亡率（1022.8/1000/年）が
            継続したと仮定した試算。
          </p>
        </div>

        {/* KPI: 救済兵力 */}
        <div style={{ background: "#fff", border: "1px solid #dee2e6", borderLeft: `4px solid ${COLORS.intervention}`, borderRadius: "4px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: 4 }}>救済された兵力（推計）</div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: COLORS.intervention }}>
            {livesSaved.toLocaleString()}
            <span style={{ fontSize: "13px", fontWeight: 400, color: "#6c757d", marginLeft: 4 }}>人</span>
          </div>
          <div style={{ fontSize: "11px", color: "#adb5bd", marginTop: 3 }}>
            仮想 {virtualTotal.toLocaleString()} − 実際 {actualTotal.toLocaleString()}
          </div>
        </div>

        {/* KPI: コスト削減 */}
        <div style={{ background: "#fff", border: "1px solid #dee2e6", borderLeft: `4px solid ${COLORS.virtual}`, borderRadius: "4px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: 4 }}>推計コスト削減額</div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#495057" }}>
            £{savingsGBP.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#adb5bd", marginTop: 3 }}>
            £{COST_PER_SOLDIER}/人・年 × {livesSaved.toLocaleString()}人 換算
          </div>

          {/* アコーディオン（改善点4） */}
          <button
            onClick={() => setShowNote(!showNote)}
            style={{
              marginTop: "8px",
              padding: "3px 8px",
              fontSize: "11px",
              border: "1px solid #dee2e6",
              borderRadius: "3px",
              background: "#f8f9fa",
              color: "#6c757d",
              cursor: "pointer",
            }}
          >
            {showNote ? "▲ 算出根拠を閉じる" : "▼ 算出根拠を見る"}
          </button>
          {showNote && (
            <pre style={{
              marginTop: "8px",
              padding: "8px",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "3px",
              fontSize: "10px",
              color: "#6c757d",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            }}>
              {COST_NOTE}
            </pre>
          )}
        </div>

        {/* 政策メッセージ */}
        <div style={{
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "10px 12px",
          fontSize: "12px",
          color: "#495057",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}>
          「衛生管理への予算投入は、新規兵士の徴兵・訓練コストを大幅に削減する
          最も費用対効果の高い軍事投資である」
        </div>
      </div>

      {/* 右: チャート */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* 仮想 vs 実際ラインチャート */}
        <div style={{ flex: 1, background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", minHeight: "220px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
            感染症死: 実績 vs 「介入なし」仮想シナリオ（1855年4月以降）
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: "8px", fontSize: "11px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 20, height: 2, background: COLORS.virtual, borderTop: "2px dashed" }} />
              <span style={{ color: "#6c757d" }}>介入なし（仮想）</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 14, height: 10, background: COLORS.disease, opacity: 0.7, borderRadius: 1 }} />
              <span style={{ color: "#6c757d" }}>実際の感染症死</span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={postData} margin={{ top: 5, right: 20, bottom: 28, left: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6c757d", fontSize: 10 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} angle={-35} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#6c757d", fontSize: 10 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} domain={[0, maxValue]} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="virtualDiseaseWithoutIntervention" fill={COLORS.virtual} fillOpacity={0.08} stroke={COLORS.virtual} strokeWidth={1.5} strokeDasharray="7 4" dot={false} />
              <Area type="monotone" dataKey="disease" fill={COLORS.disease} fillOpacity={0.5} stroke={COLORS.disease} strokeWidth={1.5} dot={false} />
              <ReferenceLine x={postData[0]?.label} stroke={COLORS.intervention} strokeWidth={1.5} label={{ value: "衛生改善開始 →", position: "insideTopLeft", fill: COLORS.intervention, fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RadialBar ゲージ */}
        <div style={{ height: "180px", background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: 160, height: 140, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="55%" outerRadius="90%" data={gaugeData} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={4}
                  background={{ fill: "#f1f3f5" }}
                  label={{
                    position: "center",
                    fill: COLORS.intervention,
                    fontSize: 24,
                    fontWeight: 700,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter: ((v: any) => v != null ? `${v}%` : "") as any,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: 6 }}>
              衛生改善による感染症死の削減率
              <br />（介入後期間: 1855年4月〜1856年3月）
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: COLORS.intervention, lineHeight: 1 }}>
              {savingsRatio}%
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#6c757d", marginLeft: 6 }}>削減</span>
            </div>
            <div style={{ fontSize: "11px", color: "#adb5bd", marginTop: 6, lineHeight: 1.5 }}>
              仮想死者 {virtualTotal.toLocaleString()}人 に対し
              <br />実際 {actualTotal.toLocaleString()}人 に留まった
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
