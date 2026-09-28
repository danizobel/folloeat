'use client';

import React, { useEffect, useRef } from 'react';
import { Merchant } from '@/lib/types';

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
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Dynamically import Leaflet
      const L = (await import('leaflet')).default;

      // Ensure leaflet CSS is injected if not already
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [42.9248, 10.7588], // Follonica Center
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true
      });

      mapInstanceRef.current = map;

      // Add clean CartoDB / OSM tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      // Render pins
      renderMarkers(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((module) => {
      const L = module.default;
      renderMarkers(L, mapInstanceRef.current);
    });
  }, [places, selectedPlace]);

  function renderMarkers(L: any, map: any) {
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    places.forEach(place => {
      if (!place.lat || !place.lng) return;

      const isSpotlight = place.is_spotlight === 1;
      const isAccredited = place.is_accredited === 1 || place.is_partner === 1;
      const isSelected = selectedPlace?.id === place.id;

      let pinColor = '#64748B'; // Default Level 3 Directory
      let badgeIcon = '🍴';
      let pinSize = 34;
      let glowStyle = 'box-shadow: 0 4px 10px rgba(0,0,0,0.25);';

      if (isSpotlight) {
        // Level 1: Spotlight Premium
        pinColor = '#F59E0B';
        badgeIcon = '⭐';
        pinSize = 44;
        glowStyle = 'box-shadow: 0 0 16px rgba(245, 158, 11, 0.8), 0 4px 10px rgba(0,0,0,0.3);';
      } else if (isAccredited) {
        // Level 2: Accredited Partner
        pinColor = '#0284C7';
        badgeIcon = '🍕';
        pinSize = 38;
        glowStyle = 'box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);';
      }

      if (isSelected) {
        pinColor = '#EF4444';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            background: ${pinColor};
            width: ${pinSize}px;
            height: ${pinSize}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: ${isSpotlight ? '3.5px solid #FEF08A' : '3px solid #ffffff'};
            ${glowStyle}
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${isSpotlight ? '18px' : '15px'};
            ">${badgeIcon}</span>
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
            ` : isAccredited ? `
              <div style="
                position: absolute;
                top: -3px;
                right: -3px;
                background: #EF4444;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: 2px solid white;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize],
        popupAnchor: [0, -pinSize]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${
              isSpotlight ? '#B45309' : isAccredited ? '#0284C7' : '#64748B'
            }; background: ${
              isSpotlight ? '#FEF3C7' : isAccredited ? '#E0F2FE' : '#F1F5F9'
            }; padding: 3px 7px; border-radius: 6px;">
              ${isSpotlight ? '👑 SPONSORIZZATO' : isAccredited ? '★ PARTNER FOLLOEAT' : 'DIRECTORY DIRETTA'}
            </span>
            ${place.rating ? `<span style="font-size: 12px; font-weight: bold; color: #F59E0B;">★ ${place.rating}</span>` : ''}
          </div>
          <h3 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #0F172A;">${place.name}</h3>
          <p style="font-size: 12px; color: #64748B; margin: 0 0 10px 0;">${place.address}</p>
          ${isAccredited ? `
            <div style="display: flex; gap: 6px;">
              <button id="btn-select-${place.id}" style="
                flex: 1;
                background: #0284C7;
                color: white;
                border: none;
                padding: 8px 10px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 11px;
                cursor: pointer;
              ">Vedi Menu</button>
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
                border-radius: 8px;
                font-weight: 700;
                font-size: 12px;
              ">📞 Chiama (${place.phone})</a>
              <button id="btn-signal-${place.id}" style="
                width: 100%;
                background: #F8FAFC;
                color: #64748B;
                border: 1px solid #E2E8F0;
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 10px;
                cursor: pointer;
              ">Segnala a FolloEat</button>
            </div>
          `}
        </div>
      `;

      marker.bindPopup(popupHtml);


      marker.on('popupopen', () => {
        const btnSelect = document.getElementById(`btn-select-${place.id}`);
        if (btnSelect) {
          btnSelect.onclick = () => onSelectPlace(place);
        }
        const btnSignal = document.getElementById(`btn-signal-${place.id}`);
        if (btnSignal && onSignalPlace) {
          btnSignal.onclick = () => onSignalPlace(place);
        }
      });

      markersRef.current.push(marker);
    });

    // Fly to selected place if provided
    if (selectedPlace?.lat && selectedPlace?.lng) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, { duration: 1.2 });
    }
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[450px]" />
      
      {/* Floating map legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200/80 z-[1000] text-xs space-y-1.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-follo-blue border border-white shadow-sm inline-block"></span>
          <span className="font-semibold text-slate-800">Partner Ufficiale (Ordini Diretti)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-white shadow-sm inline-block"></span>
          <span className="text-slate-600">Locale Censito (Da Attivare)</span>
        </div>
      </div>
    </div>
  );
}
