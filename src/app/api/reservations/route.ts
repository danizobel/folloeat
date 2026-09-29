import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

import { getReservations, createReservation } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchant_id') || undefined;
    const reservations = await getReservations(merchantId);
    return NextResponse.json({ success: true, count: reservations.length, reservations });
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
    const { merchant_id, customer_name, customer_phone, party_size, reservation_time } = body;

    if (!merchant_id || !customer_name || !customer_phone || !party_size) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti per la prenotazione del tavolo.' },
        { status: 400 }
      );
    }

    const reservation = await createReservation({
      merchant_id,
      customer_name,
      customer_phone,
      party_size: Number(party_size),
      reservation_time: reservation_time || new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Tavolo confermato con successo per ${party_size} persone. Fee servizio coperto €0.50 a persona.`,
      reservation
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
