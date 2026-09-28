'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Leaf,
  FileText,
  MapPin,
  Navigation,
  Check
} from 'lucide-react';
import { OrderItem, Order } from '@/lib/types';
import {
  validateFollonicaAddress,
  FOLLONICA_STREETS,
  FOLLONICA_BEACH_POINTS,
  AddressValidationResult
} from '@/lib/address-validation';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  merchantId: string;
  merchantName: string;
  zone: string;
  pickupPoint?: string;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export default function CartCheckoutModal({
  isOpen,
  onClose,
  items,
  merchantId,
  merchantName,
  zone,
  pickupPoint,
  onUpdateQuantity,
  onClearCart,
  onOrderSuccess
}: CartCheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [cashChangeFrom, setCashChangeFrom] = useState('');
  const [cutleryRequested, setCutleryRequested] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // 18+ Alcohol Modal state
  const [ageConfirmed18, setAgeConfirmed18] = useState(false);
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false);

  // Address validation memo
  const addressValidation: AddressValidationResult | null = useMemo(() => {
    if (pickupPoint) {
      return {
        isValid: true,
        isInFollonica: true,
        hasHouseNumber: true,
        streetName: pickupPoint,
        zone: (zone as any) || 'Lungomare',
        normalizedAddress: `Spiaggia - ${pickupPoint}, Follonica`,
        isBeachPoint: true,
        beachPointName: pickupPoint,
        confidence: 'HIGH' as const
      };
    }
    if (!deliveryAddress.trim()) return null;
    return validateFollonicaAddress(deliveryAddress, zone);
  }, [deliveryAddress, pickupPoint, zone]);

  // Street autocomplete suggestions
  const streetSuggestions = useMemo(() => {
    const q = deliveryAddress.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const matches = FOLLONICA_STREETS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.name.toLowerCase().replace(/^(via|viale|piazza)\s+/i, '').includes(q)
    ).slice(0, 5);

    const beachMatches = FOLLONICA_BEACH_POINTS.filter(b =>
      b.name.toLowerCase().includes(q)
    ).slice(0, 3);

    return [...matches, ...beachMatches];
  }, [deliveryAddress]);

  // Submission loading & errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const hasAlcohol = items.some(item => item.is_alcohol);
  const foodSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // FOLLO5 coupon discount (-5% on food subtotal)
  const discountAmount = couponApplied ? Number((foodSubtotal * 0.05).toFixed(2)) : 0;
  const platformFee = 0.15; // Contributo Digitale & Ristorazione Follonichese
  const finalTotal = Number((foodSubtotal - discountAmount + platformFee).toFixed(2));

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'FOLLO5') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('Coupon non valido. Usa "FOLLO5" per il 5% di sconto.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Nome e Numero di Telefono sono obbligatori per il tracking.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Il carrello è vuoto.');
      return;
    }

    // Address validation check for home delivery
    if (!pickupPoint) {
      if (!deliveryAddress.trim()) {
        setErrorMessage('L\'indirizzo di consegna a Follonica è obbligatorio per la consegna a domicilio.');
        return;
      }
      const addrCheck = validateFollonicaAddress(deliveryAddress, zone);
      if (!addrCheck.isValid || !addrCheck.isInFollonica) {
        setErrorMessage(addrCheck.error || 'Indirizzo non valido o fuori dalla copertura del comune di Follonica (58022).');
        return;
      }
    }

    if (hasAlcohol && !ageConfirmed18) {
      setShowAgeWarningModal(true);
      return;
    }

    if (paymentMethod === 'CASH') {
      const billValue = parseFloat(cashChangeFrom);
      if (isNaN(billValue) || billValue <= 0) {
        setErrorMessage('Specifica la banconota con cui pagherai per consentire al rider di preparare il resto.');
        return;
      }
      if (billValue < finalTotal) {
        setErrorMessage(`Il taglio della banconota specificata (€${billValue}) è inferiore al totale dell'ordine (€${finalTotal.toFixed(2)}).`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress || (pickupPoint ? `Spiaggia - ${pickupPoint}` : undefined),
          zone: zone || 'Centro',
          pickup_point: pickupPoint || undefined,
          items,
          payment_method: paymentMethod,
          cash_change_from: paymentMethod === 'CASH' ? parseFloat(cashChangeFrom) : undefined,
          cutlery_requested: cutleryRequested,
          coupon_code: couponApplied ? 'FOLLO5' : undefined,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore durante la creazione dell\'ordine.');
      }

      onClearCart();
      onOrderSuccess(data.order);
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <span className="text-[11px] font-bold text-follo-blue uppercase tracking-wider">
                {merchantName}
              </span>
              <h3 className="text-lg font-black text-slate-900">Carrello & Checkout Etico</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                I tuoi piatti selezionati ({items.length})
              </h4>
              <div className="space-y-2.5">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        {item.is_alcohol && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            18+
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">
                        €{item.price.toFixed(2)} cad.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-follo-blue text-white flex items-center justify-center hover:bg-follo-blue-dark"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Code FOLLO5 */}
            <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Codice coupon (es. FOLLO5)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-follo-blue"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-2 bg-follo-blue hover:bg-follo-blue-dark text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Applica
                </button>
              </div>
              {couponApplied && (
                <p className="text-[11px] text-green-700 font-bold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Coupon FOLLO5 applicato (-5% assorbito dalla piattaforma)
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 mt-1.5">{couponError}</p>
              )}
            </div>

            {/* Eco-opt-in posate */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 cursor-pointer">
              <input
                type="checkbox"
                checked={cutleryRequested}
                onChange={(e) => setCutleryRequested(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-follo-blue focus:ring-follo-blue"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Richiedi posate e tovaglioli monouso
                </span>
                <p className="text-emerald-700 mt-0.5">
                  Deselezionato di default per proteggere il golfo di Follonica e ridurre l'uso di plastica.
                </p>
              </div>
            </label>

            {/* Customer Details Form (Passwordless) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                I tuoi dati di consegna (Senza password)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nome e Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Mario Rossi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-follo-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cellulare (per SMS / Ritiro) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Es. +39 347 1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-follo-blue"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-follo-red" />
                    <span>{pickupPoint ? 'Punto Spiaggia / Ombrellone' : 'Indirizzo di Consegna (Follonica 58022) *'}</span>
                  </label>
                  {addressValidation && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      addressValidation.isValid && (addressValidation.hasHouseNumber || addressValidation.isBeachPoint)
                        ? 'bg-emerald-100 text-emerald-800'
                        : addressValidation.isValid
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {addressValidation.isValid && (addressValidation.hasHouseNumber || addressValidation.isBeachPoint) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Convalidato ({addressValidation.zone})</span>
                        </>
                      ) : addressValidation.isValid ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Manca Civico</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-rose-600" />
                          <span>Non Valido</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required={!pickupPoint}
                    placeholder={pickupPoint ? `Punto: ${pickupPoint}` : "Es. Via Roma 15, Viale Italia 80..."}
                    value={deliveryAddress}
                    onFocus={() => setShowAddressSuggestions(true)}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      setShowAddressSuggestions(true);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 font-medium ${
                      addressValidation && !addressValidation.isValid
                        ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                        : addressValidation?.isValid && (addressValidation.hasHouseNumber || addressValidation.isBeachPoint)
                        ? 'border-emerald-300 focus:ring-emerald-400 bg-emerald-50/20'
                        : 'border-slate-200 focus:ring-follo-blue'
                    }`}
                  />
                  {deliveryAddress && (
                    <button
                      type="button"
                      onClick={() => setDeliveryAddress('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showAddressSuggestions && streetSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Suggerimenti Vie Follonica</span>
                      <button
                        type="button"
                        onClick={() => setShowAddressSuggestions(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        Chiudi
                      </button>
                    </div>
                    {streetSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDeliveryAddress(`${s.name} `);
                          setShowAddressSuggestions(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-follo-blue shrink-0" />
                          <span className="font-bold text-slate-800">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {s.zone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Validation Feedback Banner */}
                {addressValidation && (
                  <div className="mt-2">
                    {addressValidation.isValid ? (
                      addressValidation.hasHouseNumber || addressValidation.isBeachPoint ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex-1">
                            <span className="font-bold">Indirizzo Verificato a Follonica:</span> {addressValidation.normalizedAddress}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold">Via {addressValidation.streetName} ({addressValidation.zone}):</span> Inserisci il numero civico (es. 15) per consentire al rider di raggiungere esattamente il portone.
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>{addressValidation.error}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Street Chips */}
                {!deliveryAddress && !pickupPoint && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Vie Principali:</span>
                    {['Via Roma', 'Viale Italia', 'Via Bicocchi', 'Via Cassarello', 'Via della Repubblica', 'Via Litoranea'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setDeliveryAddress(`${st} `);
                          setShowAddressSuggestions(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-follo-blue text-slate-700 text-[10px] font-bold transition-colors whitespace-nowrap shrink-0 border border-slate-200"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Note per la cucina o il rider
                </label>
                <textarea
                  rows={2}
                  placeholder="Es. Citofonare piano 2, o allergia grave ai crostacei..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-follo-blue placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-500 mt-1 italic flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  Disclaimer contrattuale: Modifiche e ingredienti extra inseriti a mano nelle note non sono vincolanti e possono richiedere sovrapprezzo al ritiro.
                </p>
              </div>
            </div>

            {/* Payment Method Switch */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Metodo di Pagamento
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-follo-blue bg-follo-blue-light/40 ring-2 ring-follo-blue/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mt-0.5 ${paymentMethod === 'CARD' ? 'text-follo-blue' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Carta / Apple Pay</div>
                    <div className="text-[10px] text-slate-500">Zero Escrow: pre-autorizzazione 5 min</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-follo-blue bg-follo-blue-light/40 ring-2 ring-follo-blue/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Banknote className={`w-5 h-5 mt-0.5 ${paymentMethod === 'CASH' ? 'text-follo-blue' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Contanti alla Consegna</div>
                    <div className="text-[10px] text-slate-500">Incasso diretto al rider</div>
                  </div>
                </button>
              </div>

              {/* If Cash on Delivery: Required change denomination field */}
              {paymentMethod === 'CASH' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-900">
                    Con che banconota pagherai? (Obbligatorio per il resto) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-900">€</span>
                    <input
                      type="number"
                      step="5"
                      min={finalTotal}
                      placeholder={`Es. 20, 50 (Totale: €${finalTotal.toFixed(2)})`}
                      value={cashChangeFrom}
                      onChange={(e) => setCashChangeFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {cashChangeFrom && parseFloat(cashChangeFrom) >= finalTotal && (
                    <p className="text-[11px] text-amber-800 font-semibold">
                      Resto previsto alla consegna: €{(parseFloat(cashChangeFrom) - finalTotal).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Transparent Receipt Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotale Cibo</span>
                <span className="font-semibold">€{foodSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Sconto Coupon FOLLO5 (-5%)</span>
                  <span>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-follo-blue font-semibold">
                <span className="flex items-center gap-1">
                  Contributo Digitale & Ristorazione Follonichese
                </span>
                <span>€{platformFee.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>TOTALE ORDINE</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
            <button
              onClick={handleSubmitOrder}
              disabled={isLoading || items.length === 0}
              className="w-full py-3.5 rounded-2xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-sm shadow-lg shadow-follo-blue/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Elaborazione ordine in corso...</span>
              ) : (
                <>
                  <span>Conferma Ordine • €{finalTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory 18+ Alcohol Modal Alert */}
      {showAgeWarningModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-red-200">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-4">
              🔞
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Verifica Età 18+ Obbligatoria</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Il tuo carrello include bevande alcoliche. Ai sensi della legge italiana (Art. 14 bis L. 125/2001), la somministrazione e la vendita di alcolici a minori di 18 anni è severamente vietata.
              Il rider o il locale richiederà l'esibizione di un documento di riconoscimento valido alla consegna.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAgeConfirmed18(true);
                  setShowAgeWarningModal(false);
                }}
                className="w-full py-3 rounded-xl bg-follo-red text-white text-xs font-bold hover:bg-red-700 shadow-md"
              >
                Dichiaro di avere almeno 18 anni
              </button>
              <button
                type="button"
                onClick={() => setShowAgeWarningModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Torna al carrello
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
