'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

const MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];

export const ServiceAreaMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const t = useTranslations('contact_page');

  useEffect(() => {
    const loadMap = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;

      // Check if script is already loaded
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (mapRef.current && (window as any).google) {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 29.7604, lng: -95.3698 }, // Houston
          zoom: 10,
          styles: MAP_STYLE,
          disableDefaultUI: true,
          backgroundColor: '#212121',
          gestureHandling: 'cooperative', // Better for scrolling pages
        });

        // Add a "Base" marker
        new (window as any).google.maps.Marker({
            position: { lat: 29.7604, lng: -95.3698 },
            map: map,
            icon: {
                path: (window as any).google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#ba233f", // brand red (logo)
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
            },
        });

        setMapLoaded(true);
      }
    };

    loadMap();
  }, []);

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl border border-brand-line bg-brand-tint">
      <div ref={mapRef} className={`h-full w-full ${mapLoaded ? 'opacity-100' : 'opacity-0'}`} />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-ink-muted">
            {t('map_loading')}
          </div>
        </div>
      )}

      {/* Service area caption. The fake "Online" status indicator was removed. */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4">
        <div className="rounded-xl border border-brand-line bg-brand-white/95 p-4 text-brand-ink shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-ink-muted">{t('map_area_label')}</div>
          <div className="text-sm font-bold">{t('map_area_value')}</div>
        </div>
      </div>
    </div>
  );
};
