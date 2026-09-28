interface KVItem {
  value: string;
  expiresAt?: number;
}

export interface CloudflareKVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// In-memory fallback for local development or SSR environments
const globalMemoryStore = new Map<string, KVItem>();

class MemoryKV implements CloudflareKVNamespace {
  async get(key: string): Promise<string | null> {
    const item = globalMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      globalMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const expiresAt = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined;
    globalMemoryStore.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    globalMemoryStore.delete(key);
  }
}

const memoryKvInstance = new MemoryKV();

export function getKV(): CloudflareKVNamespace {
  // Check if running inside Cloudflare Workers/Pages with binding CACHE_KV
  if (typeof (globalThis as any).CACHE_KV !== 'undefined') {
    return (globalThis as any).CACHE_KV;
  }
  if (typeof (process.env as any).CACHE_KV !== 'undefined') {
    return (process.env as any).CACHE_KV;
  }
  return memoryKvInstance;
}
