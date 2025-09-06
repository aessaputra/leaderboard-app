export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Kamu sedang offline</h1>
      <p className="mt-2 text-sm text-gray-600">
        Beberapa fitur tidak tersedia tanpa koneksi. Coba lagi saat terhubung.
      </p>
    </main>
  );
}

