import './globals.css';

export const metadata = { title: 'PES Trophy', manifest: '/manifest.json' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
