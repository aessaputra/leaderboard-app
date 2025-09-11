import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PES Trophy',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

// Viewport is configured in app/viewport.ts

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Serve different manifests for light/dark so installed PWA picks proper status bar color */}
        <link rel="manifest" href="/manifest-light.json" media="(prefers-color-scheme: light)" />
        <link rel="manifest" href="/manifest-dark.json" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">{children}</body>
    </html>
  );
}
