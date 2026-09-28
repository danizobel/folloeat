'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Merchant } from '@/lib/types';
import { Navigation, Layers, Compass } from 'lucide-react';

interface InteractiveMapProps {
  places: Merchant[];
  selectedPlace?: Merchant | null;
  onSelectPlace: (place: Merchant) => void;
  onSignalPlace?: (place: Merchant) => void;
}

export default function InteractiveMap({
  places,
  selectedPlace,
  onSelectPlace,
  onSignalPlace
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileLayerType, setTileLayerType] = useState<'standard' | 'voyager'>('standard');

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        if (isCancelled || !mapContainerRef.current) return;

        // Cleanup if existing
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Follonica Center Coordinates (Piazza Sivieri / Lungomare / Centro)
        const map = L.map(mapContainerRef.current, {
          center: [42.9255, 10.7555],
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: true
        });

        // Add Zoom Control to bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer: OpenStreetMap high reliability
        const tileUrl = tileLayerType === 'standard'
          ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        // Render markers
        renderPins(L, markersLayer, places, selectedPlace);

        // Trigger invalidateSize to ensure tiles render immediately
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);

        setMapReady(true);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tileLayerType]);

  // Update markers when places or selectedPlace changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((module) => {
      const L = module.default;
      renderPins(L, markersLayerRef.current, places, selectedPlace);
    });
  }, [places, selectedPlace]);

  // Recalculate container size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  function getCategoryPinData(catStr: string = '', nameStr: string = '') {
    const cat = catStr.toLowerCase();
    const name = nameStr.toLowerCase();

    if (cat.includes('pizz') || name.includes('pizz') || name.includes('lampadino') || name.includes('disco rosso')) {
      return { bg: '#EA580C', emoji: '🍕', label: 'Pizzeria' };
    }
    if (
      cat.includes('pesce') ||
      cat.includes('marin') ||
      cat.includes('mare') ||
      cat.includes('balnear') ||
      name.includes('bagno') ||
      name.includes('scalo') ||
      name.includes('baracca') ||
      name.includes('sottomarino') ||
      name.includes('terrazza')
    ) {
      return { bg: '#0284C7', emoji: '🐟', label: 'Ristorante di Mare' };
    }
    if (cat.includes('pasticc') || cat.includes('gelat') || name.includes('gelat') || name.includes('peggi') || name.includes('pagni')) {
      return { bg: '#DB2777', emoji: '🍨', label: 'Gelateria & Dolci' };
    }
    if (cat.includes('burger') || cat.includes('pub') || cat.includes('birr') || name.includes('lord') || name.includes('poldo')) {
      return { bg: '#B45309', emoji: '🍔', label: 'Burger & Pub' };
    }
    if (cat.includes('pineta') || cat.includes('chiosco') || name.includes('fratelli') || name.includes('boschetto') || name.includes('golfo')) {
      return { bg: '#059669', emoji: '🥪', label: 'Chiosco & Schiacciate' };
    }
    if (cat.includes('trattoria') || cat.includes('osteria') || cat.includes('rosticceria') || cat.includes('tipica') || name.includes('sauro') || name.includes('nascosta') || name.includes('katia')) {
      return { bg: '#7C2D12', emoji: '🥘', label: 'Trattoria Tipica' };
    }

    return { bg: '#475569', emoji: '🍴', label: 'Ristorante' };
  }

  function renderPins(L: any, layer: any, items: Merchant[], active: Merchant | null | undefined) {
    layer.clearLayers();

    items.forEach((place) => {
      if (!place.lat || !place.lng) return;

      const isSpotlight = place.is_spotlight === 1;
      const isAccredited = place.is_accredited === 1 || place.is_partner === 1;
      const isSelected = active?.id === place.id;

      const categoryData = getCategoryPinData(place.category, place.name);

      let bgColor = categoryData.bg;
      let pinEmoji = categoryData.emoji;
      let pinSize = 34;
      let borderStyle = '2px solid #ffffff';
      let shadowStyle = 'box-shadow: 0 4px 10px rgba(0,0,0,0.25);';

      if (isSpotlight) {
        bgColor = '#D97706'; // Warm Gold Spotlight
        pinEmoji = '👑';
        pinSize = 42;
        borderStyle = '3px solid #FEF08A';
        shadowStyle = 'box-shadow: 0 0 14px rgba(217, 119, 6, 0.7), 0 4px 10px rgba(0,0,0,0.3);';
      } else if (isAccredited) {
        bgColor = '#0284C7'; // Follo Blue Partner
        pinSize = 38;
        borderStyle = '2.5px solid #ffffff';
        shadowStyle = 'box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);';
      }

      if (isSelected) {
        bgColor = '#EF4444';
        pinSize = 44;
      }

      const customIcon = L.divIcon({
        className: 'follo-custom-marker',
        html: `
          <div style="
            position: relative;
            background: ${bgColor};
            width: ${pinSize}px;
            height: ${pinSize}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: ${borderStyle};
            ${shadowStyle}
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${pinSize > 38 ? '18px' : '15px'};
            ">${pinEmoji}</span>
            ${isSpotlight ? `
              <div style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #F59E0B;
                color: #FFFFFF;
                font-size: 8px;
                font-weight: 900;
                padding: 1px 4px;
                border-radius: 9999px;
                border: 1.5px solid white;
              ">TOP</div>
            ` : ''}
            ${isAccredited && !isSpotlight ? `
              <div style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #0284C7;
                color: #FFFFFF;
                font-size: 7px;
                font-weight: 900;
                padding: 1px 3px;
                border-radius: 9999px;
                border: 1.5px solid white;
              ">PRO</div>
            ` : ''}
          </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize],
        popupAnchor: [0, -pinSize]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 240px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${
              isSpotlight ? '#B45309' : isAccredited ? '#0284C7' : '#475569'
            }; background: ${
              isSpotlight ? '#FEF3C7' : isAccredited ? '#E0F2FE' : '#F1F5F9'
            }; padding: 3px 8px; border-radius: 6px;">
              ${isSpotlight ? '👑 SPONSORIZZATO' : isAccredited ? '★ PARTNER FOLLOEAT' : '📍 ATTIVITÀ CENSITA'}
            </span>
            ${place.rating ? `<span style="font-size: 12px; font-weight: 900; color: #F59E0B;">★ ${place.rating}</span>` : ''}
          </div>
          <h3 style="font-weight: 900; font-size: 15px; margin: 0 0 2px 0; color: #0F172A;">${place.name}</h3>
          <span style="font-size: 11px; font-weight: 700; color: #0284C7; display: block; margin-bottom: 4px;">${place.category || categoryData.label}</span>
          <p style="font-size: 12px; color: #64748B; margin: 0 0 10px 0;">${place.address}</p>
          
          ${isAccredited ? `
            <div style="display: flex; gap: 6px;">
              <button id="map-btn-menu-${place.id}" style="
                flex: 1;
                background: #0284C7;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 10px;
                font-weight: 700;
                font-size: 11px;
                cursor: pointer;
              ">Vedi Menù & Ordina</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <a href="tel:${place.phone}" style="
                display: block;
                text-align: center;
                text-decoration: none;
                background: #0F172A;
                color: white;
                padding: 8px 12px;
                border-radius: 10px;
                font-weight: 700;
                font-size: 12px;
              ">📞 Chiama Locale (${place.phone})</a>
              ${onSignalPlace ? `
                <button id="map-btn-signal-${place.id}" style="
                  width: 100%;
                  background: #F8FAFC;
                  color: #64748B;
                  border: 1px solid #E2E8F0;
                  padding: 6px 10px;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 10px;
                  cursor: pointer;
                ">Richiedi attivazione ordini online</button>
              ` : ''}
            </div>
          `}
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btnMenu = document.getElementById(`map-btn-menu-${place.id}`);
        if (btnMenu) {
          btnMenu.onclick = () => onSelectPlace(place);
        }
        const btnSignal = document.getElementById(`map-btn-signal-${place.id}`);
        if (btnSignal && onSignalPlace) {
          btnSignal.onclick = () => onSignalPlace(place);
        }
      });

      marker.addTo(layer);
    });

    // Center on selected place if any
    if (active?.lat && active?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([active.lat, active.lng], 16, { duration: 1 });
    }
  }

  const handleCenterFollonica = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([42.9255, 10.7555], 14, { duration: 0.8 });
    }
  };

  const accreditedCount = places.filter(p => p.is_accredited === 1 || p.is_partner === 1).length;

  return (
    <div className="w-full h-full relative min-h-[500px] bg-slate-100">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleCenterFollonica}
          className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          title="Centra su Follonica"
        >
          <Navigation className="w-3.5 h-3.5 text-follo-blue" />
          <span>Follonica Centro</span>
        </button>

        <button
          onClick={() => setTileLayerType(t => t === 'standard' ? 'voyager' : 'standard')}
          className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          title="Cambia stile mappa"
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span>{tileLayerType === 'standard' ? 'Mappa OSM' : 'Mappa Voyager'}</span>
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200/90 z-[1000] text-xs space-y-1.5 pointer-events-auto max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Attività Follonica (Census Reale)
          </span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            {places.length} Locali
          </span>
        </div>

        {accreditedCount > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-follo-blue border border-white shadow-xs shrink-0"></span>
              <span className="font-bold text-slate-900">{accreditedCount} Partner Accreditati (Ordini Online)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-slate-500 border border-white shadow-xs shrink-0"></span>
              <span className="text-slate-600">Attività in Directory (Chiamata)</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 leading-snug">
            Mappa georeferenziata con tutte le attività reali di Follonica. Puoi accreditare qualsiasi locale con 1-click dalla console <strong>SuperAdmin</strong> (/admin).
          </p>
        )}

        {/* Category icons mini-strip */}
        <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100">
          <span>🍕 Pizze</span>
          <span>🐟 Mare</span>
          <span>🍔 Burger</span>
          <span>🥪 Pineta</span>
          <span>🍨 Gelati</span>
        </div>
      </div>
    </div>
  );
}
