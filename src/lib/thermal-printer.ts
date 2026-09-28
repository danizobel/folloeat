import { Order, OrderItem } from './types';

/**
 * Standard 58mm thermal printers (like Sunmi V2s) typically print
 * 32 characters per line in normal font mode (Font A / 12x24 dots).
 */
const LINE_WIDTH = 32;

function centerText(text: string, width = LINE_WIDTH): string {
  if (text.length >= width) return text.slice(0, width);
  const leftPad = Math.floor((width - text.length) / 2);
  const rightPad = width - text.length - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

function justifyText(left: string, right: string, width = LINE_WIDTH): string {
  const total = left.length + right.length;
  if (total >= width) {
    return left.slice(0, width - right.length - 1) + ' ' + right;
  }
  const spaces = width - total;
  return left + ' '.repeat(spaces) + right;
}

function divider(char = '-'): string {
  return char.repeat(LINE_WIDTH);
}

export function generateSunmi58mmThermalReceipt(order: Order): string {
  let items: OrderItem[] = [];
  try {
    items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items || []);
  } catch {
    items = [];
  }

  const lines: string[] = [];
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  // 1. Header
  lines.push(centerText("================================"));
  lines.push(centerText("*** FOLLOEAT ***"));
  lines.push(centerText("Ristorazione & Delivery Follonica"));
  lines.push(centerText("================================"));
  lines.push("");

  // 2. Order Identification
  lines.push(centerText(`ORDINE: ${order.id}`));
  if (order.delivery_pin) {
    lines.push(centerText(`PIN CONSEGNA: [ ${order.delivery_pin} ]`));
  }
  lines.push(centerText(`${formattedDate} - ${formattedTime}`));
  lines.push(divider());

  // 3. Customer & Delivery Destination
  lines.push(`CLIENTE: ${order.customer_name}`);
  lines.push(`TEL:     ${order.customer_phone}`);
  if (order.umbrella_number) {
    lines.push(`DEST:    *** CONSEGNA OMBRELLONE ***`);
    lines.push(`OMBRELLONE: N. ${order.umbrella_number}`);
  }
  if (order.pickup_point) {
    lines.push(`PUNTO:   ${order.pickup_point}`);
  } else if (order.delivery_address) {
    lines.push(`DEST:    ${order.delivery_address}`);
  }
  if (order.zone) {
    lines.push(`ZONA:    ${order.zone}`);
  }
  lines.push(divider());


  // 4. Cutlery Notice
  if (order.cutlery_requested) {
    lines.push("[X] POSATE & TOVAGLIOLI RICHIESTI");
  } else {
    lines.push("[ ] NO POSATE (ECO-OPT-IN)");
  }
  lines.push(divider());

  // 5. Items List with Allergens
  lines.push("Q.TA  PIATTO               TOT.");
  lines.push(divider('-'));

  let hasAlcohol = false;

  for (const item of items) {
    const qtyStr = `${item.quantity}x`.padEnd(4);
    const priceStr = `€${(item.price * item.quantity).toFixed(2)}`;
    const nameLine = justifyText(`${qtyStr} ${item.name}`, priceStr);
    lines.push(nameLine);

    if (item.selected_options && item.selected_options.length > 0) {
      lines.push(`     -> ${item.selected_options.join(', ')}`);
    }

    if (item.allergens && item.allergens.length > 0) {
      lines.push(`     [ALLERGENI: ${item.allergens.join(', ').toUpperCase()}]`);
    }

    if (item.is_alcohol) {
      hasAlcohol = true;
      lines.push(`     [18+ BEVANDA ALCOLICA]`);
    }
  }

  lines.push(divider());

  // 6. Order Totals
  lines.push(justifyText("Subtotale Cibo:", `€${order.total_food_amount.toFixed(2)}`));
  if (order.discount_amount && order.discount_amount > 0) {
    lines.push(justifyText(`Coupon ${order.coupon_code || 'SCONTO'}:`, `-€${order.discount_amount.toFixed(2)}`));
  }
  lines.push(justifyText("Contributo Digitale:", `€${order.platform_fee.toFixed(2)}`));
  lines.push(divider('='));
  lines.push(justifyText("TOTALE DA PAGARE:", `€${order.total_order_amount.toFixed(2)}`));
  lines.push(divider('='));

  // 7. Payment Status & Cash Change
  if (order.payment_method === 'CARD') {
    lines.push(centerText(">>> CARTA: GIA' PAGATA <<<"));
    lines.push(centerText(`(Auth Stripe: ${order.stripe_payment_intent_id ? 'CONFERMATA' : 'PRE-AUTORIZZATA'})`));
  } else {
    lines.push(centerText(">>> CONTANTI DA INCASSARE <<<"));
    if (order.cash_change_from) {
      const changeDue = order.cash_change_from - order.total_order_amount;
      lines.push(justifyText("Banconota cliente:", `€${order.cash_change_from.toFixed(2)}`));
      lines.push(justifyText("RESTO DA DARE:", `€${Math.max(0, changeDue).toFixed(2)}`));
    }
  }

  // 8. Alcohol 18+ Warning
  if (hasAlcohol) {
    lines.push(divider('*'));
    lines.push(centerText("!!! ATTENZIONE 18+ !!!"));
    lines.push(centerText("VERIFICARE DOCUMENTO IDENTITA'"));
    lines.push(centerText("CONSEGNA VIETATA AI MINORI"));
    lines.push(divider('*'));
  }

  // 9. Notes
  if (order.notes) {
    lines.push(divider());
    lines.push("NOTE CLIENTE:");
    lines.push(order.notes);
  }

  // 10. Footer & Legal Disclaimers
  lines.push("");
  lines.push(centerText("Grazie per aver scelto FolloEat!"));
  lines.push(centerText("Piattaforma Iperlocale Follonica"));
  lines.push(centerText("www.folloeat.it"));
  lines.push("");
  lines.push("");
  lines.push(""); // 3 empty lines for tear-off on Sunmi V2s

  return lines.join('\n');
}
