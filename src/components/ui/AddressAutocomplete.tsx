'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['geometry', 'name', 'formatted_address', 'address_components'],
      types: ['address'],
    };

    setAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      onAddressSelect(place);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onAddressSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      className={className}
      defaultValue={defaultValue}
      placeholder={placeholder}
    />
  );
};
