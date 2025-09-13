"use client";
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const current = currentIndex != null ? items[currentIndex] ?? null : null;
  const [imgLoading, setImgLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

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
              onClick={() => {
                const idx = items.findIndex((x) => x.id === it.id);
                setCurrentIndex(idx >= 0 ? idx : 0);
                setZoom(1);
                setImgLoading(true);
              }}
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
          <Camera className="h-4 w-4" />
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
      <Dialog
        open={currentIndex !== null}
        onOpenChange={(o) => {
          if (!o) {
            setCurrentIndex(null);
            setZoom(1);
            setImgLoading(false);
          }
        }}
        className="max-w-[100svw] rounded-none bg-transparent p-0 text-white"
      >
        {current ? (
          <div className="relative">
            {/* Top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 select-none bg-gradient-to-b from-black/60 to-transparent px-3 pt-3">
              <div className="pointer-events-auto flex items-center justify-between gap-2">
                <div className="text-sm text-gray-200">
                  <span className="font-medium text-white">{current.uploader.name ?? 'User'}</span>
                  <span className="mx-1">•</span>
                  <span className="text-gray-300">{fmtRelative(current.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                    title="Buka asli"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => setCurrentIndex((i) => (i != null && i > 0 ? i - 1 : i))}
                    disabled={currentIndex === 0}
                    className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40"
                    title="Sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((i) => (i != null && i < items.length - 1 ? i + 1 : i))
                    }
                    disabled={currentIndex === items.length - 1}
                    className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40"
                    title="Berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex(null)}
                    className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Image area with zoom, fixed 9:16 canvas */}
            <div className="relative mx-auto h-[90svh] aspect-[9/16] overflow-hidden rounded-md bg-black">
              {imgLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}
              <div
                className={`relative h-full w-full select-none ${
                  zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
              >
                <Image
                  src={current.displayUrl || current.url}
                  alt={current.caption || 'Photo'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ touchAction: 'manipulation', transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                  onLoadingComplete={() => setImgLoading(false)}
                  onError={() => setImgLoading(false)}
                />
              </div>
            </div>

            {/* Bottom bar caption + zoom controls */}
            <div className="mx-auto mt-3 flex w-[min(100svw,calc(90svh*0.5625))] max-w-full items-center justify-between gap-2 px-2">
              {current.caption ? (
                <p className="max-w-[80%] rounded-md p-2 text-sm bg-black/70 text-white shadow-sm dark:bg-white/10 dark:text-gray-100">
                  {current.caption}
                </p>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                  disabled={zoom <= 1}
                  className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
