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
    is_partner INTEGER DEFAULT 0,
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
    allergens TEXT, -- JSON array (es. ["glutine", "crostacei"]) Reg. UE 1169/2011
    is_available INTEGER DEFAULT 1,
    is_alcohol INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    zone TEXT, -- 'Centro', 'Senzuno', 'Pratoranieri', 'Cassarello', 'Spiaggia'
    pickup_point TEXT, -- stabilimento balneare o landmark spiaggia
    total_food_amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0.15,
    total_order_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('CARD', 'CASH')) DEFAULT 'CARD',
    cash_change_from REAL,
    stripe_payment_intent_id TEXT,
    capture_status TEXT CHECK(capture_status IN ('AUTHORIZED', 'CAPTURED', 'CANCELLED', 'EXPIRED')) DEFAULT 'AUTHORIZED',
    status TEXT CHECK(status IN ('PENDING', 'ACCEPTED', 'DELIVERING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    cutlery_requested INTEGER DEFAULT 0,
    device_fingerprint TEXT,
    items_json TEXT, -- JSON array degli elementi ordinati con note e allergeni
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
