'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Merchant } from '@/lib/types';
import { isMerchantOpenNow } from '@/lib/opening-hours';
import {
  Navigation,
  Layers,
  Search,
  MapPin,
  Phone,
  ExternalLink,
  Utensils,
  Compass,
  CheckCircle2,
  X,
  Filter,
  Boxes,
  Clock,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InteractiveMapProps {
  places: Merchant[];
  selectedPlace?: Merchant | null;
  onSelectPlace: (place: Merchant) => void;
  onSignalPlace?: (place: Merchant) => void;
}

type TileType = 'standard' | 'voyager' | 'satellite';

interface ZoneTarget {
  id: string;
  name: string;
  coords: [number, number];
  zoom: number;
}

const FOLLONICA_ZONES: ZoneTarget[] = [
  { id: 'all', name: 'Golfo Completo', coords: [42.9230, 10.7565], zoom: 14 },
  { id: 'centro', name: 'Centro & Via Roma', coords: [42.9225, 10.7580], zoom: 16 },
  { id: 'lungomare', name: 'Lungomare V.le Italia', coords: [42.9255, 10.7485], zoom: 15 },
  { id: 'senzuno', name: 'Senzuno & Foce Gora', coords: [42.9185, 10.7615], zoom: 16 },
  { id: 'pratoranieri', name: 'Pratoranieri', coords: [42.9310, 10.7345], zoom: 16 },
  { id: 'cassarello', name: 'Cassarello & 167', coords: [42.9165, 10.7700], zoom: 16 },
];

const MAP_CATEGORIES = [
  { id: 'ALL', label: 'Tutti i Locali', icon: '🍽️' },
  { id: 'PIZZA', label: 'Pizze', icon: '🍕' },
  { id: 'PESCE', label: 'Pesce & Mare', icon: '🐟' },
  { id: 'TRATTORIA', label: 'Trattorie & Cucina Tipica', icon: '🥘' },
  { id: 'GELATO', label: 'Gelati & Bar', icon: '🍨' },
  { id: 'BURGER', label: 'Burger & Pub', icon: '🍔' },
  { id: 'SCHIACCIATA', label: 'Pineta & Schiacciate', icon: '🥪' },
  { id: 'PARTNER', label: 'Partner Accreditati', icon: '👑' },
];

export default function InteractiveMap({
  places,
  selectedPlace,
  onSelectPlace,
  onSignalPlace
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileLayerType, setTileLayerType] = useState<TileType>('standard');
  const [isClusterEnabled, setIsClusterEnabled] = useState(true);
  const [isOpenNowOnly, setIsOpenNowOnly] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [selectedMapCat, setSelectedMapCat] = useState('ALL');
  const [activeZone, setActiveZone] = useState('all');
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 250);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Compute venue counts per category for live filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: places.length,
      PIZZA: 0,
      PESCE: 0,
      TRATTORIA: 0,
      GELATO: 0,
      BURGER: 0,
      SCHIACCIATA: 0,
      PARTNER: 0
    };

    places.forEach(p => {
      const c = (p.category || '').toLowerCase();
      const n = p.name.toLowerCase();
      if (c.includes('pizz') || n.includes('pizz') || n.includes('lampadino') || n.includes('disco rosso')) counts.PIZZA++;
      if (c.includes('pesce') || c.includes('mare') || c.includes('marin') || c.includes('balnear') || n.includes('bagno') || n.includes('sottomarino') || n.includes('scalo') || n.includes('miramare') || n.includes('baracca') || n.includes('cerboli') || n.includes('terrazza') || n.includes('florida')) counts.PESCE++;
      if (c.includes('trattoria') || c.includes('osteria') || c.includes('tipica') || n.includes('sauro') || n.includes('nascosta') || n.includes('katia') || n.includes('santarino')) counts.TRATTORIA++;
      if (c.includes('gelat') || c.includes('pasticc') || c.includes('bar ') || c.includes('caff') || n.includes('peggi') || n.includes('pagni') || n.includes('ricci') || n.includes('villa rosa')) counts.GELATO++;
      if (c.includes('burger') || c.includes('pub') || c.includes('birr') || n.includes('lord') || n.includes('poldo') || n.includes('yankees') || n.includes('winners')) counts.BURGER++;
      if (c.includes('pineta') || c.includes('chiosco') || c.includes('panin') || n.includes('fratelli') || n.includes('boschetto') || n.includes('golfo') || n.includes('ghiottone')) counts.SCHIACCIATA++;
      if (p.is_accredited === 1 || p.is_partner === 1 || p.is_spotlight === 1) counts.PARTNER++;
    });

    return counts;
  }, [places]);

  // Compute number of open venues currently
  const openNowCount = useMemo(() => {
    return places.filter(p => isMerchantOpenNow(p).isOpen).length;
  }, [places]);

  // Filter places displayed on map according to internal quick search and category
  const visiblePlaces = useMemo(() => {
    let res = places;
    if (selectedMapCat !== 'ALL') {
      const catKey = selectedMapCat.toLowerCase();
      res = res.filter(p => {
        const c = (p.category || '').toLowerCase();
        const n = p.name.toLowerCase();
        if (catKey === 'pizza') return c.includes('pizz') || n.includes('pizz') || n.includes('lampadino') || n.includes('disco rosso');
        if (catKey === 'pesce') return c.includes('pesce') || c.includes('mare') || c.includes('marin') || c.includes('balnear') || n.includes('bagno') || n.includes('sottomarino') || n.includes('scalo') || n.includes('miramare') || n.includes('baracca') || n.includes('cerboli') || n.includes('terrazza') || n.includes('florida');
        if (catKey === 'trattoria') return c.includes('trattoria') || c.includes('osteria') || c.includes('tipica') || n.includes('sauro') || n.includes('nascosta') || n.includes('katia') || n.includes('santarino');
        if (catKey === 'gelato') return c.includes('gelat') || c.includes('pasticc') || c.includes('bar ') || c.includes('caff') || n.includes('peggi') || n.includes('pagni') || n.includes('ricci') || n.includes('villa rosa');
        if (catKey === 'burger') return c.includes('burger') || c.includes('pub') || c.includes('birr') || n.includes('lord') || n.includes('poldo') || n.includes('yankees') || n.includes('winners');
        if (catKey === 'schiacciata') return c.includes('pineta') || c.includes('chiosco') || c.includes('panin') || n.includes('fratelli') || n.includes('boschetto') || n.includes('golfo') || n.includes('ghiottone');
        if (catKey === 'partner') return p.is_accredited === 1 || p.is_partner === 1 || p.is_spotlight === 1;
        return true;
      });
    }

    if (mapSearch.trim()) {
      const q = mapSearch.toLowerCase().trim();
      res = res.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q))
      );
    }

    if (isOpenNowOnly) {
      res = res.filter(p => isMerchantOpenNow(p).isOpen);
    }

    return res;
  }, [places, mapSearch, selectedMapCat, isOpenNowOnly]);

  // Fit bounds helper to frame all currently visible venues
  const fitToVisiblePlaces = () => {
    if (!mapInstanceRef.current || visiblePlaces.length === 0) return;
    const coords = visiblePlaces
      .filter(p => p.lat && p.lng)
      .map(p => [p.lat, p.lng] as [number, number]);
    if (coords.length > 0) {
      mapInstanceRef.current.fitBounds(coords, { padding: [50, 50], maxZoom: 16 });
    }
  };

  // Initialize Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        (window as any).L = L;

        // Dynamically load leaflet.markercluster
        try {
          await import('leaflet.markercluster');
        } catch (clusterErr) {
          console.warn('MarkerCluster dynamic load warning:', clusterErr);
        }

        if (isCancelled || !mapContainerRef.current) return;

        leafletRef.current = L;

        // Cleanup if existing
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Follonica Center Coordinates (Gulf of Follonica, Town Center, Lungomare)
        const map = L.map(mapContainerRef.current, {
          center: [42.9230, 10.7565],
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: true
        });

        // Add Zoom Control to bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer
        const tileConfig = getTileConfig(tileLayerType);
        const tileLayer = L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: 19,
          subdomains: tileConfig.subdomains || 'abc'
        }).addTo(map);

        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;

        // Render markers with cluster support
        renderPins(L, map, visiblePlaces, selectedPlace, isClusterEnabled);

        // Ensure tiles render crisply without gray boxes
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);

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
  }, []);

  // Update Tile Layer dynamically when changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((module) => {
      const L = module.default;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const tileConfig = getTileConfig(tileLayerType);
      const newTile = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: 19,
        subdomains: tileConfig.subdomains || 'abc'
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
    });
  }, [tileLayerType]);

  // Update markers when visiblePlaces, selectedPlace, isClusterEnabled or isOpenNowOnly changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    renderPins(leafletRef.current, mapInstanceRef.current, visiblePlaces, selectedPlace, isClusterEnabled);
  }, [visiblePlaces, selectedPlace, isClusterEnabled, isOpenNowOnly]);

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

  function getTileConfig(type: TileType) {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri World Imagery HD &copy; Esri',
          subdomains: ''
        };
      case 'voyager':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd'
        };
      case 'standard':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: 'abc'
        };
    }
  }

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
      name.includes('terrazza') ||
      name.includes('florida') ||
      name.includes('miramare') ||
      name.includes('cerboli')
    ) {
      return { bg: '#0284C7', emoji: '🐟', label: 'Ristorante di Mare' };
    }
    if (cat.includes('pasticc') || cat.includes('gelat') || name.includes('gelat') || name.includes('peggi') || name.includes('pagni') || name.includes('ricci') || name.includes('villa rosa')) {
      return { bg: '#DB2777', emoji: '🍨', label: 'Gelateria & Dolci' };
    }
    if (cat.includes('burger') || cat.includes('pub') || cat.includes('birr') || name.includes('lord') || name.includes('poldo') || name.includes('yankees') || name.includes('winners')) {
      return { bg: '#B45309', emoji: '🍔', label: 'Burger & Pub' };
    }
    if (cat.includes('pineta') || cat.includes('chiosco') || name.includes('fratelli') || name.includes('boschetto') || name.includes('golfo') || name.includes('ghiottone')) {
      return { bg: '#059669', emoji: '🥪', label: 'Chiosco & Schiacciate' };
    }
    if (cat.includes('trattoria') || cat.includes('osteria') || cat.includes('rosticceria') || cat.includes('tipica') || name.includes('sauro') || name.includes('nascosta') || name.includes('katia') || name.includes('santarino')) {
      return { bg: '#7C2D12', emoji: '🥘', label: 'Trattoria Maremmana' };
    }

    return { bg: '#475569', emoji: '🍴', label: 'Ristorante Follonica' };
  }

  function renderPins(
    L: any,
    map: any,
    items: Merchant[],
    active: Merchant | null | undefined,
    clusterMode: boolean
  ) {
    if (!map) return;

    // Safely remove previous layer if present
    if (markersLayerRef.current) {
      try {
        map.removeLayer(markersLayerRef.current);
      } catch {
        // ignore
      }
      markersLayerRef.current = null;
    }

    let layer: any;

    if (clusterMode && typeof (L as any).markerClusterGroup === 'function') {
      layer = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 45,
        disableClusteringAtZoom: 16, // At street level zoom 16+, individual SVG teardrops are shown
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = 36;
          let clusterClass = 'follo-cluster-small';
          if (count >= 25) {
            size = 46;
            clusterClass = 'follo-cluster-large';
          } else if (count >= 10) {
            size = 40;
            clusterClass = 'follo-cluster-medium';
          }

          return L.divIcon({
            html: `
              <div class="follo-marker-cluster ${clusterClass}">
                <span class="follo-cluster-badge">
                  <span>${count}</span>
                </span>
              </div>
            `,
            className: 'follo-cluster-icon',
            iconSize: L.point(size, size)
          });
        }
      });
    } else {
      layer = L.layerGroup();
    }

    let activeMarker: any = null;

    items.forEach((place) => {
      if (!place.lat || !place.lng) return;

      const isSpotlight = place.is_spotlight === 1;
      const isAccredited = place.is_accredited === 1 || place.is_partner === 1;
      const isSelected = active?.id === place.id;

      const categoryData = getCategoryPinData(place.category, place.name);

      let pinWidth = 32;
      let pinHeight = 42;
      let pinColor = categoryData.bg;
      let strokeColor = '#ffffff';
      let strokeWidth = 2.5;

      if (isSpotlight) {
        pinWidth = 38;
        pinHeight = 48;
        pinColor = '#D97706';
        strokeColor = '#FEF08A';
        strokeWidth = 3;
      } else if (isAccredited) {
        pinWidth = 36;
        pinHeight = 46;
        pinColor = '#0284C7';
        strokeColor = '#ffffff';
        strokeWidth = 3;
      }

      if (isSelected) {
        pinWidth = 42;
        pinHeight = 52;
        pinColor = '#EF4444';
        strokeColor = '#FFFFFF';
        strokeWidth = 3.5;
      }

      // Exact mathematical SVG teardrop pin:
      // Width = pinWidth, Height = pinHeight
      // The tip of the needle is EXACTLY at (pinWidth / 2, pinHeight)
      const cx = pinWidth / 2;
      const cy = pinWidth / 2;
      const r = (pinWidth / 2) - 2.5;
      const pathD = `M ${cx} ${pinHeight} C ${pinWidth * 0.15} ${pinHeight * 0.65}, 2 ${pinWidth * 0.7}, 2 ${cy} A ${r} ${r} 0 1 1 ${pinWidth - 2} ${cy} C ${pinWidth - 2} ${pinWidth * 0.7}, ${pinWidth * 0.85} ${pinHeight * 0.65}, ${cx} ${pinHeight} Z`;

      const badgeHtml = isSpotlight
        ? `<rect x="${cx - 15}" y="1" width="30" height="11" rx="5.5" fill="#F59E0B" stroke="#ffffff" stroke-width="1.5"/><text x="${cx}" y="8" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">TOP</text>`
        : isAccredited
        ? `<rect x="${cx - 14}" y="1" width="28" height="11" rx="5.5" fill="#0284C7" stroke="#ffffff" stroke-width="1.5"/><text x="${cx}" y="8" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">PRO</text>`
        : '';

      const svgIconHtml = `
        <div style="position: relative; width: ${pinWidth}px; height: ${pinHeight}px; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); transition: transform 0.15s ease;">
          <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 ${pinWidth} ${pinHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${pathD}" fill="${pinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            <circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="#ffffff" fill-opacity="0.96" />
            <text x="${cx}" y="${cy + 1}" font-size="${pinWidth * 0.36}" text-anchor="middle" dominant-baseline="central">${categoryData.emoji}</text>
            ${badgeHtml}
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'follo-svg-marker',
        html: svgIconHtml,
        iconSize: [pinWidth, pinHeight],
        iconAnchor: [pinWidth / 2, pinHeight],
        popupAnchor: [0, -pinHeight - 2]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      if (active?.id === place.id) {
        activeMarker = marker;
      }

      const openStatus = isMerchantOpenNow(place);

      // Free navigation URL (works on Google Maps, Apple Maps, or Waze without any paid API keys)
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

      const popupHtml = `
        <div style="font-family: inherit; min-width: 260px; padding: 4px;">
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
          <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">${place.address}</p>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; ${
            openStatus.isOpen ? 'background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;' : 'background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;'
          }">
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${openStatus.isOpen ? '#10B981' : '#94A3B8'};"></span>
              <span>${openStatus.statusLabel}</span>
            </span>
            <span style="font-size: 9px; opacity: 0.85;">${openStatus.nextTransition}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${isAccredited ? `
              <button id="map-btn-menu-${place.id}" style="
                width: 100%;
                background: #0284C7;
                color: white;
                border: none;
                padding: 9px 12px;
                border-radius: 10px;
                font-weight: 800;
                font-size: 12px;
                cursor: pointer;
              ">Vedi Menù & Ordina Subito</button>
            ` : `
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
            `}

            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
              color: #475569;
              background: #F1F5F9;
              padding: 6px 10px;
              border-radius: 8px;
            ">
              <span>🧭 Apri Navigatore GPS</span>
            </a>
          </div>
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

      layer.addLayer(marker);
    });

    map.addLayer(layer);
    markersLayerRef.current = layer;

    // Center on selected place and trigger popup
    if (activeMarker && active?.lat && active?.lng) {
      if (typeof layer.zoomToShowLayer === 'function') {
        layer.zoomToShowLayer(activeMarker, () => {
          activeMarker.openPopup();
        });
      } else {
        map.flyTo([active.lat, active.lng], 16, { duration: 0.8 });
        activeMarker.openPopup();
      }
    }
  }

  const handleZoneFlyTo = (zone: ZoneTarget) => {
    setActiveZone(zone.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(zone.coords, zone.zoom, { duration: 0.8 });
    }
  };

  const accreditedCount = places.filter(p => p.is_accredited === 1 || p.is_partner === 1).length;

  return (
    <div className={`w-full h-full relative bg-slate-100 flex flex-col font-sans select-none transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen' : 'min-h-[480px]'
    }`}>
      {/* Fullscreen Active Floating Indicator & Exit Pill */}
      {isFullscreen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 pointer-events-auto animate-in fade-in slide-in-from-top-3">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Mappa Schermo Intero · Follonica (58022)
          </span>
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Esci (Esc)</span>
          </button>
        </div>
      )}

      {/* Top Floating Map Controls Container */}
      <div className={`absolute top-3 left-3 right-3 ${isFullscreen ? 'z-[1000] pt-12 sm:pt-0' : 'z-20'} flex flex-col gap-2 pointer-events-none`}>
        {/* Row 1: Search Bar & Tool Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Search Bar on Map */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca locale o via nella mappa..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-white/95 backdrop-blur-md rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-follo-blue"
            />
            {mapSearch && (
              <button
                onClick={() => setMapSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen Expand/Collapse Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl backdrop-blur-md shadow-md border text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-follo-red text-white border-follo-red'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-follo-blue'
              }`}
              title={isFullscreen ? "Esci da Schermo Intero (Esc)" : "Espandi Mappa a Schermo Intero"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* "Aperto Ora" Live Filter Toggle on Map */}
            <button
              onClick={() => setIsOpenNowOnly(!isOpenNowOnly)}
              className={`px-3 py-2 rounded-xl backdrop-blur-md shadow-md border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isOpenNowOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isOpenNowOnly ? "Disattiva filtro per mostrare tutti i locali" : "Mostra solo i ristoranti attualmente aperti"}
            >
              <span className={`w-2 h-2 rounded-full ${isOpenNowOnly ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline">Aperto ora</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                isOpenNowOnly ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {openNowCount}
              </span>
            </button>

            {/* Cluster Toggle Button */}
            <button
              onClick={() => setIsClusterEnabled(!isClusterEnabled)}
              className={`px-3 py-2 rounded-xl backdrop-blur-md shadow-md border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isClusterEnabled
                  ? 'bg-follo-blue text-white border-follo-blue shadow-sky-500/20'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isClusterEnabled ? "Cluster attivo: clicca per vedere tutti i singoli pin" : "Cluster disattivato: clicca per raggruppare i locali in zoom out"}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isClusterEnabled ? 'Cluster ON' : 'Cluster OFF'}</span>
            </button>

            {/* Tile Layer Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
                className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                title="Cambia stile mappa gratuito"
              >
                <Layers className="w-3.5 h-3.5 text-follo-blue" />
                <span className="hidden sm:inline">
                  {tileLayerType === 'standard'
                    ? 'Stradale OSM'
                    : tileLayerType === 'voyager'
                    ? 'Chiara CARTO'
                    : 'Satellite HD'}
                </span>
              </button>

              {isLayersMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 w-48 z-30 space-y-1 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setTileLayerType('standard');
                      setIsLayersMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      tileLayerType === 'standard' ? 'bg-follo-blue text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Mappa Stradale (OSM)</span>
                    {tileLayerType === 'standard' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setTileLayerType('voyager');
                      setIsLayersMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      tileLayerType === 'voyager' ? 'bg-follo-blue text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Chiara Elegante (CARTO)</span>
                    {tileLayerType === 'voyager' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setTileLayerType('satellite');
                      setIsLayersMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      tileLayerType === 'satellite' ? 'bg-follo-blue text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Vista Satellite Aerea HD</span>
                    {tileLayerType === 'satellite' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Center Follonica Shortcut */}
            <button
              onClick={() => handleZoneFlyTo(FOLLONICA_ZONES[0])}
              className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="Centra su Follonica"
            >
              <Navigation className="w-3.5 h-3.5 text-follo-red" />
              <span className="hidden sm:inline">Centro</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Strip directly on Map */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-md">
          <div className="flex items-center gap-1 shrink-0 px-1 text-[11px] font-black text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-follo-blue" />
            <span className="hidden md:inline">Filtro Categoria:</span>
          </div>

          {MAP_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedMapCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedMapCat(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-follo-blue text-white shadow-md ring-2 ring-follo-blue/30'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Zone Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          <span className="text-[10px] font-black uppercase text-slate-700 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 shadow-xs shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-follo-red" />
            <span>Zone:</span>
          </span>
          {FOLLONICA_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleZoneFlyTo(zone)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-xs backdrop-blur-md transition-all shrink-0 cursor-pointer ${
                activeZone === zone.id
                  ? 'bg-follo-slate text-white shadow-sm'
                  : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200/80'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Row 4: Active Filter Banner (shown when a filter is active) */}
        {(selectedMapCat !== 'ALL' || isOpenNowOnly) && (
          <div className="self-start pointer-events-auto flex flex-wrap items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-xs animate-in fade-in">
            <span>
              Filtrato per:{' '}
              {selectedMapCat !== 'ALL' && (
                <strong className="mr-1">
                  {MAP_CATEGORIES.find((c) => c.id === selectedMapCat)?.icon}{' '}
                  {MAP_CATEGORIES.find((c) => c.id === selectedMapCat)?.label}
                </strong>
              )}
              {selectedMapCat !== 'ALL' && isOpenNowOnly && <span> + </span>}
              {isOpenNowOnly && (
                <strong className="text-emerald-400">🟢 Aperto adesso</strong>
              )}
              <span className="text-slate-300 ml-1">({visiblePlaces.length} locali)</span>
            </span>
            <button
              onClick={() => {
                setSelectedMapCat('ALL');
                setIsOpenNowOnly(false);
              }}
              className="ml-1 px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Azzera tutti i filtri e mostra tutti i ristoranti"
            >
              <span>Azzera Filtri</span>
              <X className="w-3 h-3" />
            </button>
            <button
              onClick={fitToVisiblePlaces}
              className="ml-0.5 px-2 py-0.5 rounded bg-follo-blue hover:bg-follo-blue-dark text-[10px] font-bold transition-colors cursor-pointer"
              title="Inquadra tutti i locali filtrati"
            >
              Inquadra
            </button>
          </div>
        )}
      </div>

      {/* Leaflet Map DOM Element Container */}
      <div ref={mapContainerRef} className="w-full flex-1 h-full min-h-[420px] z-0" />

      {/* Floating Info & Category Legend Bar (Collapsible to prevent overlapping) */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[20] pointer-events-auto max-w-[calc(100%-1.5rem)] sm:max-w-sm">
        {isLegendOpen ? (
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-200/90 text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-follo-red" />
                <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                  {selectedMapCat !== 'ALL'
                    ? `${MAP_CATEGORIES.find(c => c.id === selectedMapCat)?.label} (${visiblePlaces.length}/${places.length})`
                    : `Follonica (${visiblePlaces.length} Locali)`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  HD
                </span>
                <button
                  onClick={() => setIsLegendOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Comprimi legenda per vedere tutta la mappa"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
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
              <p className="text-[11px] text-slate-600 leading-snug">
                Censimento georeferenziato reale di Follonica: 100+ ristoranti, pizzerie, chalet e bar su terraferma con coordinate GPS esatte. Puoi accreditare qualsiasi locale dalla console <strong>SuperAdmin</strong> (/admin).
              </p>
            )}

            {/* Interactive Category Filter Strip at Bottom */}
            <div className="pt-2 flex items-center justify-between gap-1 text-[11px] border-t border-slate-100 font-medium overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedMapCat('PIZZA')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'PIZZA' ? 'bg-orange-100 text-orange-800 ring-1 ring-orange-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍕 Pizze
              </button>
              <button
                onClick={() => setSelectedMapCat('PESCE')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'PESCE' ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🐟 Mare
              </button>
              <button
                onClick={() => setSelectedMapCat('BURGER')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'BURGER' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍔 Burger
              </button>
              <button
                onClick={() => setSelectedMapCat('SCHIACCIATA')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'SCHIACCIATA' ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🥪 Pineta
              </button>
              <button
                onClick={() => setSelectedMapCat('GELATO')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'GELATO' ? 'bg-pink-100 text-pink-800 ring-1 ring-pink-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍨 Gelati
              </button>
              <button
                onClick={() => setSelectedMapCat('TRATTORIA')}
                className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedMapCat === 'TRATTORIA' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🥘 Trattorie
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200/90 text-xs font-bold transition-all cursor-pointer hover:shadow-xl hover:border-follo-blue"
          >
            <MapPin className="w-3.5 h-3.5 text-follo-red shrink-0" />
            <span>Legenda & Categorie ({visiblePlaces.length})</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
