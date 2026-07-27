import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ナイチンゲール・レポート — 衛生改革予算化の根拠",
  description:
    "1854〜1856年クリミア戦争のデータが証明する: 感染症死は戦死の8倍。衛生委員会派遣により39,000人超の命が救われた。",
  keywords: ["ナイチンゲール", "クリミア戦争", "衛生改革", "データビジュアライゼーション"],
  authors: [{ name: "Florence Nightingale Data Analysis" }],
  openGraph: {
    title: "ナイチンゲール・レポート",
    description: "衛生改革予算化の根拠 — クリミア戦争死亡統計の可視化",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
