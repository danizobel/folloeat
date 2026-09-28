export type PlanType = 'SMART' | 'PRO';
export type DepositStatus = 'HELD' | 'REFUNDED' | 'REDEEMED';
export type PaymentMethod = 'CARD' | 'CASH';
export type CaptureStatus = 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED' | 'EXPIRED';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW';
export type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';

export interface Merchant {
  id: string;
  google_place_id?: string;
  name: string;
  slug: string;
  plan_type: PlanType;
  setup_fee_paid: number;
  hardware_deposit: number;
  monthly_saas_fee: number;
  commission_rate: number;
  stripe_account_id?: string;
  stripe_customer_id?: string;
  phone: string;
  emergency_phone?: string;
  address: string;
  lat: number;
  lng: number;
  is_partner: number; // 0 or 1
  snooze_until?: string | null;
  prep_delay_minutes: number;
  weekly_off_day?: number | null;
  vacation_start?: string | null;
  vacation_end?: string | null;
  max_orders_per_slot: number;
  created_at: string;
  // Dynamic / joined fields
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
  model: string;
  deposit_amount: number;
  deposit_status: DepositStatus;
  assigned_at: string;
}

export interface MenuItem {
  id: string;
  merchant_id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  allergens: string[]; // parsed from JSON array
  is_available: number;
  is_alcohol: number;
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
  delivery_address?: string;
  zone?: string;
  pickup_point?: string;
  total_food_amount: number;
  platform_fee: number; // 0.15
  discount_amount?: number;
  coupon_code?: string;
  total_order_amount: number;
  payment_method: PaymentMethod;
  cash_change_from?: number;
  stripe_payment_intent_id?: string;
  capture_status: CaptureStatus;
  status: OrderStatus;
  cutlery_requested: number;
  device_fingerprint?: string;
  items_json: string;
  items?: OrderItem[];
  notes?: string;
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
  coperto_fee?: number; // 0.50
  created_at: string;
}

export interface Review {
  id: string;
  merchant_id: string;
  order_id?: string;
  reservation_id?: string;
  customer_phone: string;
  rating: number; // 1-5
  tags?: string;
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
  price_charged: number;
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

export const FOLLONICA_ZONES = [
  { id: "TUTTI", name: "Tutti i Quartieri", isBeach: false },
  { id: "Centro", name: "Centro & Corso Roma", isBeach: false },
  { id: "Senzuno", name: "Senzuno & Salciaina", isBeach: false },
  { id: "Pratoranieri", name: "Pratoranieri & Litorale Nord", isBeach: false },
  { id: "Cassarello", name: "Cassarello & 167 Ovest", isBeach: false },
  { id: "Spiaggia", name: "🏖️ Sotto l'Ombrellone (Delivery in Spiaggia)", isBeach: true }
] as const;

export const FOLLONICA_BEACH_CLUBS = [
  { id: "florida", name: "Bagno Florida", zone: "Pratoranieri", address: "Viale Italia 210" },
  { id: "roma", name: "Bagno Roma", zone: "Centro", address: "Lungomare Carducci 12" },
  { id: "nettuno", name: "Bagno Nettuno", zone: "Centro", address: "Lungomare Trieste 4" },
  { id: "tangram", name: "Bagno Tangram", zone: "Senzuno", address: "Via delle Collacchie" },
  { id: "cerboli", name: "Bagno Cerboli", zone: "Pratoranieri", address: "Viale Italia 245" },
  { id: "sole", name: "Bagno Il Sole", zone: "Senzuno", address: "Spiaggia di Ponente" },
  { id: "spiaggia_libera_torre", name: "Spiaggia Libera Torre Mozza", zone: "Pratoranieri", address: "Località Torre Mozza" },
  { id: "spiaggia_libera_palafitta", name: "Spiaggia Libera Ex Palafitta", zone: "Centro", address: "Piazza a Mare" }
] as const;
