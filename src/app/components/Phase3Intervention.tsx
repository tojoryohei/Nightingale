"use client";

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
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import type { ProcessedData } from "@/types/data";
import { COLORS } from "@/types/data";

interface Phase3Props {
  data: ProcessedData[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}

const NAME_MAP: Record<string, string> = {
  disease: "感染症死",
  wounds: "戦死（負傷）",
  other: "その他",
  army: "兵力",
};

function MainTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "8px 12px", fontSize: "12px", minWidth: "160px" }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#495057" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
          <span style={{ color: p.color }}>{NAME_MAP[p.dataKey] ?? p.dataKey}</span>
          <span>{p.value?.toLocaleString()}人</span>
        </div>
      ))}
    </div>
  );
}

function CompareTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "8px 12px", fontSize: "12px" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{p.value?.toLocaleString()}人</span>
        </div>
      ))}
    </div>
  );
}

function buildSpringCompare(data: ProcessedData[]) {
  return ["4月", "5月", "6月"].map((m) => ({
    month: m,
    "1854年春": data.find((d) => d.label === `1854年${m}`)?.disease ?? 0,
    "1855年春": data.find((d) => d.label === `1855年${m}`)?.disease ?? 0,
  }));
}

export default function Phase3Intervention({ data }: Phase3Props) {
  const maxDeaths = Math.ceil(Math.max(...data.map((d) => d.disease + d.wounds + d.other)) / 500) * 500;
  const maxArmy = Math.ceil(Math.max(...data.map((d) => d.army)) / 10000) * 10000;
  const springCompare = buildSpringCompare(data);
  const INTERVENTION_LABEL = "1855年3月";

  return (
    <div style={{ height: "100%", display: "flex", gap: "24px", padding: "20px", overflow: "auto" }}>
      {/* 左: テキスト */}
      <div style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#212529" }}>
            衛生委員会派遣の効果
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#6c757d", lineHeight: 1.6 }}>
            1855年3月、政府の衛生委員会がスクタリ病院を視察・改善。翌月から感染症死が急減。
          </p>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #dee2e6",
          borderLeft: `4px solid ${COLORS.intervention}`,
          borderRadius: "4px",
          padding: "10px 12px",
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: 600, color: COLORS.intervention, marginBottom: 4 }}>
            衛生委員会派遣（1855年3月）
          </div>
          <p style={{ margin: 0, color: "#6c757d", lineHeight: 1.5 }}>
            上チャートの破線が派遣時点を示す。以降、感染症死が急速に低下。
          </p>
        </div>

        <div style={{
          background: "#fff8e1",
          border: "1px solid #ffe082",
          borderRadius: "4px",
          padding: "10px 12px",
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: 600, color: "#f57c00", marginBottom: 4 }}>
            「季節要因」への反論
          </div>
          <p style={{ margin: 0, color: "#6c757d", lineHeight: 1.5 }}>
            下の比較グラフ: 同じ春（4〜6月）でも1854年と1855年で死者数に大差がある。
            <strong>気候ではなく衛生改善が原因</strong>。
          </p>
        </div>
      </div>

      {/* 右: チャート2段 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* メインチャート */}
        <div style={{ flex: 1, background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", minHeight: "220px" }}>
          <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: "6px", fontWeight: 600 }}>
            死者数の時系列推移（衛生委員会派遣マーカー付き）
          </div>
          <div style={{ fontSize: "10px", color: "#adb5bd", marginBottom: "8px" }}>
            ※ 左Y軸: 死者数 / 右Y軸: 兵力
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={data} margin={{ top: 5, right: 55, bottom: 28, left: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6c757d", fontSize: 9 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} interval={2} angle={-35} textAnchor="end" height={45} />
              <YAxis yAxisId="deaths" orientation="left" domain={[0, maxDeaths]} tick={{ fill: COLORS.disease, fontSize: 9 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis yAxisId="army" orientation="right" domain={[0, maxArmy]} tick={{ fill: COLORS.army, fontSize: 9 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<MainTooltip />} />
              <Area yAxisId="deaths" type="monotone" dataKey="other" stackId="d" fill={COLORS.other} stroke={COLORS.other} fillOpacity={0.5} strokeWidth={0} />
              <Area yAxisId="deaths" type="monotone" dataKey="wounds" stackId="d" fill={COLORS.wounds} stroke={COLORS.wounds} fillOpacity={0.6} strokeWidth={0} />
              <Area yAxisId="deaths" type="monotone" dataKey="disease" stackId="d" fill={COLORS.disease} stroke={COLORS.disease} fillOpacity={0.75} strokeWidth={1} />
              <Line yAxisId="army" type="monotone" dataKey="army" stroke={COLORS.army} strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
              <ReferenceLine
                yAxisId="deaths"
                x={INTERVENTION_LABEL}
                stroke={COLORS.intervention}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: "衛生委員会派遣", position: "top", fill: COLORS.intervention, fontSize: 10 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 比較棒グラフ */}
        <div style={{ height: "180px", background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#495057", marginBottom: "6px" }}>
            春季（4〜6月）の感染症死比較: 1854年 vs 1855年
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={springCompare} margin={{ top: 5, right: 20, bottom: 5, left: 20 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6c757d", fontSize: 11 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} />
              <YAxis tick={{ fill: "#6c757d", fontSize: 10 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} />
              <Tooltip content={<CompareTooltip />} />
              <Legend iconType="square" iconSize={10} formatter={(v) => <span style={{ color: "#495057", fontSize: "11px" }}>{v}</span>} />
              <Bar dataKey="1854年春" radius={[2, 2, 0, 0]}>
                {springCompare.map((_, i) => <Cell key={i} fill={COLORS.disease} opacity={0.85} />)}
              </Bar>
              <Bar dataKey="1855年春" radius={[2, 2, 0, 0]}>
                {springCompare.map((_, i) => <Cell key={i} fill={COLORS.intervention} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
