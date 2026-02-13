'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
  onAddressSelect: (place: google.maps.places.PlaceResult) => void;
  className?: string;
  defaultValue?: string;
  placeholder?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  className,
  defaultValue,
  placeholder = "Start typing your address..."
}) => {
  const placesLib = useMapsLibrary('places');
  
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Services
  useEffect(() => {
    if (!placesLib) return;

    setAutocompleteService(new placesLib.AutocompleteService());
    setSessionToken(new placesLib.AutocompleteSessionToken());
    
    // We need a dummy div for PlacesService if we use the legacy getDetails, 
    // but we can also use the new Place class if desired. 
    // For safety and type compatibility with existing PlaceResult, we'll use PlacesService.
    const dummyDiv = document.createElement('div');
    setPlacesService(new placesLib.PlacesService(dummyDiv));
  }, [placesLib]);

  // Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (!autocompleteService || !sessionToken) return;

    setIsLoading(true);
    autocompleteService.getPlacePredictions({
      input: value,
      sessionToken: sessionToken,
      types: ['address'],
      componentRestrictions: { country: 'us' } // Optional: restrict to US
    }, (results, status) => {
      setIsLoading(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results);
        setIsOpen(true);
      } else {
        setPredictions([]);
        setIsOpen(false);
      }
    });
  };

  // Handle Selection
  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    setPredictions([]);

    if (!placesLib || !placesService || !sessionToken) return;

    // Fetch Details
    placesService.getDetails({
      placeId: prediction.place_id,
      fields: ['geometry', 'name', 'formatted_address', 'address_components'],
      sessionToken: sessionToken
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        onAddressSelect(place);
        // Refresh token for next session
        setSessionToken(new placesLib.AutocompleteSessionToken());
      }
    });
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className={`${className} transition-all duration-300 focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none`}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {/* Custom Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-charcoal-blue border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePredictionSelect(prediction)}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3 group"
            >
              <div className="mt-0.5 text-gray-500 group-hover:text-golden-yellow transition-colors">
                 {/* Map Pin Icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="block font-bold text-white">
                  {prediction.structured_formatting.main_text}
                </span>
                <span className="block text-xs text-gray-400 group-hover:text-gray-300">
                  {prediction.structured_formatting.secondary_text}
                </span>
              </div>
            </button>
          ))}
          
          <div className="px-4 py-2 bg-black/20 text-[10px] text-gray-500 flex justify-end">
            <span className="opacity-50">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
};
