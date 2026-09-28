import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { getMerchantBySlug, getMenuItems, getOrders, updateMerchantSnooze } from '@/lib/db';
import { getKV } from '@/lib/kv';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const merchant = await getMerchantBySlug(slug);

    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Locale non trovato' }, { status: 404 });
    }

    const kv = getKV();
    const kvSnooze = await kv.get(`merchant_snooze_${merchant.id}`);
    const kvDelay = await kv.get(`merchant_delay_${merchant.id}`);

    const menu = await getMenuItems(merchant.id);
    const orders = await getOrders(merchant.id);

    // Calculate current slot load (orders in the last 15 minutes) for anti-ingorgo
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recentSlotOrders = orders.filter(
      o => o.created_at >= fifteenMinutesAgo && o.status !== 'CANCELLED'
    );
    const isSlotBlocked = recentSlotOrders.length >= merchant.max_orders_per_slot;

    // Check effective snooze
    const isCurrentlySnoozed = kvSnooze ? new Date(kvSnooze) > new Date() : (merchant.snooze_until ? new Date(merchant.snooze_until) > new Date() : false);
    const effectivePrepDelay = kvDelay ? parseInt(kvDelay, 10) : merchant.prep_delay_minutes;

    return NextResponse.json({
      success: true,
      merchant: {
        ...merchant,
        snooze_until: isCurrentlySnoozed ? (kvSnooze || merchant.snooze_until) : null,
        prep_delay_minutes: effectivePrepDelay
      },
      menu,
      orders,
      anti_ingorgo: {
        current_orders_in_slot: recentSlotOrders.length,
        max_orders_per_slot: merchant.max_orders_per_slot,
        is_slot_blocked: isSlotBlocked
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const merchant = await getMerchantBySlug(slug);

    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Locale non trovato' }, { status: 404 });
    }

    const body = await req.json();
    const { action, duration_minutes, delay_minutes } = body;
    const kv = getKV();

    let newSnoozeUntil: string | null = null;
    let newPrepDelay = merchant.prep_delay_minutes;

    if (action === 'SNOOZE') {
      const minutes = duration_minutes || 30;
      const until = new Date(Date.now() + minutes * 60 * 1000);
      newSnoozeUntil = until.toISOString();
      await kv.put(`merchant_snooze_${merchant.id}`, newSnoozeUntil, { expirationTtl: minutes * 60 });
    } else if (action === 'CANCEL_SNOOZE') {
      newSnoozeUntil = null;
      await kv.delete(`merchant_snooze_${merchant.id}`);
    } else if (action === 'SET_DELAY') {
      newPrepDelay = Number(delay_minutes) || 20;
      await kv.put(`merchant_delay_${merchant.id}`, String(newPrepDelay), { expirationTtl: 3600 });
    } else if (action === 'RESET_DELAY') {
      newPrepDelay = 0;
      await kv.delete(`merchant_delay_${merchant.id}`);
    }

    const updated = await updateMerchantSnooze(merchant.id, newSnoozeUntil, newPrepDelay);

    return NextResponse.json({
      success: true,
      message: 'Impostazioni panic button aggiornate e propagate su Cloudflare KV con successo.',
      merchant: updated
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
