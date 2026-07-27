"use client";

import { PHASE_CONFIGS } from "@/types/data";
import type { PhaseNumber } from "@/types/data";

interface StepperNavProps {
  currentPhase: PhaseNumber;
  onPhaseChange: (p: PhaseNumber) => void;
}

export default function StepperNav({ currentPhase, onPhaseChange }: StepperNavProps) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#fff",
      borderTop: "1px solid #dee2e6",
      padding: "10px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 50,
    }}>
      {/* 戻るボタン */}
      <button
        onClick={() => currentPhase > 0 && onPhaseChange((currentPhase - 1) as PhaseNumber)}
        disabled={currentPhase === 0}
        style={{
          padding: "5px 16px",
          fontSize: "13px",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          background: currentPhase > 0 ? "#fff" : "#f8f9fa",
          color: currentPhase > 0 ? "#495057" : "#adb5bd",
          cursor: currentPhase > 0 ? "pointer" : "not-allowed",
        }}
      >
        ← 前へ
      </button>

      {/* フェーズドット */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {PHASE_CONFIGS.map((cfg, i) => {
          const isActive = cfg.phase === currentPhase;
          const isPast = cfg.phase < currentPhase;
          return (
            <button
              key={cfg.phase}
              onClick={() => onPhaseChange(cfg.phase)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
              }}
            >
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
                border: isActive ? "2px solid #5e3b8a" : "2px solid #dee2e6",
                background: isActive ? "#5e3b8a" : isPast ? "#e9ecef" : "#fff",
                color: isActive ? "#fff" : isPast ? "#6c757d" : "#adb5bd",
              }}>
                {isPast ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "10px",
                color: isActive ? "#5e3b8a" : "#adb5bd",
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
              }}>
                {cfg.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* 次へボタン */}
      <button
        onClick={() => currentPhase < 3 && onPhaseChange((currentPhase + 1) as PhaseNumber)}
        disabled={currentPhase === 3}
        style={{
          padding: "5px 16px",
          fontSize: "13px",
          border: "1px solid #5e3b8a",
          borderRadius: "4px",
          background: currentPhase < 3 ? "#5e3b8a" : "#f8f9fa",
          color: currentPhase < 3 ? "#fff" : "#adb5bd",
          cursor: currentPhase < 3 ? "pointer" : "not-allowed",
          fontWeight: 500,
        }}
      >
        次へ →
      </button>
    </div>
  );
}
