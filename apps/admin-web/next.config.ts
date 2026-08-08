import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@sarira/design-tokens', '@sarira/shared-types'],
  experimental: { optimizePackageImports: ['@sarira/design-tokens'] },
};

export default nextConfig;
