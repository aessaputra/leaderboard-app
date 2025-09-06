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
