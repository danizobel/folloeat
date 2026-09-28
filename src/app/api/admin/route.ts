import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import {
  getMerchants,
  getHardwareDevices,
  getOrders,
  getReservations,
  getSponsoredNotifications,
  updateHardwareStatus,
  createMerchant,
  updateMerchant,
  createMenuItem,
  assignHardwareDevice,
  createSponsoredNotification
} from '@/lib/db';
import { DepositStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    const merchants = await getMerchants();
    const hardware = await getHardwareDevices();
    const orders = await getOrders();
    const reservations = await getReservations();
    const notifications = await getSponsoredNotifications();

    // 1. KPI Calculations
    let totalTransacted = 0;
    let cardVolume = 0;
    let cashVolume = 0;
    let platformFees = 0;
    let totalCommissions8Pct = 0;

    for (const ord of orders) {
      if (ord.status !== 'CANCELLED') {
        totalTransacted += ord.total_order_amount;
        platformFees += ord.platform_fee;
        totalCommissions8Pct += Number((ord.total_food_amount * 0.08).toFixed(2));

        if (ord.payment_method === 'CARD') {
          cardVolume += ord.total_order_amount;
        } else {
          cashVolume += ord.total_order_amount;
        }
      }
    }

    // Fast seating table fees (€0.50 per confirmed seat)
    const confirmedReservations = reservations.filter(r => r.confirmation_status === 'CONFIRMED');
    let totalSeatsConfirmed = 0;
    let tableFees = 0;
    for (const res of confirmedReservations) {
      totalSeatsConfirmed += res.party_size;
      tableFees += res.party_size * 0.50;
    }

    // Broadcast notifications fees
    let broadcastFees = 0;
    for (const n of notifications) {
      if (n.status === 'SENT') {
        broadcastFees += n.price_charged;
      }
    }

    // Total SaaS recurring revenue (€29 * partner merchants)
    const activePartners = merchants.filter(m => m.is_partner === 1);
    const totalSaaSMoney = activePartners.length * 29.00;

    // Total FolloEat Platform Gross Margin
    const totalPlatformRevenue = Number(
      (totalCommissions8Pct + platformFees + tableFees + broadcastFees + totalSaaSMoney).toFixed(2)
    );

    // 2. B2B Merchant Breakdown & Monthly Settlements
    const merchantStatements = activePartners.map(merchant => {
      const mOrders = orders.filter(o => o.merchant_id === merchant.id && o.status !== 'CANCELLED');
      const mCardOrders = mOrders.filter(o => o.payment_method === 'CARD');
      const mCashOrders = mOrders.filter(o => o.payment_method === 'CASH');

      const mCardFoodTotal = mCardOrders.reduce((sum, o) => sum + o.total_food_amount, 0);
      const mCashFoodTotal = mCashOrders.reduce((sum, o) => sum + o.total_food_amount, 0);
      const mTotalFood = mCardFoodTotal + mCashFoodTotal;

      const mCommCard = Number((mCardFoodTotal * merchant.commission_rate).toFixed(2));
      const mCommCash = Number((mCashFoodTotal * merchant.commission_rate).toFixed(2));
      const mTotalCommission = Number((mCommCard + mCommCash).toFixed(2));

      // Cash orders: merchant directly kept 100% of cash (including 0.15 fee and 8% commission)
      const mCashPlatformFeeCollected = Number((mCashOrders.length * 0.15).toFixed(2));
      const mCashDuesToFolloEat = Number((mCommCash + mCashPlatformFeeCollected).toFixed(2));

      // Table bookings for this merchant
      const mReservations = confirmedReservations.filter(r => r.merchant_id === merchant.id);
      const mSeats = mReservations.reduce((sum, r) => sum + r.party_size, 0);
      const mTableFees = Number((mSeats * 0.50).toFixed(2));

      // Broadcast notifications
      const mNotifs = notifications.filter(n => n.merchant_id === merchant.id && n.status === 'SENT');
      const mBroadcastSpent = mNotifs.reduce((sum, n) => sum + n.price_charged, 0);

      // Monthly fixed SaaS fee
      const mFixedSaaS = merchant.monthly_saas_fee;

      // Net invoice total that FolloEat invoices to the merchant
      const totalInvoiceToMerchant = Number(
        (mFixedSaaS + mTotalCommission + mCashPlatformFeeCollected + mTableFees + mBroadcastSpent).toFixed(2)
      );

      // Net payout to merchant from Stripe card balance (if Stripe captured directly to platform)
      const netStripeCredit = Number((mCardFoodTotal - mCommCard).toFixed(2));

      return {
        merchant_id: merchant.id,
        merchant_name: merchant.name,
        slug: merchant.slug,
        phone: merchant.phone,
        address: merchant.address,
        total_orders_count: mOrders.length,
        total_food_sales: Number(mTotalFood.toFixed(2)),
        card_food_sales: Number(mCardFoodTotal.toFixed(2)),
        cash_food_sales: Number(mCashFoodTotal.toFixed(2)),
        commission_rate: merchant.commission_rate,
        commission_due: mTotalCommission,
        cash_dues_to_reimburse: mCashDuesToFolloEat,
        fast_seating_seats: mSeats,
        fast_seating_fee: mTableFees,
        broadcast_fees: mBroadcastSpent,
        monthly_saas_fee: mFixedSaaS,
        total_invoice_amount: totalInvoiceToMerchant,
        net_stripe_credit: netStripeCredit
      };
    });

    // 3. Export CSV if requested
    if (format === 'csv') {
      const headers = [
        "ID Merchant",
        "Ragione Sociale",
        "Telefono",
        "Ordini Totali",
        "Venduto Cibo Totale (€)",
        "Incassato Carta (€)",
        "Incassato Contanti (€)",
        "Canone SaaS (€)",
        "Commissioni 8% (€)",
        "Fee Tavoli (€0.50/pax)",
        "Notifiche Promo (€)",
        "Quota Contanti da Conguagliare (€)",
        "TOTALE FATTURA ELETTRONICA B2B (€)"
      ];

      const rows = merchantStatements.map(s => [
        `"${s.merchant_id}"`,
        `"${s.merchant_name}"`,
        `"${s.phone}"`,
        s.total_orders_count,
        s.total_food_sales.toFixed(2),
        s.card_food_sales.toFixed(2),
        s.cash_food_sales.toFixed(2),
        s.monthly_saas_fee.toFixed(2),
        s.commission_due.toFixed(2),
        s.fast_seating_fee.toFixed(2),
        s.broadcast_fees.toFixed(2),
        s.cash_dues_to_reimburse.toFixed(2),
        s.total_invoice_amount.toFixed(2)
      ]);

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="folloeat_fatturazione_${new Date().toISOString().slice(0, 7)}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      kpis: {
        total_transacted: Number(totalTransacted.toFixed(2)),
        card_volume: Number(cardVolume.toFixed(2)),
        cash_volume: Number(cashVolume.toFixed(2)),
        folloeat_commissions_8pct: Number(totalCommissions8Pct.toFixed(2)),
        platform_fee_015: Number(platformFees.toFixed(2)),
        table_fees_050: Number(tableFees.toFixed(2)),
        broadcast_fees: Number(broadcastFees.toFixed(2)),
        monthly_saas_revenue: Number(totalSaaSMoney.toFixed(2)),
        total_platform_revenue: totalPlatformRevenue,
        orders_count: orders.length,
        confirmed_seats: totalSeatsConfirmed
      },
      merchants: merchants,
      hardware_devices: hardware,
      merchant_statements: merchantStatements,
      notifications: notifications
    });
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

    // 1. Add New Merchant (Onboarding)
    if (body.action === 'ADD_MERCHANT' && body.merchant) {
      const newMerchant = await createMerchant(body.merchant);
      if (body.device_id) {
        await assignHardwareDevice(
          body.device_id,
          newMerchant.id,
          newMerchant.name,
          body.deposit_status || 'HELD'
        );
      }
      return NextResponse.json({
        success: true,
        message: `Locale "${newMerchant.name}" creato ed accreditato con successo.`,
        merchant: newMerchant
      });
    }

    // 2. Update Existing Merchant (Tier, Status, Contact info)
    if (body.action === 'UPDATE_MERCHANT' && body.merchant_id) {
      const updated = await updateMerchant(body.merchant_id, body.updates || {});
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Locale non trovato' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Locale "${updated.name}" aggiornato con successo.`,
        merchant: updated
      });
    }

    // 3. Add Menu Dish to Merchant
    if (body.action === 'ADD_MENU_ITEM' && body.item) {
      const item = await createMenuItem(body.item);
      return NextResponse.json({
        success: true,
        message: `Piatto "${item.name}" aggiunto al menù con successo.`,
        item
      });
    }

    // 4. Broadcast Sponsored Push Notification
    if (body.action === 'BROADCAST_NOTIFICATION' && body.notification) {
      const notif = await createSponsoredNotification(body.notification);
      return NextResponse.json({
        success: true,
        message: `Notifica push programmata con successo.`,
        notification: notif
      });
    }

    // 5. Update Hardware Deposit status (legacy/inline compatibility)
    if (body.device_id && body.deposit_status) {
      const ok = await updateHardwareStatus(body.device_id, body.deposit_status as DepositStatus);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Dispositivo non trovato' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Stato cauzione per il terminale ${body.device_id} aggiornato a ${body.deposit_status}.`
      });
    }

    return NextResponse.json({ success: false, error: 'Parametri mancanti per operazione amministrativa.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

