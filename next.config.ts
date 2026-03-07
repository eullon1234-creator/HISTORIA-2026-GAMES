import type { NextConfig } from "next";

const isGithubPages = process.env.NODE_ENV === 'production';
const repoName = 'HISTORIA-2026-GAMES';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
