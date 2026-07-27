"use client";

import { useState, useEffect, useCallback } from "react";
import type { PhaseNumber } from "@/types/data";

/**
 * URLクエリパラメータ(?phase=N)と同期したフェーズ状態管理
 *
 * URL上は 1-indexed（?phase=1 → Phase1, ?phase=2 → Phase2 ...）
 * 内部stateは 0-indexed（0, 1, 2, 3）
 */
export function usePhaseState(initial: PhaseNumber = 0) {
  const [phase, setPhaseInternal] = useState<PhaseNumber>(initial);
  const [ready, setReady] = useState(false);

  // 初回マウント時にURLからフェーズを読み込む
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlVal = parseInt(params.get("phase") ?? "", 10);
    // URL は 1-indexed → 内部は 0-indexed
    const internal = urlVal - 1;
    if (!isNaN(internal) && internal >= 0 && internal <= 3) {
      setPhaseInternal(internal as PhaseNumber);
    }
    setReady(true);
  }, []);

  // フェーズ変更時にURLを更新（1-indexed で書き込む）
  const setPhase = useCallback((next: PhaseNumber) => {
    setPhaseInternal(next);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("phase", String(next + 1)); // 0→1, 1→2, 2→3, 3→4
      window.history.pushState({ phase: next }, "", `?${params.toString()}`);
    }
  }, []);

  // ブラウザの「戻る/進む」ボタンにも対応
  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      const p = e.state?.phase as number | undefined;
      if (typeof p === "number" && p >= 0 && p <= 3) {
        setPhaseInternal(p as PhaseNumber);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return { phase, setPhase, ready } as const;
}
