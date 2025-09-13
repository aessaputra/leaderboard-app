// next.config.mjs
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const base = {
  reactStrictMode: true,
  // Disable typed routes to reduce friction in migration; re-enable once links are typed
  typedRoutes: false,
  // Optimize Docker runtime size
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crests.football-data.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      // Proxy gallery images hosted on ImgBB through Next/Image
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
  swSrc: 'worker/sw.js',
  // Ensure offline page is precached for navigation fallback
  additionalManifestEntries: [{ url: '/offline', revision: null }],
})(base);
