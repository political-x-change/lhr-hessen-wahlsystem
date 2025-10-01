import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore LICENSE and README files
    config.module.rules.push({
      test: /\/(LICENSE|README\.md)$/,
      type: 'asset/source',
    });
    return config;
  },
  transpilePackages: ['@libsql/client'],
};

export default nextConfig;
