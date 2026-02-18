'use client';

import React, { useEffect, useRef, useState } from 'react';

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
                fillColor: "#fbbf24",
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
    <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-inner border border-black/5 group bg-charcoal-blue">
      <div ref={mapRef} className={`w-full h-full transition-opacity duration-1000 ${mapLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`} />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-golden-yellow text-xs font-bold uppercase tracking-widest">
                Initializing Uplink...
            </div>
        </div>
      )}

      {/* Techno-Hero Overlay */}
       <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
           <div className="bg-charcoal-blue/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/10 flex justify-between items-center">
               <div>
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Sector</div>
                   <div className="text-white font-bold text-sm">Houston Metro + 50mi</div>
               </div>
               <div className="flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                   </span>
                   <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
               </div>
           </div>
       </div>
       
       {/* Decorative Corner */}
       <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-golden-yellow/20 to-transparent rounded-bl-full pointer-events-none"></div>
    </div>
  );
};
