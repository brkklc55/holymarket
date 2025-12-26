import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      tap: false,
      "why-is-node-running": false,
      "@react-native-async-storage/async-storage": false,
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require("webpack").IgnorePlugin)({
        resourceRegExp: /^\.\/test\//,
        contextRegExp: /thread-stream/,
      }),
    );

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/manifest",
      },
    ];
  },
};

export default nextConfig;
