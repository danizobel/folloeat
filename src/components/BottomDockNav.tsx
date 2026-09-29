'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  ShoppingBag,
  Calendar,
  User,
  Store,
  ShieldAlert
} from 'lucide-react';

export type NavTab = 'home' | 'search' | 'orders' | 'tables' | 'profile';

interface BottomDockNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export default function BottomDockNav({
  activeTab,
  onTabChange,
  cartCount,
  onOpenCart
}: BottomDockNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,0px)] h-[calc(4rem+env(safe-area-inset-bottom,0px))] bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 px-3 md:px-8 flex items-center justify-around shadow-lg">
      {/* Tab 1: Home */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          activeTab === 'home' ? 'text-follo-blue' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Home</span>
      </button>

      {/* Tab 2: Cerca */}
      <button
        onClick={() => onTabChange('search')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          activeTab === 'search' ? 'text-follo-blue' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Cerca</span>
      </button>

      {/* Tab 3: Ordina / Carrello */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-slate-900 transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-follo-red" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-follo-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-1 text-slate-800">Ordina</span>
      </button>

      {/* Tab 4: Tavoli Radar */}
      <button
        onClick={() => onTabChange('tables')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          activeTab === 'tables' ? 'text-follo-sand' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Tavoli</span>
      </button>

      {/* Tab 5: Profilo / Info Modello B2B */}
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          activeTab === 'profile' ? 'text-follo-slate font-black' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Profilo</span>
      </button>
    </nav>
  );
}
