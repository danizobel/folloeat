import { Merchant, HardwareDevice, MenuItem, Order, Reservation, Review, SponsoredNotification } from './types';

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: "m_michele_01",
    google_place_id: "ChIJ_follonica_michele_01",
    name: "Pizzeria Da Michele & Figli",
    slug: "pizzeria-da-michele",
    plan_type: "PRO",
    setup_fee_paid: 199.00,
    hardware_deposit: 150.00,
    monthly_saas_fee: 29.00,
    commission_rate: 0.08,
    stripe_account_id: "acct_michele_follonica",
    phone: "+39 0566 263100",
    emergency_phone: "+39 347 1234567",
    address: "Via della Repubblica 45, 58022 Follonica (GR)",
    lat: 42.9205,
    lng: 10.7530,
    is_partner: 1,
    snooze_until: null,
    prep_delay_minutes: 0,
    weekly_off_day: 2, // Tuesday
    vacation_start: null,
    vacation_end: null,
    max_orders_per_slot: 12,
    created_at: "2024-03-01T10:00:00Z",
    rating: 4.8,
    review_count: 142,
    category: "Pizzeria Napoletana & Friggitoria",
    hero_image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    delivery_time_est: "25-35 min",
    min_order: 12.00
  },
  {
    id: "m_poldo_02",
    google_place_id: "ChIJ_follonica_poldo_02",
    name: "Da Poldo Food & Love",
    slug: "da-poldo",
    plan_type: "PRO",
    setup_fee_paid: 199.00,
    hardware_deposit: 150.00,
    monthly_saas_fee: 29.00,
    commission_rate: 0.08,
    stripe_account_id: "acct_poldo_follonica",
    phone: "+39 0566 41250",
    emergency_phone: "+39 340 7654321",
    address: "Via Guglielmo Marconi 18, 58022 Follonica (GR)",
    lat: 42.9240,
    lng: 10.7570,
    is_partner: 1,
    snooze_until: null,
    prep_delay_minutes: 0,
    weekly_off_day: 1, // Monday
    vacation_start: null,
    vacation_end: null,
    max_orders_per_slot: 15,
    created_at: "2024-03-10T11:00:00Z",
    rating: 4.9,
    review_count: 320,
    category: "Paninoteca Artigianale & Burger Gourmet",
    hero_image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    delivery_time_est: "20-30 min",
    min_order: 15.00
  },
  {
    id: "m_florida_03",
    google_place_id: "ChIJ_follonica_florida_03",
    name: "Bagno Florida Ristorante sul Mare",
    slug: "bagno-florida",
    plan_type: "PRO",
    setup_fee_paid: 199.00,
    hardware_deposit: 150.00,
    monthly_saas_fee: 29.00,
    commission_rate: 0.08,
    stripe_account_id: "acct_florida_follonica",
    phone: "+39 0566 260055",
    emergency_phone: "+39 335 9876543",
    address: "Viale Italia 210, 58022 Follonica (GR)",
    lat: 42.9360,
    lng: 10.7420,
    is_partner: 1,
    snooze_until: null,
    prep_delay_minutes: 0,
    weekly_off_day: 3, // Wednesday
    vacation_start: null,
    vacation_end: null,
    max_orders_per_slot: 10,
    created_at: "2024-03-15T09:30:00Z",
    rating: 4.7,
    review_count: 189,
    category: "Ristorante Pesce Fresco & Delivery Ombrellone",
    hero_image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    delivery_time_est: "30-40 min",
    min_order: 20.00
  }
];

export const INITIAL_HARDWARE_DEVICES: HardwareDevice[] = [
  {
    device_id: "SNM-V2S-FOLLO-001",
    merchant_id: "m_michele_01",
    merchant_name: "Pizzeria Da Michele & Figli",
    model: "Sunmi V2s",
    deposit_amount: 150.00,
    deposit_status: "HELD",
    assigned_at: "2024-03-02T14:00:00Z"
  },
  {
    device_id: "SNM-V2S-FOLLO-002",
    merchant_id: "m_poldo_02",
    merchant_name: "Da Poldo Food & Love",
    model: "Sunmi V2s",
    deposit_amount: 150.00,
    deposit_status: "HELD",
    assigned_at: "2024-03-11T16:30:00Z"
  },
  {
    device_id: "SNM-V2S-FOLLO-003",
    merchant_id: "m_florida_03",
    merchant_name: "Bagno Florida Ristorante sul Mare",
    model: "Sunmi V2s",
    deposit_amount: 150.00,
    deposit_status: "HELD",
    assigned_at: "2024-03-16T10:15:00Z"
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Pizzeria Da Michele & Figli
  {
    id: "mi_mich_01",
    merchant_id: "m_michele_01",
    category: "Pizze Classiche",
    name: "Margherita Verace DOC",
    description: "Pomodoro San Marzano DOP, Mozzarella di Bufala Campana DOP, basilico fresco, olio EVO toscano",
    price: 8.50,
    allergens: ["glutine", "latte"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_mich_02",
    merchant_id: "m_michele_01",
    category: "Pizze Speciali",
    name: "Diavola Maremmana Fuoco Vivo",
    description: "Pomodoro San Marzano, fior di latte, salamino piccante toscano, 'nduja di Spilinga, peperoncino fresco",
    price: 10.50,
    allergens: ["glutine", "latte"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_mich_03",
    merchant_id: "m_michele_01",
    category: "Pizze Speciali",
    name: "Calzone Farcito Maremma",
    description: "Ricotta fresca di pecora, fior di latte, prosciutto cotto alta qualità, funghi porcini trifolati",
    price: 11.00,
    allergens: ["glutine", "latte"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_mich_04",
    merchant_id: "m_michele_01",
    category: "Fritti & Sfizi",
    name: "Frittura di Calamari & Paranza del Golfo",
    description: "Calamaretti e paranza fresca infarinati e fritti al momento, serviti con maionese al limone",
    price: 14.00,
    allergens: ["glutine", "pesce", "molluschi", "uova"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_mich_05",
    merchant_id: "m_michele_01",
    category: "Fritti & Sfizi",
    name: "Supplí alla Romana Classico (2 pezzi)",
    description: "Riso al ragù lento di carne, cuore di mozzarella filante, impanatura dorata croccante",
    price: 4.50,
    allergens: ["glutine", "latte", "uova", "sedano"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z"
  },
  {
    id: "mi_mich_06",
    merchant_id: "m_michele_01",
    category: "Bevande & Birre",
    name: "Birra Moretti Baffo d'Oro 66cl",
    description: "Lager premium 100% malto d'orzo italiano, gradazione 4.8% vol. Servita fredda di cella.",
    price: 4.50,
    allergens: ["glutine"],
    is_available: 1,
    is_alcohol: 1,
    created_at: "2024-03-01T10:00:00Z"
  },
  {
    id: "mi_mich_07",
    merchant_id: "m_michele_01",
    category: "Bevande & Birre",
    name: "Acqua Minerale Naturale 50cl",
    description: "Acqua delle sorgenti toscane in bottiglia di vetro",
    price: 1.50,
    allergens: [],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-01T10:00:00Z"
  },

  // Maremma Smash Burger
  {
    id: "mi_smash_01",
    merchant_id: "m_poldo_02",
    category: "Smash Burgers",
    name: "Smash Chianina IGP Classic",
    description: "Doppio patty 2x100g di Chianina IGP certificata, American cheddar originale fuso, cipolla caramellata di Certaldo, salsa segreta Follo, brioche bun artigianale tostato al burro",
    price: 12.50,
    allergens: ["glutine", "latte", "uova", "senape"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_smash_02",
    merchant_id: "m_poldo_02",
    category: "Smash Burgers",
    name: "Bacon Maremmano Croccante",
    description: "Doppio patty Chianina IGP, quadruplo bacon toscano croccante affumicato al legno di faggio, doppio cheddar, salsa BBQ artigianale",
    price: 13.90,
    allergens: ["glutine", "latte", "uova", "senape"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z",
    image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_smash_03",
    merchant_id: "m_poldo_02",
    category: "Smash Burgers",
    name: "Truffle & Pecorino Toscano DOP",
    description: "Doppio patty Chianina, fonduta vellutata di Pecorino Toscano DOP stagionato, salsa tartufata dei boschi maremmani, rucola selvatica",
    price: 14.50,
    allergens: ["glutine", "latte", "uova"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z"
  },
  {
    id: "mi_smash_04",
    merchant_id: "m_poldo_02",
    category: "Side & Fries",
    name: "Patate Rustiche con Buccia e Rosmarino",
    description: "Patate toscane a spicchi dorate con sale grosso di salina e rosmarino fresco",
    price: 4.50,
    allergens: [],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z"
  },
  {
    id: "mi_smash_05",
    merchant_id: "m_poldo_02",
    category: "Side & Fries",
    name: "Nuggets di Pollo Toscano (6 pezzi)",
    description: "Bocconcini di petto di pollo allevato a terra impanati nei corn-flakes, serviti con maionese al pepe nero",
    price: 6.50,
    allergens: ["glutine", "uova"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z"
  },
  {
    id: "mi_smash_06",
    merchant_id: "m_poldo_02",
    category: "Birre Artigianali & Soft",
    name: "Birra Ichnusa Non Filtrata 50cl",
    description: "Lager bionda corposa non filtrata a bassa fermentazione, 5.0% vol.",
    price: 4.80,
    allergens: ["glutine"],
    is_available: 1,
    is_alcohol: 1,
    created_at: "2024-03-10T11:00:00Z"
  },
  {
    id: "mi_smash_07",
    merchant_id: "m_poldo_02",
    category: "Birre Artigianali & Soft",
    name: "Coca Cola Zero 33cl",
    description: "In lattina fredda",
    price: 2.80,
    allergens: [],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-10T11:00:00Z"
  },

  // Bagno Florida Ristorante sul Mare
  {
    id: "mi_flor_01",
    merchant_id: "m_florida_03",
    category: "Primi di Mare",
    name: "Spaghetto alle Vongole Veraci & Bottarga",
    description: "Spaghetti trafilati al bronzo con vongole veraci pescate nel Tirreno, prezzemolo fresco, aglio dolce e pioggia di bottarga di Orbetello",
    price: 16.50,
    allergens: ["glutine", "molluschi", "pesce"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-15T09:30:00Z",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_flor_02",
    merchant_id: "m_florida_03",
    category: "Secondi di Mare",
    name: "Gran Fritto del Golfo di Follonica",
    description: "Gamberi rosa, calamaretti locali, trigliette e verdure croccanti in tempura leggera, servito caldissimo",
    price: 18.00,
    allergens: ["glutine", "crostacei", "molluschi", "pesce"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-15T09:30:00Z",
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "mi_flor_03",
    merchant_id: "m_florida_03",
    category: "Antipasti",
    name: "Tartare di Tonno Rosso agli Agrumi Maremmani",
    description: "Tonno rosso pinne gialle battuto al coltello, emulsione di arancia amara e limone di costa, finocchietto selvatico e cialda di riso",
    price: 15.00,
    allergens: ["pesce"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-15T09:30:00Z"
  },
  {
    id: "mi_flor_04",
    merchant_id: "m_florida_03",
    category: "Secondi di Mare",
    name: "Calamaro scottato su Vellutata di Ceci",
    description: "Calamaro locale scottato alla piastra con timo serpillo su passatina di ceci toscani e olio al rosmarino",
    price: 16.00,
    allergens: ["molluschi"],
    is_available: 1,
    is_alcohol: 0,
    created_at: "2024-03-15T09:30:00Z"
  },
  {
    id: "mi_flor_05",
    merchant_id: "m_florida_03",
    category: "Vini & Bollicine",
    name: "Vermentino Maremma Toscana DOC 'La Pieve' 75cl",
    description: "Vino bianco fresco, sapido e minerale con note floreali di macchia mediterranea. Cantina locale, 13% vol.",
    price: 18.00,
    allergens: ["solfiti"],
    is_available: 1,
    is_alcohol: 1,
    created_at: "2024-03-15T09:30:00Z"
  },
  {
    id: "mi_flor_06",
    merchant_id: "m_florida_03",
    category: "Vini & Bollicine",
    name: "Prosecco Superiore Valdobbiadene DOCG 75cl",
    description: "Millesimato Brut spumantizzato, fine perlage, note di mela verde e fiori d'acacia. 11.5% vol.",
    price: 22.00,
    allergens: ["solfiti"],
    is_available: 1,
    is_alcohol: 1,
    created_at: "2024-03-15T09:30:00Z"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2024-1001",
    merchant_id: "m_michele_01",
    merchant_name: "Pizzeria Da Michele & Figli",
    customer_name: "Marco Rossi",
    customer_phone: "+39 333 1122334",
    delivery_address: "Via Bicocchi 28, Piano 2, Follonica",
    zone: "Centro",
    total_food_amount: 27.50,
    platform_fee: 0.15,
    total_order_amount: 27.65,
    payment_method: "CARD",
    stripe_payment_intent_id: "pi_test_michele_1001",
    capture_status: "CAPTURED",
    status: "ACCEPTED",
    cutlery_requested: 0,
    items_json: JSON.stringify([
      { id: "mi_mich_01", name: "Margherita Verace DOC", price: 8.50, quantity: 2, allergens: ["glutine", "latte"] },
      { id: "mi_mich_02", name: "Diavola Maremmana Fuoco Vivo", price: 10.50, quantity: 1, allergens: ["glutine", "latte"] }
    ]),
    notes: "Citofono Rossi - interno 4. Consegna al portone.",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-2024-1002",
    merchant_id: "m_florida_03",
    merchant_name: "Bagno Florida Ristorante sul Mare",
    customer_name: "Giulia Bianchi",
    customer_phone: "+39 349 9988776",
    delivery_address: "Bagno Florida - Spiaggia",
    zone: "Spiaggia",
    pickup_point: "Ombrellone n° 42 (Fila 3, Settore Centrale)",
    total_food_amount: 52.50,
    platform_fee: 0.15,
    total_order_amount: 52.65,
    payment_method: "CARD",
    stripe_payment_intent_id: "pi_test_florida_1002",
    capture_status: "AUTHORIZED",
    status: "PENDING",
    cutlery_requested: 1,
    items_json: JSON.stringify([
      { id: "mi_flor_01", name: "Spaghetto alle Vongole Veraci & Bottarga", price: 16.50, quantity: 2, allergens: ["glutine", "molluschi", "pesce"] },
      { id: "mi_flor_05", name: "Vermentino Maremma Toscana DOC 'La Pieve' 75cl", price: 18.00, quantity: 1, is_alcohol: true, allergens: ["solfiti"] },
      { id: "mi_mich_07", name: "Acqua Minerale Naturale 50cl", price: 1.50, quantity: 1 }
    ]),
    notes: "Portare all'ombrellone con glacette per il Vermentino per favore!",
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: "ORD-2024-1003",
    merchant_id: "m_poldo_02",
    merchant_name: "Da Poldo Food & Love",
    customer_name: "Leonardo Fabbri",
    customer_phone: "+39 328 5544332",
    delivery_address: "Via delle Collacchie 14, Senzuno",
    zone: "Senzuno",
    total_food_amount: 35.70,
    platform_fee: 0.15,
    total_order_amount: 35.85,
    payment_method: "CASH",
    cash_change_from: 50.00,
    capture_status: "AUTHORIZED",
    status: "PENDING",
    cutlery_requested: 0,
    items_json: JSON.stringify([
      { id: "mi_smash_01", name: "Smash Chianina IGP Classic", price: 12.50, quantity: 2, allergens: ["glutine", "latte", "uova"] },
      { id: "mi_smash_04", name: "Patate Rustiche con Buccia e Rosmarino", price: 4.50, quantity: 1 },
      { id: "mi_smash_06", name: "Birra Ichnusa Non Filtrata 50cl", price: 4.80, quantity: 1, is_alcohol: true },
      { id: "mi_smash_07", name: "Coca Cola Zero 33cl", price: 2.80, quantity: 1 }
    ]),
    notes: "Ho banconota da 50€, serve resto da 14,15€.",
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString()
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "RES-2024-001",
    merchant_id: "m_florida_03",
    merchant_name: "Bagno Florida Ristorante sul Mare",
    customer_name: "Matteo Ceccherini",
    customer_phone: "+39 348 7766554",
    party_size: 4,
    reservation_time: "2024-07-20T21:45:00Z",
    confirmation_status: "CONFIRMED",
    is_fast_seating: true,
    coperto_fee: 0.50,
    created_at: "2024-07-20T19:10:00Z"
  },
  {
    id: "RES-2024-002",
    merchant_id: "m_florida_03",
    merchant_name: "Bagno Florida Ristorante sul Mare",
    customer_name: "Elena Vanni",
    customer_phone: "+39 339 4433221",
    party_size: 2,
    reservation_time: "2024-07-20T22:00:00Z",
    confirmation_status: "CONFIRMED",
    is_fast_seating: true,
    coperto_fee: 0.50,
    created_at: "2024-07-20T20:05:00Z"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev_01",
    merchant_id: "m_michele_01",
    order_id: "ORD-2024-1001",
    customer_phone: "+39 333 1122334",
    rating: 5,
    tags: "Pizza calda, Consegna velocissima, Impasto leggero",
    comment: "La miglior pizza di tutta Follonica. Consegna puntualissima a Senzuno e cornicione morbidissimo!",
    created_at: "2024-07-19T21:30:00Z"
  },
  {
    id: "rev_02",
    merchant_id: "m_poldo_02",
    customer_phone: "+39 328 5544332",
    rating: 5,
    tags: "Carne di Chianina favolosa, Croccantezza top",
    comment: "I panini e gli hamburger di Da Poldo a Follonica sono una certezza assoluta. Pane artigianale e ingredienti freschissimi!",
    created_at: "2024-07-18T22:15:00Z"
  },
  {
    id: "rev_03",
    merchant_id: "m_florida_03",
    customer_phone: "+39 349 9988776",
    rating: 5,
    tags: "Spaghetti alle vongole superlativi, Vista mare",
    comment: "Mangiare lo spaghetto alle vongole direttamente sotto l'ombrellone al tramonto non ha prezzo!",
    created_at: "2024-07-17T14:40:00Z"
  }
];

export const INITIAL_NOTIFICATIONS: SponsoredNotification[] = [
  {
    id: "notif_01",
    merchant_id: "m_poldo_02",
    merchant_name: "Da Poldo Food & Love",
    title: "🍔 Stasera Special Smash Maremmano al Tartufo!",
    body: "Solo per stasera a Follonica: Smash Chianina DOP con Pecorino e Tartufo fresco. Ordina subito!",
    target_zone: "ALL",
    scheduled_at: "2024-07-20T18:30:00Z",
    sent_at: "2024-07-20T18:30:00Z",
    price_charged: 19.00,
    status: "SENT",
    created_at: "2024-07-20T10:00:00Z"
  }
];
