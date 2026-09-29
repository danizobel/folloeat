import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

import { getSponsoredNotifications, createSponsoredNotification } from '@/lib/db';

export async function GET() {
  try {
    const notifications = await getSponsoredNotifications();
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchant_id, title, body: notifBody, target_zone, price_charged } = body;

    if (!merchant_id || !title || !notifBody) {
      return NextResponse.json({ success: false, error: 'Dati notifica incompleti.' }, { status: 400 });
    }

    const notif = await createSponsoredNotification({
      merchant_id,
      title,
      body: notifBody,
      target_zone: target_zone || 'ALL',
      price_charged: Number(price_charged) || 19.00
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
