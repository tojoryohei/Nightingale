"use client";

import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProcessedData } from "@/types/data";
import { COLORS } from "@/types/data";

interface Phase1HeroProps {
  data: ProcessedData[];
}

function useCountUp(target: number, duration = 1500, active = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
      <div>死者数: {item.value.toLocaleString()}人</div>
    </div>
  );
}

export default function Phase1Hero({ data }: Phase1HeroProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  const totalDisease = data.reduce((s, d) => s + d.disease, 0);
  const totalWounds = data.reduce((s, d) => s + d.wounds, 0);
  const totalOther = data.reduce((s, d) => s + d.other, 0);
  const total = totalDisease + totalWounds + totalOther;

  const diseaseCount = useCountUp(totalDisease, 1500, animated);
  const woundsCount = useCountUp(totalWounds, 1500, animated);
  const otherCount = useCountUp(totalOther, 1500, animated);

  const ratio = (totalDisease / totalWounds).toFixed(1);

  const pieData = [
    { name: "感染症死", value: totalDisease, color: COLORS.disease },
    { name: "戦死（負傷）", value: totalWounds, color: COLORS.wounds },
    { name: "その他", value: totalOther, color: COLORS.other },
  ];

  const card = (label: string, count: number, color: string, unit = "人") => (
    <div style={{
      background: "#fff",
      border: "1px solid #dee2e6",
      borderLeft: `4px solid ${color}`,
      borderRadius: "4px",
      padding: "12px 16px",
    }}>
      <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#212529", fontVariantNumeric: "tabular-nums" }}>
        {count.toLocaleString()}
        <span style={{ fontSize: "13px", fontWeight: 400, color: "#6c757d", marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", gap: "32px", padding: "24px", overflow: "auto" }}>
      {/* 左: 統計 */}
      <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ marginBottom: "4px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#212529" }}>
            死因別の内訳
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6c757d" }}>
            クリミア戦争 全期間（1854年4月 〜 1856年3月）
          </p>
        </div>

        {card("感染症による死者", diseaseCount, COLORS.disease)}
        {card("戦死（負傷）", woundsCount, COLORS.wounds)}
        {card("その他", otherCount, COLORS.other)}

        {/* 比率 */}
        <div style={{
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "12px 16px",
          fontSize: "13px",
        }}>
          <span style={{ color: "#6c757d" }}>感染症死 ÷ 戦死（負傷）= </span>
          <strong style={{ fontSize: "20px", color: COLORS.disease }}>{ratio} 倍</strong>
        </div>

        {/* 主張 */}
        <div style={{
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "12px 16px",
          fontSize: "12px",
          color: "#495057",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}>
          「我々の最大の敵はロシア軍ではなく、自陣の不衛生である」
        </div>
      </div>

      {/* 右: 円グラフ */}
      <div style={{ flex: 1, background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "8px" }}>
          死因割合（全24ヶ月合計: {total.toLocaleString()}人）
        </div>
        <div style={{ position: "relative", height: "calc(100% - 32px)" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius="35%"
                outerRadius="60%"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={1}
                stroke="#fff"
                animationBegin={300}
                animationDuration={1200}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span style={{ color: "#495057", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
