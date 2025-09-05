'use client';

import Dexie, { Table } from 'dexie';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

type QueuedRequest = {
  id?: number;
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: Json;
  createdAt: number;
  retries: number;
};

class QueueDB extends Dexie {
  requests!: Table<QueuedRequest, number>;

  constructor() {
    super('pes-trophy-queue');
    this.version(1).stores({
      requests: '++id, url, method, createdAt',
    });
  }
}

const db = new QueueDB();

export function useOfflineQueue() {
  async function enqueue(
    req: Omit<QueuedRequest, 'id' | 'createdAt' | 'retries'>
  ) {
    await db.requests.add({
      ...req,
      createdAt: Date.now(),
      retries: 0,
    });
  }

  async function processQueue() {
    const all = await db.requests.orderBy('createdAt').toArray();

    for (const item of all) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body),
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        if (item.id !== undefined) {
          await db.requests.delete(item.id);
        }
      } catch {
        if (item.id !== undefined) {
          await db.requests.update(item.id, { retries: item.retries + 1 });
        }
      }
    }
  }

  function attachOnlineListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      void processQueue();
    });
  }

  return { enqueue, processQueue, attachOnlineListener };
}
