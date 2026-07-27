"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { ProcessedData } from "@/types/data";
import { COLORS } from "@/types/data";

interface Phase2Props {
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

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
      minWidth: "160px",
    }}>
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

export default function Phase2Timeline({ data }: Phase2Props) {
  // 初期状態は空（再生ボタンで初めてアニメーション開始）
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PEAK_INDEX = data.findIndex((d) => d.disease === Math.max(...data.map((x) => x.disease)));

  const play = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHasStarted(true);
    setVisibleCount(1);
    setIsPlaying(true);
    let i = 1;
    intervalRef.current = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= data.length) {
        clearInterval(intervalRef.current!);
        setIsPlaying(false);
      }
    }, 180);
  }, [data]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const visibleData = data.slice(0, visibleCount);
  // ピークマーカー: アニメーションがそのインデックスに達したときだけ表示
  const isPeakVisible = visibleCount > PEAK_INDEX;
  const maxDeaths = Math.ceil(Math.max(...data.map((d) => d.disease + d.wounds + d.other)) / 500) * 500;
  const maxArmy = Math.ceil(Math.max(...data.map((d) => d.army)) / 10000) * 10000;

  return (
    <div style={{ height: "100%", display: "flex", gap: "24px", padding: "20px", overflow: "auto" }}>
      {/* 左: テキスト */}
      <div style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#212529" }}>
            感染症死の時系列推移
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#6c757d", lineHeight: 1.6 }}>
            1854年7月頃からコレラ・腸チフスが急拡大。
            冬にかけ死者が急増し、軍の存続を脅かした。
          </p>
        </div>

        <button
          onClick={play}
          disabled={isPlaying}
          style={{
            padding: "6px 16px",
            fontSize: "12px",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            background: isPlaying ? "#f8f9fa" : "#fff",
            color: isPlaying ? "#adb5bd" : "#495057",
            cursor: isPlaying ? "not-allowed" : "pointer",
            textAlign: "left",
          }}
        >
          {isPlaying ? "▶ 描画中..." : hasStarted ? "↩ 最初から再生" : "▶ 時系列で再生"}
        </button>

        {isPeakVisible && (
          <div style={{
            background: "#fff",
            border: "1px solid #dee2e6",
            borderLeft: "4px solid #c0392b",
            borderRadius: "4px",
            padding: "10px 12px",
            fontSize: "12px",
          }}>
            <div style={{ color: "#6c757d", marginBottom: 4 }}>ピーク月: {data[PEAK_INDEX].label}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#c0392b" }}>
              {data[PEAK_INDEX].disease.toLocaleString()}人
            </div>
            <div style={{ color: "#6c757d" }}>感染症 月間死者数</div>
          </div>
        )}

        {/* 凡例 */}
        <div style={{
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "10px 12px",
          fontSize: "11px",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: "#495057" }}>凡例</div>
          {[
            { key: "disease", label: "感染症死", color: COLORS.disease, type: "area", axis: "左Y軸" },
            { key: "wounds", label: "戦死（負傷）", color: COLORS.wounds, type: "area", axis: "左Y軸" },
            { key: "other", label: "その他", color: COLORS.other, type: "area", axis: "左Y軸" },
            { key: "army", label: "兵力", color: COLORS.army, type: "line", axis: "右Y軸" },
          ].map((item) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: 5 }}>
              {item.type === "area" ? (
                <div style={{ width: 14, height: 10, background: item.color, opacity: 0.8, borderRadius: 1 }} />
              ) : (
                <div style={{ width: 14, height: 2, background: item.color }} />
              )}
              <span style={{ color: "#495057" }}>{item.label}</span>
              <span style={{ color: "#adb5bd", marginLeft: "auto" }}>{item.axis}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右: チャート */}
      <div style={{ flex: 1, background: "#fff", border: "1px solid #dee2e6", borderRadius: "4px", padding: "16px", minHeight: "300px" }}>
        <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: "8px" }}>
          ※ 左Y軸: 死者数（人）／ 右Y軸: 兵力（人）— スケールが大きく異なるため二軸で表示
        </div>
        {/* 未再生時の案内メッセージ */}
        {!hasStarted && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#adb5bd",
            fontSize: "13px",
            flexDirection: "column",
            gap: "8px",
          }}>
            <span style={{ fontSize: "28px" }}>▶</span>
            <span>「時系列で再生」を押してアニメーションを開始</span>
          </div>
        )}
        {hasStarted && (
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={visibleData} margin={{ top: 10, right: 60, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6c757d", fontSize: 10 }}
              axisLine={{ stroke: "#dee2e6" }}
              tickLine={false}
              interval={2}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              yAxisId="deaths"
              orientation="left"
              domain={[0, maxDeaths]}
              tick={{ fill: COLORS.disease, fontSize: 10 }}
              axisLine={{ stroke: "#dee2e6" }}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              label={{ value: "死者数 →", angle: -90, position: "insideLeft", fill: COLORS.disease, fontSize: 10, dx: -8 }}
            />
            <YAxis
              yAxisId="army"
              orientation="right"
              domain={[0, maxArmy]}
              tick={{ fill: COLORS.army, fontSize: 10 }}
              axisLine={{ stroke: "#dee2e6" }}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{ value: "← 兵力", angle: 90, position: "insideRight", fill: COLORS.army, fontSize: 10, dx: 20 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* isAnimationActive={false} でRechartsの内蔵アニメーションを無効化し、
                手動のvisibleCount制御だけをアニメーションソースにする */}
            <Area yAxisId="deaths" type="monotone" dataKey="other" stackId="d" fill={COLORS.other} stroke={COLORS.other} fillOpacity={0.5} strokeWidth={0} isAnimationActive={false} />
            <Area yAxisId="deaths" type="monotone" dataKey="wounds" stackId="d" fill={COLORS.wounds} stroke={COLORS.wounds} fillOpacity={0.6} strokeWidth={0} isAnimationActive={false} />
            <Area yAxisId="deaths" type="monotone" dataKey="disease" stackId="d" fill={COLORS.disease} stroke={COLORS.disease} fillOpacity={0.75} strokeWidth={1} isAnimationActive={false} />
            <Line yAxisId="army" type="monotone" dataKey="army" stroke={COLORS.army} strokeWidth={1.5} dot={false} strokeOpacity={0.8} isAnimationActive={false} />
            {isPeakVisible && (
              <ReferenceDot
                yAxisId="deaths"
                x={data[PEAK_INDEX].label}
                y={data[PEAK_INDEX].disease + data[PEAK_INDEX].wounds + data[PEAK_INDEX].other}
                r={5}
                fill={COLORS.wounds}
                stroke="#fff"
                strokeWidth={1.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
