// next.config.mjs
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const base = {
  reactStrictMode: true,
  typedRoutes: true, // fix warning
};

export default withPWA({
  dest: 'public',
  disable: isDev, // PWA aktif hanya saat production build
  register: true,
  skipWaiting: true,
  // pakai custom service worker (InjectManifest)
  swSrc: 'worker/sw.js',
  fallbacks: {
    document: '/offline',
  },
})(base);
