import { NextRequest, NextResponse } from 'next/server';

import { getMerchants, getMenuItems } from '@/lib/db';
import { Merchant } from '@/lib/types';

const FOLLONICA_CENTER = {
  lat: 42.9248,
  lng: 10.7588
};

// Verified local Follonica dining establishments for fallback/curated discovery
const KNOWN_FOLLONICA_PLACES = [
  {
    id: "osm_sottomarino",
    name: "Ristorante Il Sottomarino",
    address: "Via Bicocchi 40, 58022 Follonica (GR)",
    lat: 42.9240,
    lng: 10.7570,
    category: "Ristorante Pesce Tradizionale",
    amenity: "restaurant"
  },
  {
    id: "osm_osteria_nascosta",
    name: "Osteria Nascosta",
    address: "Via Fratti 18, 58022 Follonica (GR)",
    lat: 42.9232,
    lng: 10.7592,
    category: "Cucina Tipica Maremmana & Vini",
    amenity: "restaurant"
  },
  {
    id: "osm_piccolo_mondo",
    name: "Pizzeria Piccolo Mondo",
    address: "Viale Italia 48, 58022 Follonica (GR)",
    lat: 42.9275,
    lng: 10.7521,
    category: "Pizzeria & Cucina",
    amenity: "pizzeria"
  },
  {
    id: "osm_chiosco_pineta",
    name: "Chiosco Bar Pineta Ponente",
    address: "Pineta di Ponente, 58022 Follonica (GR)",
    lat: 42.9290,
    lng: 10.7495,
    category: "Bar & Panini Sotto la Pineta",
    amenity: "bar"
  },
  {
    id: "osm_peggi_pasticceria",
    name: "Pasticceria Peggi dal 1968",
    address: "Via Roma 102, 58022 Follonica (GR)",
    lat: 42.9262,
    lng: 10.7565,
    category: "Pasticceria & Gelateria Artigianale",
    amenity: "cafe"
  },
  {
    id: "osm_lord_pub",
    name: "Il Piccolo Lord Pub",
    address: "Via Merloni 5, 58022 Follonica (GR)",
    lat: 42.9239,
    lng: 10.7601,
    category: "Pub & Hamburgeria Serale",
    amenity: "bar"
  }
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

async function fetchFromOverpass(): Promise<any[]> {
  const overpassQuery = `[out:json][timeout:10];
    (
      node["amenity"~"restaurant|pizzeria|fast_food|bar"](42.9100,10.7300,42.9450,10.7850);
      way["amenity"~"restaurant|pizzeria|fast_food|bar"](42.9100,10.7300,42.9450,10.7850);
    );
    out center 25;`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    return data.elements || [];
  } catch {
    // If Overpass is offline or timeout, transparent fallback to verified list
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get('zone') || 'TUTTI';
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    // 1. Fetch partner merchants from D1 database
    const dbMerchants = await getMerchants(zone);

    // 2. Fetch external places from Google Places (if configured) or Overpass OSM
    let externalPlaces: any[] = [];
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (googleApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${FOLLONICA_CENTER.lat},${FOLLONICA_CENTER.lng}&radius=3500&type=restaurant&key=${googleApiKey}`;
        const gRes = await fetch(googleUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          externalPlaces = (gData.results || []).map((p: any) => ({
            id: p.place_id,
            name: p.name,
            address: p.vicinity || 'Follonica (GR)',
            lat: p.geometry?.location?.lat || FOLLONICA_CENTER.lat,
            lng: p.geometry?.location?.lng || FOLLONICA_CENTER.lng,
            category: p.types?.[0] || 'Ristorante',
            google_place_id: p.place_id
          }));
        }
      } catch {
        // Fallback to OSM
      }
    }

    if (externalPlaces.length === 0) {
      const overpassElements = await fetchFromOverpass();
      if (overpassElements.length > 0) {
        externalPlaces = overpassElements
          .filter(el => el.tags && el.tags.name)
          .map(el => {
            const lat = el.lat || el.center?.lat || FOLLONICA_CENTER.lat;
            const lng = el.lon || el.center?.lon || FOLLONICA_CENTER.lng;
            return {
              id: `osm_${el.id}`,
              name: el.tags.name,
              address: `${el.tags['addr:street'] ? el.tags['addr:street'] + ' ' + (el.tags['addr:housenumber'] || '') + ', ' : ''}58022 Follonica (GR)`,
              lat,
              lng,
              category: el.tags.cuisine ? `Cucina ${el.tags.cuisine}` : (el.tags.amenity || 'Ristorante'),
              amenity: el.tags.amenity
            };
          });
      }
    }

    // Merge with known curated Follonica places if still low
    if (externalPlaces.length === 0) {
      externalPlaces = [...KNOWN_FOLLONICA_PLACES];
    }

    // 3. Cross-reference with D1 merchants
    const enrichedResults: Array<Merchant & { menu_preview?: any[]; is_partner: number }> = [];

    // First add all partner merchants
    for (const m of dbMerchants) {
      const menu = await getMenuItems(m.id);
      const distance = calculateDistanceKm(FOLLONICA_CENTER.lat, FOLLONICA_CENTER.lng, m.lat, m.lng);

      enrichedResults.push({
        ...m,
        is_partner: (m.is_accredited === 1 || m.is_partner === 1) ? 1 : 0,
        distance_km: distance,
        menu_preview: menu.slice(0, 3)
      });
    }

    // Next add non-partner places from external discovery
    for (const ext of externalPlaces) {
      // Check if place is already registered as partner
      const isAlreadyPartner = dbMerchants.some(
        m => m.name.toLowerCase() === ext.name.toLowerCase() ||
             (m.google_place_id && m.google_place_id === ext.google_place_id)
      );

      if (!isAlreadyPartner) {
        const distance = calculateDistanceKm(FOLLONICA_CENTER.lat, FOLLONICA_CENTER.lng, ext.lat, ext.lng);

        // Apply zone filter if set
        if (zone !== 'TUTTI') {
          const matchZone = ext.address.toLowerCase().includes(zone.toLowerCase()) || ext.name.toLowerCase().includes(zone.toLowerCase());
          if (!matchZone) continue;
        }

        enrichedResults.push({
          id: ext.id,
          google_place_id: ext.google_place_id,
          name: ext.name,
          slug: ext.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          plan_type: 'SMART',
          setup_fee_paid: 0,
          hardware_deposit: 0,
          monthly_saas_fee: 0,
          commission_rate: 0.08,
          phone: "+39 0566 40000",
          address: ext.address,
          lat: ext.lat,
          lng: ext.lng,
          is_accredited: 0, // Livello 3: Solo directory
          is_spotlight: 0,
          has_gluten_free: 0,
          has_lactose_free: 0,
          has_vegan: 0,
          is_partner: 0, // Unpartnered
          prep_delay_minutes: 0,
          max_orders_per_slot: 10,
          created_at: new Date().toISOString(),
          category: ext.category || 'Ristorante Locale',
          distance_km: distance,
          rating: 4.2
        });
      }
    }

    // 4. Apply query search filter if provided
    let finalResults = enrichedResults;
    if (query) {
      finalResults = finalResults.filter(
        item => item.name.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                item.address.toLowerCase().includes(query)
      );
    }

    // Master v4.1: Algoritmo di Ordinamento Multilivello
    // 1. Livello 1: SPONSORIZZATI (Spotlight Premium) in cima assoluta
    // 2. Livello 2: ACCREDITATI / PARTNER FOLLOEAT (Piano SMART o PRO)
    // 3. Livello 3: NON ACCREDITATI / DIRECTORY DIRETTA (in coda, ordinati per distanza)
    finalResults.sort((a, b) => {
      const aSpotlight = a.is_spotlight || 0;
      const bSpotlight = b.is_spotlight || 0;
      if (aSpotlight !== bSpotlight) {
        return bSpotlight - aSpotlight;
      }

      const aAcc = a.is_accredited !== undefined ? a.is_accredited : (a.is_partner || 0);
      const bAcc = b.is_accredited !== undefined ? b.is_accredited : (b.is_partner || 0);
      if (aAcc !== bAcc) {
        return bAcc - aAcc;
      }

      return (a.distance_km || 0) - (b.distance_km || 0);
    });


    return NextResponse.json({
      success: true,
      center: FOLLONICA_CENTER,
      total: finalResults.length,
      partners_count: finalResults.filter(r => r.is_partner === 1).length,
      places: finalResults
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
