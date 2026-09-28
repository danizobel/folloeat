import fs from 'fs';
import path from 'path';

interface KVStore {
  [key: string]: {
    value: string;
    expiresAt?: number;
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const KV_FILE = path.join(DATA_DIR, 'kv.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore error in edge environments without direct fs access
  }
}

function readLocalKV(): KVStore {
  try {
    ensureDataDir();
    if (fs.existsSync(KV_FILE)) {
      const raw = fs.readFileSync(KV_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // Fallback to empty store
  }
  return {};
}

function writeLocalKV(store: KVStore) {
  try {
    ensureDataDir();
    fs.writeFileSync(KV_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Ignore in non-fs environments
  }
}

export interface CloudflareKVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

class LocalKV implements CloudflareKVNamespace {
  private memStore: KVStore = {};

  constructor() {
    this.memStore = readLocalKV();
  }

  async get(key: string): Promise<string | null> {
    this.memStore = readLocalKV();
    const item = this.memStore[key];
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      delete this.memStore[key];
      writeLocalKV(this.memStore);
      return null;
    }
    return item.value;
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    this.memStore = readLocalKV();
    const expiresAt = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined;
    this.memStore[key] = { value, expiresAt };
    writeLocalKV(this.memStore);
  }

  async delete(key: string): Promise<void> {
    this.memStore = readLocalKV();
    delete this.memStore[key];
    writeLocalKV(this.memStore);
  }
}

// Singleton local KV instance
const localKvInstance = new LocalKV();

export function getKV(): CloudflareKVNamespace {
  // Check if running inside Cloudflare runtime with binding CACHE_KV
  if (typeof (globalThis as any).CACHE_KV !== 'undefined') {
    return (globalThis as any).CACHE_KV;
  }
  return localKvInstance;
}
