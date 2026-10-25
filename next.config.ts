import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address),
  output: "export",
  trailingSlash: true,
};
export default config;
