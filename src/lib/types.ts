export type PlanType = 'SMART' | 'PRO';
export type DepositStatus = 'HELD' | 'REFUNDED' | 'REDEEMED';
export type PaymentMethod = 'CARD' | 'CASH';
export type CaptureStatus = 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED' | 'EXPIRED';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW';
export type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
export type DietaryFilter = 'ALL' | 'GLUTEN_FREE' | 'VEGAN' | 'LACTOSE_FREE';

export interface Merchant {
  id: string;
  google_place_id?: string;
  name: string;
  slug: string;
  plan_type: PlanType;
  setup_fee_paid: number;
  hardware_deposit: number; // 150.00 for PRO, 0.00 for SMART
  monthly_saas_fee: number; // 29.00
  commission_rate: number; // 0.08
  stripe_account_id?: string;
  stripe_customer_id?: string;
  phone: string;
  emergency_phone?: string;
  address: string;
  lat: number;
  lng: number;
  
  // 3-Tier Hierarchy & Features
  is_accredited: number; // 1 = Partner Accreditato FolloEat (ordini e tavoli in-app), 0 = Solo Directory / Chiamata Diretta
  is_spotlight: number;  // 1 = Sponsorizzato Livello 1 (Spotlight Premium, badge oro, pin maggiorato, prioritario)
  
  // Dietary options badges
  has_gluten_free: number;
  has_lactose_free: number;
  has_vegan: number;

  is_partner?: number; // legacy alias for is_accredited
  is_active?: number;
  snooze_until?: string | null;
  prep_delay_minutes: number;
  weekly_off_day?: number | null; // 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
  vacation_start?: string | null;
  vacation_end?: string | null;
  max_orders_per_slot: number; // Anti-ingorgo limit (default 10 per 15 min)
  created_at: string;

  // Dynamic / UI fields
  rating?: number;
  review_count?: number;
  category?: string;
  hero_image?: string;
  delivery_time_est?: string;
  min_order?: number;
  distance_km?: number;
}

export interface HardwareDevice {
  device_id: string;
  merchant_id: string;
  merchant_name?: string;
  model: string; // Sunmi V2s
  deposit_amount: number; // 150.00
  deposit_status: DepositStatus; // HELD | REFUNDED | REDEEMED
  assigned_at: string;
}

export interface MenuItem {
  id: string;
  merchant_id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  allergens: string[]; // JSON array of 14 EU allergens
  is_available: number;
  is_alcohol: number; // 1 = 18+ check required
  created_at: string;
  image_url?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is_alcohol?: boolean;
  allergens?: string[];
  selected_options?: string[];
  item_notes?: string;
}

export interface Order {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  customer_name: string;
  customer_phone: string;
  delivery_pin?: string; // 4-digit security PIN
  delivery_address?: string;
  zone?: string;
  umbrella_number?: string;
  pickup_point?: string;
  total_food_amount: number;
  platform_fee: number; // 0.15 Contributo Digitale
  discount_amount?: number;
  coupon_code?: string;
  total_order_amount: number;
  payment_method: PaymentMethod;
  cash_change_from?: number; // e.g. 50 if customer pays with €50 banknote
  stripe_payment_intent_id?: string;
  capture_status: CaptureStatus;
  status: OrderStatus;
  cutlery_requested: number; // 0 default, 1 if eco-opt-in
  has_alcohol?: number;
  device_fingerprint?: string;
  items_json: string;
  items?: OrderItem[];
  notes?: string;
  follo_points_earned?: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_time: string;
  confirmation_status: ReservationStatus;
  is_fast_seating?: boolean;
  coperto_fee?: number; // 0.50 a coperto
  created_at: string;
}

export interface Review {
  id: string;
  merchant_id: string;
  order_id?: string;
  reservation_id?: string;
  customer_phone: string;
  rating: number; // 1-5
  tags?: string; // JSON array of badges (es. ['Cibo caldo', 'Puntualità'])
  comment?: string;
  created_at: string;
}

export interface SponsoredNotification {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  title: string;
  body: string;
  target_zone: string;
  scheduled_at: string;
  sent_at?: string;
  price_charged: number; // 19.00 single or 59.00 bundle
  clicks_count?: number;
  status: NotificationStatus;
  created_at: string;
}

// 14 EU Allergens according to Reg. UE 1169/2011
export const EU_ALLERGENS = [
  { id: "glutine", label: "Cereali contenenti Glutine", code: "GLU" },
  { id: "crostacei", label: "Crostacei e derivati", code: "CRO" },
  { id: "uova", label: "Uova e derivati", code: "UOV" },
  { id: "pesce", label: "Pesce e derivati", code: "PES" },
  { id: "arachidi", label: "Arachidi e derivati", code: "ARA" },
  { id: "soia", label: "Soia e derivati", code: "SOI" },
  { id: "latte", label: "Latte e latticini (incluso lattosio)", code: "LAT" },
  { id: "frutta_guscio", label: "Frutta a guscio", code: "FGU" },
  { id: "sedano", label: "Sedano e derivati", code: "SED" },
  { id: "senape", label: "Senape e derivati", code: "SEN" },
  { id: "sesamo", label: "Semi di sesamo e derivati", code: "SES" },
  { id: "solfiti", label: "Anidride solforosa e solfiti (>10mg/kg)", code: "SOL" },
  { id: "lupini", label: "Lupini e derivati", code: "LUP" },
  { id: "molluschi", label: "Molluschi e derivati", code: "MOL" }
] as const;

// Official Follonica Zones (Master v4.1)
export const FOLLONICA_ZONES = [
  { id: "TUTTI", name: "Tutti i Quartieri", isBeach: false },
  { id: "Centro", name: "Centro Storico / Via Roma", isBeach: false },
  { id: "Senzuno", name: "Senzuno & Salciaina", isBeach: false },
  { id: "Pratoranieri", name: "Pratoranieri & Litorale Nord", isBeach: false },
  { id: "Cassarello", name: "Cassarello & 167 Ovest", isBeach: false },
  { id: "San Luigi", name: "San Luigi & Corti Nuove", isBeach: false },
  { id: "Campi Alti", name: "Campi Alti al Mare", isBeach: false },
  { id: "Zona 167", name: "Zona 167 Est & Parco Centrale", isBeach: false },
  { id: "Spiaggia", name: "🏖️ Sotto l'Ombrellone (Delivery in Spiaggia)", isBeach: true }
] as const;

// Official Beach Delivery Destinations & Designated Pick-up Points (Master v4.1)
export const FOLLONICA_BEACH_POINTS = [
  // Stabilimenti balneari con n° ombrellone e Pick-up Point reception
  { id: "ausonia", name: "Stabilimento Balneare Ausonia", type: "LIDO", zone: "Centro", address: "Lungomare Carducci", pickup: "Reception / Ingresso Lido Ausonia", hasUmbrella: true },
  { id: "cerboli", name: "Bagno Cerboli", type: "LIDO", zone: "Pratoranieri", address: "Viale Italia 245", pickup: "Ingresso principale Chiosco Cerboli", hasUmbrella: true },
  { id: "florida", name: "Bagno Florida", type: "LIDO", zone: "Pratoranieri", address: "Viale Italia 210", pickup: "Punto di incontro Ingresso Bagno Florida", hasUmbrella: true },
  { id: "nettuno", name: "Bagno Nettuno", type: "LIDO", zone: "Centro", address: "Lungomare Trieste 4", pickup: "Chiosco Bar Bagno Nettuno", hasUmbrella: true },
  { id: "africa", name: "Bagno Africa Beach", type: "LIDO", zone: "Pratoranieri", address: "Viale Italia 310", pickup: "Ingresso Africa Beach Gazebo", hasUmbrella: true },
  { id: "tartana", name: "Bagno Tartana Club", type: "LIDO", zone: "Senzuno", address: "Piazza a Mare / Pineta", pickup: "Cancello ingresso Tartana", hasUmbrella: true },
  
  // Spiagge libere con landmark ufficiali e coordinate GPS Pick-up Point
  { id: "colonia", name: "Spiaggia Libera La Colonia", type: "SPIAGGIA_LIBERA", zone: "Senzuno", address: "Ex Colonia Marina (GPS 42.9150, 10.7590)", pickup: "Pick-up Point Cancello Ex Colonia", hasUmbrella: false },
  { id: "tonys", name: "Spiaggia Libera Tony's Beach", type: "SPIAGGIA_LIBERA", zone: "Pratoranieri", address: "Piazzale delle Dune (GPS 42.9410, 10.7380)", pickup: "Pick-up Point Chiosco Parcheggio Tony", hasUmbrella: false },
  { id: "foce_pecora", name: "Spiaggia Foce Pecora / Fiumara", type: "SPIAGGIA_LIBERA", zone: "Pratoranieri", address: "Foce del Torrente Pecora (GPS 42.9480, 10.7310)", pickup: "Pick-up Point Ponticello di Legno Foce", hasUmbrella: false },
  { id: "dune", name: "Spiaggia Le Dune di Pratoranieri", type: "SPIAGGIA_LIBERA", zone: "Pratoranieri", address: "Accesso Passerella Dune (GPS 42.9430, 10.7350)", pickup: "Pick-up Point Inizio Passerella Legno", hasUmbrella: false }
] as const;

export const FOLLONICA_BEACH_CLUBS = FOLLONICA_BEACH_POINTS;

