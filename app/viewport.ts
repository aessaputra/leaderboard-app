import type { Viewport } from 'next';

const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'transparent' },
    { media: '(prefers-color-scheme: dark)', color: 'transparent' },
  ],
};

export default viewport;

