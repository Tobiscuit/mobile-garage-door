'use client';

import React, { useRef, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AddressAutocompleteProps {
  onAddressSelect: (place: any) => void;
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
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Session Token
  useEffect(() => {
    setSessionToken(uuidv4());
  }, []);

  // Handle Input Change
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value || value.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: value, sessionToken }),
      });
      
      const data = await response.json();
      
      if (data.suggestions) {
        setPredictions(data.suggestions.map((item: any) => ({
            place_id: item.placePrediction.placeId,
            main_text: item.placePrediction.structuredFormat?.mainText?.text || '',
            secondary_text: item.placePrediction.structuredFormat?.secondaryText?.text || '',
            description: item.placePrediction.text.text
        })));
        setIsOpen(true);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Autocomplete Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Selection
  const handlePredictionSelect = async (prediction: any) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    setPredictions([]);

    try {
        const response = await fetch(`/api/places/details/${prediction.place_id}?sessionToken=${sessionToken}`);
        const placeDetails = await response.json();
        
        if (placeDetails.id) {
            // Map to a format consistent with your app
             const placeResult = {
                place_id: placeDetails.id,
                name: placeDetails.displayName?.text || '',
                formatted_address: placeDetails.formattedAddress,
                geometry: {
                    location: {
                        lat: () => placeDetails.location.latitude,
                        lng: () => placeDetails.location.longitude
                    }
                },
                address_components: placeDetails.addressComponents
            };
            
            onAddressSelect(placeResult);
            // Reset Session Token after selection (End of Session)
            setSessionToken(uuidv4());
        }
    } catch (error) {
        console.error("Details Error:", error);
    }
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
                  {prediction.main_text}
                </span>
                <span className="block text-xs text-gray-400 group-hover:text-gray-300">
                  {prediction.secondary_text}
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
