import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile local workspace packages
  transpilePackages: ["sticket-nft-collections", "sticket-factory"],
  // Handle potential issues with stellar-sdk and buffer
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
    };
    return config;
  },
};

export default nextConfig;
