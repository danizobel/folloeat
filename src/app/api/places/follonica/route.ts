import { NextRequest, NextResponse } from 'next/server';
import { getMerchants, getMenuItems } from '@/lib/db';
import { Merchant } from '@/lib/types';

const FOLLONICA_CENTER = {
  lat: 42.9228,
  lng: 10.7565
};

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get('zone') || 'TUTTI';
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    // 1. Fetch real geoverified Follonica merchants from local store
    const dbMerchants = await getMerchants(zone);

    // 2. Enrich with distance and menu preview
    const enrichedResults: Array<Merchant & { menu_preview?: any[]; is_partner: number }> = [];

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

    // 3. Apply query search filter if provided
    let finalResults = enrichedResults;
    if (query) {
      finalResults = finalResults.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query) ||
          (item.zone && item.zone.toLowerCase().includes(query))
      );
    }

    // 4. Multi-level Sorting:
    // Level 1: Spotlight (Spotlight Premium, badge oro)
    // Level 2: Accredited / Partner
    // Level 3: Unaccredited Directory (ordered by distance)
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
