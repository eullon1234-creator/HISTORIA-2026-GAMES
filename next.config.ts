import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';
const repoName = 'HISTORIA-2026-GAMES';

const nextConfig: any = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
