import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
})(baseConfig);
