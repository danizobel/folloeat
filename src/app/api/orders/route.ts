import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { createOrder, getOrders } from '@/lib/db';
import { OrderItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchant_id') || undefined;
    const orders = await getOrders(merchantId);
    return NextResponse.json({ success: true, count: orders.length, orders });
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
    const {
      merchant_id,
      customer_name,
      customer_phone,
      delivery_address,
      zone,
      pickup_point,
      items,
      payment_method,
      cash_change_from,
      cutlery_requested,
      coupon_code,
      notes
    } = body;

    // Validations
    if (!merchant_id) {
      return NextResponse.json({ success: false, error: 'Identificativo locale mancante.' }, { status: 400 });
    }
    if (!customer_name || !customer_phone) {
      return NextResponse.json({ success: false, error: 'Nome e cellulare sono obbligatori per il tracking dell\'ordine.' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Il carrello è vuoto.' }, { status: 400 });
    }

    // Cash payment validation
    if (payment_method === 'CASH') {
      if (!cash_change_from || Number(cash_change_from) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Per i pagamenti in contanti è obbligatorio specificare la banconota con cui pagherai per preparare il resto esatto.'
        }, { status: 400 });
      }
    }

    // Calculate food subtotal
    let totalFood = 0;
    let hasAlcohol = false;

    for (const it of items as OrderItem[]) {
      totalFood += Number(it.price) * Number(it.quantity);
      if (it.is_alcohol) {
        hasAlcohol = true;
      }
    }

    // Calculate discount if FOLLO5 coupon is used (-5% on food subtotal)
    let discountAmount = 0;
    if (coupon_code && coupon_code.toUpperCase() === 'FOLLO5') {
      discountAmount = Number((totalFood * 0.05).toFixed(2));
    }

    const platformFee = 0.15; // €0.15 Contributo Digitale & Ristorazione Follonichese
    const totalOrder = Number((totalFood - discountAmount + platformFee).toFixed(2));

    // Verify cash change denomination is greater or equal to total order amount
    if (payment_method === 'CASH' && Number(cash_change_from) < totalOrder) {
      return NextResponse.json({
        success: false,
        error: `Il taglio banconota specificato (€${cash_change_from}) è inferiore al totale dell'ordine (€${totalOrder.toFixed(2)}).`
      }, { status: 400 });
    }

    const newOrder = await createOrder({
      merchant_id,
      customer_name,
      customer_phone,
      delivery_address: delivery_address || (pickup_point ? `Spiaggia - ${pickup_point}` : 'Ritiro al locale'),
      zone: zone || 'Centro',
      pickup_point: pickup_point || undefined,
      total_food_amount: totalFood,
      platform_fee: platformFee,
      discount_amount: discountAmount,
      coupon_code: coupon_code ? coupon_code.toUpperCase() : undefined,
      total_order_amount: totalOrder,
      payment_method: payment_method || 'CARD',
      cash_change_from: payment_method === 'CASH' ? Number(cash_change_from) : undefined,
      cutlery_requested: cutlery_requested ? 1 : 0,
      items_json: JSON.stringify(items),
      notes: notes || '',
      device_fingerprint: req.headers.get('user-agent') || 'browser-client'
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      hasAlcohol,
      stripe: payment_method === 'CARD' ? {
        auth_status: 'REQUIRES_CAPTURE_ON_MERCHANT_ACCEPT',
        timeout_seconds: 300, // 5 minutes timeout
        client_secret: `pi_mock_secret_${newOrder.id}`
      } : null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
