import type { Viewport } from 'next';

const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Ensure the OS status bar matches the page background
  // (Android uses this meta; iOS Safari also respects it on recent versions).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default viewport;
