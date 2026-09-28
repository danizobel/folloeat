'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Calendar,
  UtensilsCrossed,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { Merchant, MenuItem, OrderItem, EU_ALLERGENS } from '@/lib/types';

interface MenuDrawerProps {
  merchant: Merchant;
  menu: MenuItem[];
  onClose: () => void;
  onAddToCart: (item: OrderItem) => void;
  onOpenReservationModal: (merchant: Merchant) => void;
}

export default function MenuDrawer({
  merchant,
  menu,
  onClose,
  onAddToCart,
  onOpenReservationModal
}: MenuDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('TUTTE');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [selectedDishModal, setSelectedDishModal] = useState<MenuItem | null>(null);

  // Extract unique categories
  const categories = ['TUTTE', ...Array.from(new Set(menu.map(i => i.category)))];

  const filteredItems = selectedCategory === 'TUTTE'
    ? menu
    : menu.filter(i => i.category === selectedCategory);

  const getItemQuantity = (id: string) => itemQuantities[id] || 0;

  const updateQuantity = (id: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddDirect = (dish: MenuItem) => {
    onAddToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      is_alcohol: dish.is_alcohol === 1,
      allergens: dish.allergens
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="relative bg-slate-900 text-white p-5 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-follo-blue/20 border border-white/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              {merchant.hero_image ? (
                <img src={merchant.hero_image} alt={merchant.name} className="w-full h-full object-cover" />
              ) : (
                '🍽️'
              )}
            </div>

            <div className="pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-follo-blue text-white px-2 py-0.5 rounded-full">
                  Partner Ufficiale
                </span>
                {merchant.rating && (
                  <span className="text-xs font-bold text-amber-400">
                    ★ {merchant.rating} ({merchant.review_count} recensioni)
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{merchant.name}</h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-follo-red shrink-0" />
                {merchant.address}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {merchant.delivery_time_est || '25-35 min'}
                </span>
                <span>•</span>
                <span>Min. ordine €{merchant.min_order?.toFixed(2) || '10.00'}</span>
              </div>
            </div>
          </div>

          {/* Action Row: Fast Seating Reservation Button */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-300">Vuoi mangiare al locale?</span>
            <button
              onClick={() => onOpenReservationModal(merchant)}
              className="px-3.5 py-1.5 bg-follo-sand hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              Radar Tavoli (Post 21:30)
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 overflow-x-auto flex gap-2 shrink-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-follo-blue text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                  {item.is_alcohol === 1 && (
                    <span className="px-1.5 py-0.5 rounded bg-follo-red-light text-follo-red font-black text-[10px] tracking-wide border border-follo-red/20">
                      18+
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {item.description}
                </p>

                {/* 14 EU Allergens pills */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.allergens.map(allergenKey => {
                      const allergenMeta = EU_ALLERGENS.find(a => a.id === allergenKey);
                      return (
                        <span
                          key={allergenKey}
                          title={allergenMeta?.label || allergenKey}
                          className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-800 rounded border border-amber-200/70 uppercase tracking-wider"
                        >
                          {allergenMeta?.code || allergenKey.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <span className="font-black text-slate-900 text-base">
                    €{item.price.toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleAddDirect(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Aggiungi
                  </button>
                </div>
              </div>

              {item.image_url && (
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Notice */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <p className="text-[11px] text-slate-500">
            Allergeni conformi al Reg. UE 1169/2011. Prezzi con iva inclusa. Nessun sovrapprezzo nascosto.
          </p>
        </div>
      </div>
    </div>
  );
}
