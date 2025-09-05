export const runtime = 'edge';

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Kamu lagi offline 😴</h1>
      <p className="mt-2 text-sm text-gray-600">
        Beberapa fitur mungkin tidak tersedia. Coba lagi saat terkoneksi. Data
        leaderboard terakhir akan tetap muncul jika sudah pernah dibuka.
      </p>
    </main>
  );
}
