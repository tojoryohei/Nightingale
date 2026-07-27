"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProcessedData } from "@/types/data";
import { PHASE_CONFIGS } from "@/types/data";
import { usePhaseState } from "@/lib/usePhaseState";
import StepperNav from "./components/StepperNav";
import Phase1Hero from "./components/Phase1Hero";
import Phase2Timeline from "./components/Phase2Timeline";
import Phase3Intervention from "./components/Phase3Intervention";
import Phase4ROI from "./components/Phase4ROI";

export default function Home() {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [loading, setLoading] = useState(true);
  const { phase, setPhase, ready } = usePhaseState(0);

  useEffect(() => {
    fetch("/data/nightingale.json")
      .then((r) => r.json())
      .then((d: ProcessedData[]) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <p style={{ color: "#6c757d", fontSize: "14px" }}>読み込み中...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#c0392b" }}>データの読み込みに失敗しました。</p>
      </div>
    );
  }

  const cfg = PHASE_CONFIGS[phase];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      {/* ヘッダー */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #dee2e6",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#212529" }}>
            ナイチンゲール・レポート
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#6c757d" }}>
            クリミア戦争 死亡統計の可視化（1854–1856年）
          </p>
        </div>
        <div style={{ fontSize: "12px", color: "#6c757d" }}>
          <span style={{
            background: "#f1f3f5",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            padding: "2px 8px",
            fontWeight: 500,
            color: "#495057",
          }}>
            {cfg.title}: {cfg.subtitle}
          </span>
        </div>
      </header>

      {/* 主張バナー */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #dee2e6",
        padding: "8px 24px",
        textAlign: "center",
      }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={`claim-${phase}`}
            style={{ margin: 0, fontSize: "13px", color: "#495057", fontStyle: "italic" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            「{cfg.claim}」
          </motion.p>
        </AnimatePresence>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: "hidden", paddingBottom: "72px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`phase-${phase}`}
            style={{ height: "calc(100vh - 140px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {phase === 0 && <Phase1Hero data={data} />}
            {phase === 1 && <Phase2Timeline data={data} />}
            {phase === 2 && <Phase3Intervention data={data} />}
            {phase === 3 && <Phase4ROI data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ナビゲーション */}
      <StepperNav currentPhase={phase} onPhaseChange={setPhase} />
    </div>
  );
}
