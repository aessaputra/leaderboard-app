// next.config.mjs
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const base = {
  reactStrictMode: true,
  typedRoutes: true, // pindah ke root
};

export default withPWA({
  dest: 'public',
  disable: isDev, // PWA aktif saat production build
  register: true,
  skipWaiting: true,
})(base);
