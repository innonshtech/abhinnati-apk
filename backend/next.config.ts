import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Parent repo also has a package-lock.json; keep Next rooted on backend/.
  outputFileTracingRoot: backendRoot,
};

export default nextConfig;
