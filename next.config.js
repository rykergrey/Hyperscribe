import dotenv from 'dotenv';

dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg', 'youtube-transcript'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('fluent-ffmpeg', 'youtube-transcript');
    }
    return config;
  },
};

export default nextConfig;