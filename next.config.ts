import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 親ディレクトリにもpackage-lock.jsonが存在するため、
  // Turbopackのルートを明示的にこのappディレクトリに固定する
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
