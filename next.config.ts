import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Strava CDN
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'dgalywyr863hv.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'd3nn82uez8cqug.cloudfront.net',
      },
      // Google profile pictures (Strava users with Google accounts)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Facebook profile pictures
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      // Strava assets
      {
        protocol: 'https',
        hostname: '*.strava.com',
      },
    ],
  },
  // Needed for better-sqlite3
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
