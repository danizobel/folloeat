import {
  Merchant,
  HardwareDevice,
  MenuItem,
  Order,
  Reservation,
  Review,
  SponsoredNotification,
  OrderStatus,
  CaptureStatus,
  DepositStatus
} from './types';
import {
  INITIAL_MERCHANTS,
  INITIAL_HARDWARE_DEVICES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS
} from './seed-data';

// -------------------------------------------------------------
// D1 SQL Migration Schema (Automatic execution on boot/deploy)
// -------------------------------------------------------------
export const D1_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    google_place_id TEXT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_type TEXT CHECK(plan_type IN ('SMART', 'PRO')) DEFAULT 'PRO',
    setup_fee_paid REAL DEFAULT 199.00,
    hardware_deposit REAL DEFAULT 150.00,
    monthly_saas_fee REAL DEFAULT 29.00,
    commission_rate REAL DEFAULT 0.08,
    stripe_account_id TEXT,
    stripe_customer_id TEXT,
    phone TEXT NOT NULL,
    emergency_phone TEXT,
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    is_accredited INTEGER DEFAULT 1,
    is_spotlight INTEGER DEFAULT 0,
    has_gluten_free INTEGER DEFAULT 0,
    has_lactose_free INTEGER DEFAULT 0,
    has_vegan INTEGER DEFAULT 0,
    is_partner INTEGER DEFAULT 1,
    snooze_until DATETIME,
    prep_delay_minutes INTEGER DEFAULT 0,
    weekly_off_day INTEGER,
    vacation_start DATE,
    vacation_end DATE,
    max_orders_per_slot INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hardware_devices (
    device_id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    model TEXT DEFAULT 'Sunmi V2s',
    deposit_amount REAL DEFAULT 150.00,
    deposit_status TEXT CHECK(deposit_status IN ('HELD', 'REFUNDED', 'REDEEMED')) DEFAULT 'HELD',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    allergens TEXT,
    is_available INTEGER DEFAULT 1,
    is_alcohol INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_pin TEXT,
    delivery_address TEXT,
    zone TEXT,
    umbrella_number TEXT,
    pickup_point TEXT,
    total_food_amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0.15,
    discount_amount REAL DEFAULT 0,
    coupon_code TEXT,
    total_order_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('CARD', 'CASH')) DEFAULT 'CARD',
    cash_change_from REAL,
    stripe_payment_intent_id TEXT,
    capture_status TEXT CHECK(capture_status IN ('AUTHORIZED', 'CAPTURED', 'CANCELLED', 'EXPIRED')) DEFAULT 'AUTHORIZED',
    status TEXT CHECK(status IN ('PENDING', 'ACCEPTED', 'DELIVERING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    cutlery_requested INTEGER DEFAULT 0,
    has_alcohol INTEGER DEFAULT 0,
    device_fingerprint TEXT,
    items_json TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    reservation_time DATETIME NOT NULL,
    confirmation_status TEXT CHECK(confirmation_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW')) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    order_id TEXT REFERENCES orders(id),
    reservation_id TEXT,
    customer_phone TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    tags TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsored_notifications (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target_zone TEXT DEFAULT 'ALL',
    scheduled_at DATETIME NOT NULL,
    sent_at DATETIME,
    price_charged REAL DEFAULT 19.00,
    status TEXT CHECK(status IN ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED')) DEFAULT 'SCHEDULED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

interface DatabaseSchema {
  merchants: Merchant[];
  hardware_devices: HardwareDevice[];
  menu_items: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  sponsored_notifications: SponsoredNotification[];
}

let inMemoryStore: DatabaseSchema = {
  merchants: [...INITIAL_MERCHANTS],
  hardware_devices: [...INITIAL_HARDWARE_DEVICES],
  menu_items: [...INITIAL_MENU_ITEMS],
  orders: [...INITIAL_ORDERS],
  reservations: [...INITIAL_RESERVATIONS],
  reviews: [...INITIAL_REVIEWS],
  sponsored_notifications: [...INITIAL_NOTIFICATIONS]
};

function loadDatabase(): DatabaseSchema {
  return inMemoryStore;
}

function saveDatabase(store: DatabaseSchema) {
  inMemoryStore = store;
}

// -------------------------------------------------------------
// Cloudflare D1 Compatible API Interface
// -------------------------------------------------------------

export interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number | string;
    duration?: number;
  };
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = any>(): Promise<D1Result<T>>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
}

class LocalD1PreparedStatement implements D1PreparedStatement {
  private query: string;
  private params: any[] = [];

  constructor(query: string) {
    this.query = query.trim();
  }

  bind(...values: any[]): D1PreparedStatement {
    this.params = values;
    return this;
  }

  async all<T = any>(): Promise<D1Result<T>> {
    const store = loadDatabase();
    const q = this.query.toLowerCase();

    if (q.startsWith('select * from merchants')) {
      return { results: store.merchants as unknown as T[], success: true };
    }
    if (q.startsWith('select * from menu_items')) {
      return { results: store.menu_items as unknown as T[], success: true };
    }
    if (q.startsWith('select * from orders')) {
      return { results: store.orders as unknown as T[], success: true };
    }
    if (q.startsWith('select * from reservations')) {
      return { results: store.reservations as unknown as T[], success: true };
    }
    if (q.startsWith('select * from hardware_devices')) {
      return { results: store.hardware_devices as unknown as T[], success: true };
    }
    if (q.startsWith('select * from sponsored_notifications')) {
      return { results: store.sponsored_notifications as unknown as T[], success: true };
    }
    return { results: [], success: true };
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    const res = await this.all<T>();
    if (!res.results || res.results.length === 0) return null;
    const row = res.results[0];
    if (colName && typeof row === 'object' && row !== null) {
      return (row as any)[colName] ?? null;
    }
    return row;
  }

  async run(): Promise<D1Result> {
    return { results: [], success: true, meta: { changes: 1 } };
  }
}

class LocalD1Database implements D1Database {
  prepare(query: string): D1PreparedStatement {
    return new LocalD1PreparedStatement(query);
  }

  async batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      results.push(await stmt.all<T>());
    }
    return results;
  }

  async exec(query: string): Promise<D1Result> {
    return { results: [], success: true };
  }
}

// -------------------------------------------------------------
// Auto-Migration & Self-Healing Engine for Cloudflare & Local
// -------------------------------------------------------------
let isAutoMigrated = false;

function getCloudflareD1(): D1Database | null {
  if (typeof (globalThis as any).DB !== 'undefined') {
    return (globalThis as any).DB as D1Database;
  }
  if (typeof (process.env as any).DB !== 'undefined') {
    return (process.env as any).DB as D1Database;
  }
  return null;
}

export async function ensureDatabaseInitialized(): Promise<void> {
  if (isAutoMigrated) return;

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      // 1. Automatically run the full SQL schema on Cloudflare D1
      await d1.exec(D1_SCHEMA_SQL);

      // 2. Check if merchants exist
      const check = await d1.prepare("SELECT COUNT(*) as count FROM merchants").first<{ count: number }>();
      if (!check || check.count === 0) {
        // Automatically insert the initial partner restaurants, devices, and menu items
        for (const m of INITIAL_MERCHANTS) {
          await d1.prepare(`
            INSERT OR REPLACE INTO merchants (
              id, google_place_id, name, slug, plan_type, setup_fee_paid, hardware_deposit,
              monthly_saas_fee, commission_rate, stripe_account_id, phone, emergency_phone,
              address, lat, lng, is_accredited, is_spotlight, has_gluten_free, has_lactose_free,
              has_vegan, is_partner, prep_delay_minutes, max_orders_per_slot, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            m.id, m.google_place_id || null, m.name, m.slug, m.plan_type, m.setup_fee_paid,
            m.hardware_deposit, m.monthly_saas_fee, m.commission_rate, m.stripe_account_id || null,
            m.phone, m.emergency_phone || null, m.address, m.lat, m.lng,
            m.is_accredited ?? 1, m.is_spotlight ?? 0, m.has_gluten_free ?? 0,
            m.has_lactose_free ?? 0, m.has_vegan ?? 0, m.is_partner ?? 1,
            m.prep_delay_minutes, m.max_orders_per_slot, m.created_at
          ).run();
        }


        for (const d of INITIAL_HARDWARE_DEVICES) {
          await d1.prepare(`
            INSERT OR REPLACE INTO hardware_devices (device_id, merchant_id, model, deposit_amount, deposit_status, assigned_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(d.device_id, d.merchant_id, d.model, d.deposit_amount, d.deposit_status, d.assigned_at).run();
        }

        for (const mi of INITIAL_MENU_ITEMS) {
          await d1.prepare(`
            INSERT OR REPLACE INTO menu_items (id, merchant_id, category, name, description, price, allergens, is_available, is_alcohol, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            mi.id, mi.merchant_id, mi.category, mi.name, mi.description || null,
            mi.price, JSON.stringify(mi.allergens), mi.is_available, mi.is_alcohol, mi.created_at
          ).run();
        }
      }
    } catch (e) {
      console.error('Warning auto-migrating Cloudflare D1:', e);
    }
  } else {
    // Local environment initialization
    loadDatabase();
  }

  isAutoMigrated = true;
}

export function getDb(): D1Database {
  const d1 = getCloudflareD1();
  if (d1) return d1;
  return new LocalD1Database();
}

// -------------------------------------------------------------
// Typed Domain Methods for FolloEat v4.1
// -------------------------------------------------------------

export async function getMerchants(zone?: string): Promise<Merchant[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM merchants").all<Merchant>();
      let list = res.results || [];
      if (zone && zone !== 'TUTTI') {
        if (zone === 'Spiaggia') {
          list = list.filter(m => (m.category?.toLowerCase().includes('mare') || m.address.toLowerCase().includes('italia') || m.is_partner === 1));
        } else {
          list = list.filter(m => (m.address.toLowerCase().includes(zone.toLowerCase()) || m.name.toLowerCase().includes(zone.toLowerCase())));
        }
      }
      return list;
    } catch {
      // fallback to store
    }
  }

  const store = loadDatabase();
  let list = [...store.merchants];

  if (zone && zone !== 'TUTTI') {
    if (zone === 'Spiaggia') {
      list = list.filter(m => m.category?.toLowerCase().includes('mare') || m.address.toLowerCase().includes('italia') || m.is_partner === 1);
    } else {
      list = list.filter(m => m.address.toLowerCase().includes(zone.toLowerCase()) || m.name.toLowerCase().includes(zone.toLowerCase()));
    }
  }

  return list;
}

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const m = await d1.prepare("SELECT * FROM merchants WHERE slug = ? OR id = ?").bind(slug, slug).first<Merchant>();
      if (m) return m;
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  const m = store.merchants.find(item => item.slug === slug || item.id === slug);
  return m || null;
}

export async function getMenuItems(merchantId: string): Promise<MenuItem[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM menu_items WHERE merchant_id = ?").bind(merchantId).all<any>();
      if (res.results && res.results.length > 0) {
        return res.results.map(row => ({
          ...row,
          allergens: typeof row.allergens === 'string' ? JSON.parse(row.allergens) : (row.allergens || [])
        }));
      }
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  return store.menu_items.filter(item => item.merchant_id === merchantId);
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const merchant = store.merchants.find(m => m.id === orderData.merchant_id);

  const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const randomPin = Math.floor(1000 + Math.random() * 9000).toString();

  const newOrder: Order = {
    id: orderId,
    merchant_id: orderData.merchant_id || '',
    merchant_name: merchant?.name || 'Locale FolloEat',
    customer_name: orderData.customer_name || 'Cliente',
    customer_phone: orderData.customer_phone || '',
    delivery_pin: orderData.delivery_pin || randomPin,
    delivery_address: orderData.delivery_address || '',
    zone: orderData.zone || 'Centro',
    umbrella_number: orderData.umbrella_number || undefined,
    pickup_point: orderData.pickup_point || '',
    total_food_amount: Number(orderData.total_food_amount?.toFixed(2) || '0.00'),
    platform_fee: 0.15,
    discount_amount: orderData.discount_amount || 0,
    coupon_code: orderData.coupon_code || '',
    total_order_amount: Number((Number(orderData.total_food_amount || 0) + 0.15 - (orderData.discount_amount || 0)).toFixed(2)),
    payment_method: orderData.payment_method || 'CARD',
    cash_change_from: orderData.cash_change_from,
    stripe_payment_intent_id: orderData.payment_method === 'CARD' ? `pi_auth_${Date.now()}` : undefined,
    capture_status: orderData.payment_method === 'CARD' ? 'AUTHORIZED' : 'AUTHORIZED',
    status: 'PENDING',
    cutlery_requested: orderData.cutlery_requested ? 1 : 0,
    has_alcohol: orderData.has_alcohol ? 1 : 0,
    device_fingerprint: orderData.device_fingerprint || 'web-client',
    items_json: orderData.items_json || '[]',
    notes: orderData.notes || '',
    follo_points_earned: Math.floor(Number(orderData.total_food_amount || 0)),
    created_at: now
  };

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO orders (
          id, merchant_id, customer_name, customer_phone, delivery_pin, delivery_address, zone, umbrella_number, pickup_point,
          total_food_amount, platform_fee, discount_amount, coupon_code, total_order_amount,
          payment_method, cash_change_from, stripe_payment_intent_id, capture_status, status,
          cutlery_requested, has_alcohol, device_fingerprint, items_json, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newOrder.id, newOrder.merchant_id, newOrder.customer_name, newOrder.customer_phone,
        newOrder.delivery_pin, newOrder.delivery_address || null, newOrder.zone || null,
        newOrder.umbrella_number || null, newOrder.pickup_point || null,
        newOrder.total_food_amount, newOrder.platform_fee, newOrder.discount_amount || 0,
        newOrder.coupon_code || null, newOrder.total_order_amount, newOrder.payment_method,
        newOrder.cash_change_from || null, newOrder.stripe_payment_intent_id || null,
        newOrder.capture_status, newOrder.status, newOrder.cutlery_requested,
        newOrder.has_alcohol ?? 0, newOrder.device_fingerprint || null, newOrder.items_json,
        newOrder.notes || null, newOrder.created_at
      ).run();
    } catch (e) {
      console.error('Error inserting order in D1:', e);
    }
  }


  store.orders.unshift(newOrder);
  saveDatabase(store);
  return newOrder;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const order = await d1.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<Order>();
      if (order) return order;
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  const order = store.orders.find(o => o.id === orderId);
  return order || null;
}

export async function getOrders(merchantId?: string): Promise<Order[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      if (merchantId) {
        const res = await d1.prepare("SELECT * FROM orders WHERE merchant_id = ? ORDER BY created_at DESC").bind(merchantId).all<Order>();
        return res.results || [];
      } else {
        const res = await d1.prepare("SELECT * FROM orders ORDER BY created_at DESC").all<Order>();
        return res.results || [];
      }
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  if (merchantId) {
    return store.orders.filter(o => o.merchant_id === merchantId || o.merchant_name?.toLowerCase().includes(merchantId.toLowerCase()));
  }
  return store.orders;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  captureStatus?: CaptureStatus
): Promise<Order | null> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const index = store.orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  store.orders[index].status = status;
  let finalCapture = captureStatus;
  if (finalCapture) {
    store.orders[index].capture_status = finalCapture;
  } else if (status === 'ACCEPTED' && store.orders[index].payment_method === 'CARD') {
    finalCapture = 'CAPTURED';
    store.orders[index].capture_status = 'CAPTURED';
  } else if (status === 'CANCELLED' && store.orders[index].payment_method === 'CARD') {
    finalCapture = 'CANCELLED';
    store.orders[index].capture_status = 'CANCELLED';
  }

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare("UPDATE orders SET status = ?, capture_status = ? WHERE id = ?")
        .bind(status, finalCapture || store.orders[index].capture_status, orderId)
        .run();
    } catch (e) {
      console.error('Error updating order status in D1:', e);
    }
  }

  saveDatabase(store);
  return store.orders[index];
}

export async function createReservation(resData: Partial<Reservation>): Promise<Reservation> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const merchant = store.merchants.find(m => m.id === resData.merchant_id);
  const resId = `RES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newRes: Reservation = {
    id: resId,
    merchant_id: resData.merchant_id || '',
    merchant_name: merchant?.name || 'Ristorante FolloEat',
    customer_name: resData.customer_name || 'Cliente',
    customer_phone: resData.customer_phone || '',
    party_size: Number(resData.party_size) || 2,
    reservation_time: resData.reservation_time || new Date().toISOString(),
    confirmation_status: 'CONFIRMED',
    is_fast_seating: true,
    coperto_fee: 0.50,
    created_at: new Date().toISOString()
  };

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO reservations (id, merchant_id, customer_name, customer_phone, party_size, reservation_time, confirmation_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newRes.id, newRes.merchant_id, newRes.customer_name, newRes.customer_phone,
        newRes.party_size, newRes.reservation_time, newRes.confirmation_status, newRes.created_at
      ).run();
    } catch (e) {
      console.error('Error inserting reservation in D1:', e);
    }
  }

  store.reservations.unshift(newRes);
  saveDatabase(store);
  return newRes;
}

export async function getReservations(merchantId?: string): Promise<Reservation[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      if (merchantId) {
        const res = await d1.prepare("SELECT * FROM reservations WHERE merchant_id = ?").bind(merchantId).all<Reservation>();
        return res.results || [];
      } else {
        const res = await d1.prepare("SELECT * FROM reservations").all<Reservation>();
        return res.results || [];
      }
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  if (merchantId) {
    return store.reservations.filter(r => r.merchant_id === merchantId);
  }
  return store.reservations;
}

export async function getHardwareDevices(): Promise<HardwareDevice[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM hardware_devices").all<HardwareDevice>();
      return res.results || [];
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  return store.hardware_devices;
}

export async function updateHardwareStatus(deviceId: string, status: DepositStatus): Promise<boolean> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const dev = store.hardware_devices.find(d => d.device_id === deviceId);
  if (!dev) return false;
  dev.deposit_status = status;

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare("UPDATE hardware_devices SET deposit_status = ? WHERE device_id = ?")
        .bind(status, deviceId)
        .run();
    } catch {
      // ignore
    }
  }

  saveDatabase(store);
  return true;
}

export async function getSponsoredNotifications(): Promise<SponsoredNotification[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM sponsored_notifications ORDER BY scheduled_at DESC").all<SponsoredNotification>();
      return res.results || [];
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  return store.sponsored_notifications;
}

export async function createSponsoredNotification(data: Partial<SponsoredNotification>): Promise<SponsoredNotification> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const merchant = store.merchants.find(m => m.id === data.merchant_id);
  const notif: SponsoredNotification = {
    id: `notif_${Date.now()}`,
    merchant_id: data.merchant_id || '',
    merchant_name: merchant?.name || 'Partner FolloEat',
    title: data.title || 'Promozione Follonica',
    body: data.body || '',
    target_zone: data.target_zone || 'ALL',
    scheduled_at: data.scheduled_at || new Date().toISOString(),
    sent_at: new Date().toISOString(),
    price_charged: data.price_charged || 19.00,
    status: 'SENT',
    created_at: new Date().toISOString()
  };

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO sponsored_notifications (id, merchant_id, title, body, target_zone, scheduled_at, sent_at, price_charged, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        notif.id, notif.merchant_id, notif.title, notif.body, notif.target_zone,
        notif.scheduled_at, notif.sent_at || null, notif.price_charged, notif.status, notif.created_at
      ).run();
    } catch (e) {
      console.error('Error inserting sponsored notification in D1:', e);
    }
  }

  store.sponsored_notifications.unshift(notif);
  saveDatabase(store);
  return notif;
}

export async function getReviews(merchantId?: string): Promise<Review[]> {
  await ensureDatabaseInitialized();
  const d1 = getCloudflareD1();

  if (d1) {
    try {
      if (merchantId) {
        const res = await d1.prepare("SELECT * FROM reviews WHERE merchant_id = ?").bind(merchantId).all<Review>();
        return res.results || [];
      } else {
        const res = await d1.prepare("SELECT * FROM reviews").all<Review>();
        return res.results || [];
      }
    } catch {
      // fallback
    }
  }

  const store = loadDatabase();
  if (merchantId) {
    return store.reviews.filter(r => r.merchant_id === merchantId);
  }
  return store.reviews;
}

export async function updateMerchantSnooze(
  merchantId: string,
  snoozeUntil: string | null,
  prepDelayMinutes: number
): Promise<Merchant | null> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const merchant = store.merchants.find(m => m.id === merchantId || m.slug === merchantId);
  if (!merchant) return null;

  merchant.snooze_until = snoozeUntil;
  merchant.prep_delay_minutes = prepDelayMinutes;

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare("UPDATE merchants SET snooze_until = ?, prep_delay_minutes = ? WHERE id = ? OR slug = ?")
        .bind(snoozeUntil, prepDelayMinutes, merchantId, merchantId)
        .run();
    } catch {
      // fallback
    }
  }

  saveDatabase(store);
  return merchant;
}

export async function seedInitialData(force = false): Promise<{ success: boolean; message: string }> {
  // Force reset both memory and execute SQL
  inMemoryStore = {
    merchants: [...INITIAL_MERCHANTS],
    hardware_devices: [...INITIAL_HARDWARE_DEVICES],
    menu_items: [...INITIAL_MENU_ITEMS],
    orders: [...INITIAL_ORDERS],
    reservations: [...INITIAL_RESERVATIONS],
    reviews: [...INITIAL_REVIEWS],
    sponsored_notifications: [...INITIAL_NOTIFICATIONS]
  };
  saveDatabase(inMemoryStore);

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.exec(D1_SCHEMA_SQL);
      for (const m of INITIAL_MERCHANTS) {
        await d1.prepare(`
          INSERT OR REPLACE INTO merchants (
            id, google_place_id, name, slug, plan_type, setup_fee_paid, hardware_deposit,
            monthly_saas_fee, commission_rate, stripe_account_id, phone, emergency_phone,
            address, lat, lng, is_partner, prep_delay_minutes, max_orders_per_slot, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          m.id, m.google_place_id || null, m.name, m.slug, m.plan_type, m.setup_fee_paid,
          m.hardware_deposit, m.monthly_saas_fee, m.commission_rate, m.stripe_account_id || null,
          m.phone, m.emergency_phone || null, m.address, m.lat, m.lng, m.is_partner,
          m.prep_delay_minutes, m.max_orders_per_slot, m.created_at
        ).run();
      }
    } catch (e) {
      console.error('Error seeding D1:', e);
    }
  }

  return { success: true, message: 'Database reinizializzato con i dati ufficiali di Follonica v4.1 (SQL e D1 sincronizzati).' };
}

// -------------------------------------------------------------
// Merchant Onboarding & Menu Management (Official v4.1)
// -------------------------------------------------------------

export async function createMerchant(merchantData: Partial<Merchant>): Promise<Merchant> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const id = merchantData.id || `m_${Date.now()}`;
  const slug = merchantData.slug || (merchantData.name ? merchantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `merchant-${Date.now()}`);
  
  const newMerchant: Merchant = {
    id,
    name: merchantData.name || 'Nuovo Esercente',
    slug,
    plan_type: merchantData.plan_type || 'PRO',
    setup_fee_paid: merchantData.setup_fee_paid ?? 199.00,
    hardware_deposit: merchantData.hardware_deposit ?? 150.00,
    monthly_saas_fee: merchantData.monthly_saas_fee ?? 29.00,
    commission_rate: merchantData.commission_rate ?? 0.08,
    phone: merchantData.phone || '+39 0566 000000',
    emergency_phone: merchantData.emergency_phone || undefined,
    address: merchantData.address || 'Follonica (GR)',
    lat: merchantData.lat || 42.9248,
    lng: merchantData.lng || 10.7588,
    is_accredited: merchantData.is_accredited ?? 1,
    is_spotlight: merchantData.is_spotlight ?? 0,
    has_gluten_free: merchantData.has_gluten_free ?? 0,
    has_lactose_free: merchantData.has_lactose_free ?? 0,
    has_vegan: merchantData.has_vegan ?? 0,
    is_partner: (merchantData.is_accredited ?? 1) === 1 ? 1 : 0,
    prep_delay_minutes: 0,
    max_orders_per_slot: 15,
    created_at: new Date().toISOString(),
    rating: 5.0,
    review_count: 0,
    category: merchantData.category || 'Ristorante',
    hero_image: merchantData.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    delivery_time_est: '25-35 min',
    min_order: 10.00
  };

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT OR REPLACE INTO merchants (
          id, name, slug, plan_type, setup_fee_paid, hardware_deposit,
          monthly_saas_fee, commission_rate, phone, emergency_phone,
          address, lat, lng, is_accredited, is_spotlight, has_gluten_free,
          has_lactose_free, has_vegan, is_partner, prep_delay_minutes, max_orders_per_slot, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newMerchant.id, newMerchant.name, newMerchant.slug, newMerchant.plan_type,
        newMerchant.setup_fee_paid, newMerchant.hardware_deposit, newMerchant.monthly_saas_fee,
        newMerchant.commission_rate, newMerchant.phone, newMerchant.emergency_phone,
        newMerchant.address, newMerchant.lat, newMerchant.lng, newMerchant.is_accredited,
        newMerchant.is_spotlight, newMerchant.has_gluten_free, newMerchant.has_lactose_free,
        newMerchant.has_vegan, newMerchant.is_partner, newMerchant.prep_delay_minutes,
        newMerchant.max_orders_per_slot, newMerchant.created_at
      ).run();
    } catch (e) {
      console.error('Error inserting merchant in D1:', e);
    }
  }

  store.merchants.unshift(newMerchant);
  saveDatabase(store);
  return newMerchant;
}

export async function updateMerchant(
  merchantId: string,
  updates: Partial<Merchant>
): Promise<Merchant | null> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const idx = store.merchants.findIndex(m => m.id === merchantId || m.slug === merchantId);
  if (idx === -1) return null;

  store.merchants[idx] = {
    ...store.merchants[idx],
    ...updates,
    is_partner: (updates.is_accredited ?? store.merchants[idx].is_accredited) === 1 ? 1 : 0
  };

  const m = store.merchants[idx];
  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        UPDATE merchants SET
          name = ?, category = ?, address = ?, phone = ?,
          is_accredited = ?, is_spotlight = ?,
          has_gluten_free = ?, has_lactose_free = ?, has_vegan = ?,
          is_partner = ?, commission_rate = ?
        WHERE id = ? OR slug = ?
      `).bind(
        m.name, m.category, m.address, m.phone,
        m.is_accredited, m.is_spotlight,
        m.has_gluten_free, m.has_lactose_free, m.has_vegan,
        m.is_partner, m.commission_rate, m.id, m.slug
      ).run();
    } catch (e) {
      console.error('Error updating merchant in D1:', e);
    }
  }

  saveDatabase(store);
  return m;
}

export async function createMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const id = itemData.id || `dish_${Date.now()}`;
  const newItem: MenuItem = {
    id,
    merchant_id: itemData.merchant_id || '',
    category: itemData.category || 'Piatti Principali',
    name: itemData.name || 'Piatto',
    description: itemData.description || '',
    price: Number(itemData.price) || 10.00,
    allergens: itemData.allergens || [],
    is_available: itemData.is_available ?? 1,
    is_alcohol: itemData.is_alcohol ?? 0,
    created_at: new Date().toISOString()
  };

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO menu_items (id, merchant_id, category, name, description, price, allergens, is_available, is_alcohol, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newItem.id, newItem.merchant_id, newItem.category, newItem.name, newItem.description || null,
        newItem.price, JSON.stringify(newItem.allergens), newItem.is_available, newItem.is_alcohol, newItem.created_at
      ).run();
    } catch (e) {
      console.error('Error creating menu item in D1:', e);
    }
  }

  store.menu_items.push(newItem);
  saveDatabase(store);
  return newItem;
}

export async function assignHardwareDevice(
  deviceId: string,
  merchantId: string,
  merchantName: string,
  depositStatus: DepositStatus = 'HELD'
): Promise<HardwareDevice> {
  await ensureDatabaseInitialized();
  const store = loadDatabase();
  const existingIdx = store.hardware_devices.findIndex(d => d.device_id === deviceId);
  const newDev: HardwareDevice = {
    device_id: deviceId,
    merchant_id: merchantId,
    merchant_name: merchantName,
    model: 'Sunmi V2s 58mm Termica',
    deposit_amount: 150.00,
    deposit_status: depositStatus,
    assigned_at: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    store.hardware_devices[existingIdx] = newDev;
  } else {
    store.hardware_devices.push(newDev);
  }

  const d1 = getCloudflareD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT OR REPLACE INTO hardware_devices (device_id, merchant_id, model, deposit_amount, deposit_status, assigned_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(newDev.device_id, newDev.merchant_id, newDev.model, newDev.deposit_amount, newDev.deposit_status, newDev.assigned_at).run();
    } catch (e) {
      console.error('Error assigning hardware in D1:', e);
    }
  }

  saveDatabase(store);
  return newDev;
}

