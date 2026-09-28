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

      const isPartner = place.is_partner === 1;
      const isSelected = selectedPlace?.id === place.id;

      const pinColor = isPartner ? '#0284C7' : '#64748B';
      const badgeIcon = isPartner ? '🍕' : '🍴';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            background: ${isSelected ? '#EF4444' : pinColor};
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
            ">${badgeIcon}</span>
            ${isPartner ? `
              <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #EF4444;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${isPartner ? '#0284C7' : '#64748B'}; background: ${isPartner ? '#E0F2FE' : '#F1F5F9'}; padding: 2px 6px; border-radius: 4px;">
              ${isPartner ? '★ PARTNER FOLLOEAT' : 'LOCALE CENSITO'}
            </span>
            ${place.rating ? `<span style="font-size: 12px; font-weight: bold; color: #F59E0B;">★ ${place.rating}</span>` : ''}
          </div>
          <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0F172A;">${place.name}</h3>
          <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">${place.address}</p>
          ${isPartner ? `
            <button id="btn-select-${place.id}" style="
              width: 100%;
              background: #0284C7;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 12px;
              cursor: pointer;
            ">Vedi Menu & Ordina</button>
          ` : `
            <button id="btn-signal-${place.id}" style="
              width: 100%;
              background: #F1F5F9;
              color: #0F172A;
              border: 1px solid #CBD5E1;
              padding: 8px 12px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
              cursor: pointer;
            ">Segnala locale a FolloEat</button>
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
