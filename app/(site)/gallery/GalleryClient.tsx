"use client";
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import Dialog from '@/components/ui/dialog';

type UserLite = { id: string; name: string | null };
type GalleryItem = {
  id: string;
  url: string;
  displayUrl: string;
  thumbUrl: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  createdAt: string;
  expiresAt: string;
  uploader: UserLite;
};

function fmtRelative(dateStr: string) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let value = -Math.floor(diff);
  let acc = 1;
  for (const [step, u] of units) {
    if (Math.abs(value / acc) < step) {
      unit = u;
      value = Math.round(value / acc);
      break;
    }
    acc *= step;
  }
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value, unit);
}

async function revalidateImage(id: string) {
  try {
    await fetch('/api/gallery/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {}
}

type UploadState =
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'ready'; file: File }
  | { status: 'uploading'; progress: number }
  | { status: 'error'; message: string }
  | { status: 'success' };

export default function GalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function fetchPage(cursor?: string | null) {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?take=8${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      const data: GalleryItem[] = json.data ?? [];
      setItems((prev) => (cursor ? [...prev, ...data] : data));
      setNextCursor(json.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage();
  }, []);

  function handleImgError(id: string) {
    setHidden((prev) => new Set([...prev, id]));
    revalidateImage(id);
  }

  async function startUpload(file: File, theCaption: string) {
    setUploadState({ status: 'uploading', progress: 0 });
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (theCaption.trim().length > 0) fd.append('caption', theCaption.slice(0, 280));

      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/gallery/upload');
        xhr.responseType = 'json';
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setUploadState({ status: 'uploading', progress: p });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
          else reject(new Error(xhr.response?.error || 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });

      const newItem: GalleryItem = data.data;
      setItems((prev) => [newItem, ...prev]);
      setUploadState({ status: 'success' });
      setTimeout(() => setUploadOpen(false), 500);
    } catch (e: any) {
      setUploadState({ status: 'error', message: e.message || 'Upload error' });
    }
  }

  const grid = useMemo(() => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {items.map((it) => {
          if (hidden.has(it.id)) return null;
          return (
            <button
              key={it.id}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              onClick={() => setLightbox(it)}
            >
              <div className="relative h-full w-full">
                <Image
                  src={(it.thumbUrl || it.displayUrl || it.url) as string}
                  alt={it.caption || 'Photo'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover"
                  onError={() => handleImgError(it.id)}
                />
              </div>
              {it.caption ? (
                <div className="pointer-events-none absolute left-1 right-1 bottom-1 rounded-xl bg-black/45 p-2 text-xs text-white">
                  <p className="line-clamp-2">{it.caption}</p>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }, [items, hidden]);

  return (
    <div className="relative px-2 sm:px-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Semua foto aktif, terbaru di atas.</p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs font-medium text-gray-900 shadow-sm backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus:ring-white/20"
          onClick={() => {
            setCaption('');
            setUploadState({ status: 'idle' });
            setUploadOpen(true);
          }}
          aria-label="Buka dialog upload"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </button>
      </div>
      {grid}

      <div className="mt-4 flex items-center justify-center">
        {nextCursor ? (
          <button
            onClick={() => fetchPage(nextCursor)}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
          >
            {loading ? 'Memuat…' : 'Muat lebih banyak'}
          </button>
        ) : null}
      </div>


      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2 dark:border-white/10">
          <h2 id="upload-title" className="text-base font-semibold">
            Upload Foto
          </h2>
          <button
            className="rounded-lg p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:hover:bg-white/10"
            onClick={() => setUploadOpen(false)}
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setUploadState({ status: 'ready', file: f });
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-200 file:bg-white file:px-3 file:py-2 file:text-sm hover:file:bg-gray-50 dark:file:border-white/10 dark:file:bg-white/5 dark:hover:file:bg-white/10"
          />

          <div>
            <label className="mb-1 block text-xs text-gray-500">Caption (opsional)</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 280))}
              className="w-full rounded-xl border border-gray-200 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-white/10"
              placeholder="Tulis keterangan singkat…"
            />
            <div className="mt-1 text-right text-[11px] text-gray-400">{caption.length}/280</div>
          </div>

          {uploadState.status === 'uploading' ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                  className="h-full bg-brand-600 transition-all"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <div className="w-10 text-right text-xs tabular-nums">{uploadState.progress}%</div>
            </div>
          ) : null}

          {uploadState.status === 'error' ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {uploadState.message}
            </div>
          ) : null}

          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              className="rounded-xl px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => setUploadOpen(false)}
            >
              Batal
            </button>
            <button
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
              disabled={uploadState.status !== 'ready'}
              onClick={() => {
                if (uploadState.status !== 'ready') return;
                startUpload(uploadState.file, caption);
              }}
            >
              Upload
            </button>
          </div>
        </div>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        {lightbox ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {lightbox.uploader.name ?? 'User'}
                </span>
                <span className="mx-1">•</span>
                <span>{fmtRelative(lightbox.createdAt)}</span>
              </div>
              <button
                className="rounded-lg p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:hover:bg-white/10"
                aria-label="Tutup"
                onClick={() => setLightbox(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-[85svh]">
              <Image
                src={lightbox.displayUrl || lightbox.url}
                alt={lightbox.caption || 'Photo'}
                fill
                sizes="100vw"
                className="object-contain"
                style={{ touchAction: 'manipulation' }}
                onError={() => handleImgError(lightbox.id)}
              />
            </div>

            {lightbox.caption ? (
              <p className="text-sm text-gray-700 dark:text-gray-200">{lightbox.caption}</p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
