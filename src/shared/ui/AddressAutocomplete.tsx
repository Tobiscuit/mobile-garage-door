'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface RecentAddress {
  address: string;
  label?: string | null;
}

interface AddressAutocompleteProps {
  /** Lets a <label htmlFor> name the input. */
  id?: string;
  onAddressSelect: (place: any) => void;
  className?: string;
  defaultValue?: string;
  placeholder?: string;
  recentAddresses?: RecentAddress[];
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  onAddressSelect,
  className,
  defaultValue,
  placeholder = "Start typing your address...",
  recentAddresses = [],
}) => {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const t = useTranslations('contact_page');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Session Token
  useEffect(() => {
    setSessionToken(crypto.randomUUID());
  }, []);

  // Filter recent addresses client-side based on typed input
  const filteredRecent = useMemo(() => {
    if (!recentAddresses.length) return [];
    if (!inputValue.trim()) {
      // Show top 5 most recent when no input
      return recentAddresses.slice(0, 5);
    }
    // Fuzzy filter: match any part of the address
    const query = inputValue.toLowerCase();
    return recentAddresses.filter(a =>
      a.address.toLowerCase().includes(query) ||
      (a.label && a.label.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [inputValue, recentAddresses]);

  // Show dropdown on focus if there are recent addresses
  const handleFocus = () => {
    setIsFocused(true);
    if (recentAddresses.length > 0 && !inputValue.trim()) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Handle Input Change
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Always show dropdown if there are matching recent addresses
    if (filteredRecent.length > 0) {
      setIsOpen(true);
    }

    if (!value || value.length < 3) {
      setPredictions([]);
      if (filteredRecent.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
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

  // Handle selecting a recent address
  const handleRecentSelect = (addr: RecentAddress) => {
    setInputValue(addr.address);
    setIsOpen(false);
    setPredictions([]);
    // Pass as a simple result — no need for Places API call
    onAddressSelect({
      formatted_address: addr.address,
      // Signal this is from history, not Places
      _fromHistory: true,
    });
  };

  // Handle selecting a Google Places prediction
  const handlePredictionSelect = async (prediction: any) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    setPredictions([]);

    try {
      const response = await fetch(`/api/places/details/${prediction.place_id}?sessionToken=${sessionToken}`);
      // TypeScript 7 types Response.json() as `unknown` where 5.x gave `any`,
      // so the shape this handler already assumed is now stated explicitly.
      // These fields mirror the Google Places (New) details response proxied
      // by /api/places/details. Runtime behaviour is unchanged.
      const placeDetails = (await response.json()) as {
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location: { latitude: number; longitude: number };
        addressComponents?: any;
      };

      if (placeDetails.id) {
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
        setSessionToken(crypto.randomUUID());
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

  const showRecent = filteredRecent.length > 0;
  const showPlaces = predictions.length > 0;
  const showDropdown = isOpen && (showRecent || showPlaces);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type="text"
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />

      {/* Hybrid Dropdown: Recent Sites + Google Places */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-brand-line bg-brand-white text-brand-ink shadow-2xl">
          
          {/* Recent Addresses Section */}
          {showRecent && (
            <>
              <div className="px-4 py-2 bg-brand-tint">
                <span className="text-xs font-bold text-brand-ink-muted uppercase tracking-widest">
                  {inputValue.trim() ? t('address_matching') : t('address_recent')}
                </span>
              </div>
              {filteredRecent.map((addr, i) => (
                <button
                  key={`recent-${i}`}
                  onClick={() => handleRecentSelect(addr)}
                  className="w-full text-left px-4 py-3 text-sm text-brand-ink hover:bg-brand-tint border-b border-brand-line last:border-0 flex items-start gap-3 group"
                >
                  <div className="mt-0.5 text-brand-red">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-bold">
                      {addr.address}
                    </span>
                    {addr.label && (
                      <span className="block text-xs text-brand-ink-muted">
                        {addr.label}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Divider between sections */}
          {showRecent && showPlaces && (
            <div className="border-t border-brand-line" />
          )}

          {/* Google Places Section */}
          {showPlaces && (
            <>
              {showRecent && (
                <div className="px-4 py-2 bg-brand-tint">
                  <span className="text-xs font-bold text-brand-ink-muted uppercase tracking-widest">
                    {t('address_new')}
                  </span>
                </div>
              )}
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePredictionSelect(prediction)}
                  className="w-full text-left px-4 py-3 text-sm text-brand-ink hover:bg-brand-tint border-b border-brand-line last:border-0 flex items-start gap-3 group"
                >
                  <div className="mt-0.5 text-brand-red">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-bold">
                      {prediction.main_text}
                    </span>
                    <span className="block text-xs text-brand-ink-muted">
                      {prediction.secondary_text}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          <div className="px-4 py-2 bg-brand-tint text-xs text-brand-ink-muted flex justify-end">
            <span>Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
};
