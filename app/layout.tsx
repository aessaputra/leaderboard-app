import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PES Trophy Leaderboard',
  description: 'PWA pencatat piala UCL & Europa bersama teman-teman.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
    { color: '#ffffff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full bg-[radial-gradient(1200px_600px_at_50%_-20%,#1f293780,transparent),linear-gradient(#0b0b0c,#0b0b0c)] text-gray-100 antialiased">
        <div className="mx-auto w-full max-w-md px-4 py-6 md:max-w-lg">
          {children}
        </div>
      </body>
    </html>
  );
}
