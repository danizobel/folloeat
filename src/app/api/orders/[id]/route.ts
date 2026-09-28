import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/db';
import { OrderStatus, CaptureStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Ordine non trovato' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, capture_status } = body as { status: OrderStatus; capture_status?: CaptureStatus };

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status non valido' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, capture_status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ordine non trovato' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Stato ordine aggiornato a ${status}. ${
        updated.payment_method === 'CARD'
          ? (status === 'ACCEPTED' ? 'Fondi catturati con successo da Stripe (Capture).' : status === 'CANCELLED' ? 'Pre-autorizzazione Stripe svincolata a costo zero.' : '')
          : 'Pagamento in contanti al momento della consegna.'
      }`,
      order: updated
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
