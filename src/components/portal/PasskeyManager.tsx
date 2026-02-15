'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function PasskeyManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnablePasskey = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authClient.passkey.addPasskey({
        name: 'This device',
        authenticatorAttachment: 'platform',
      });

      if (result.data) {
        setSuccess('Passkey enabled for this account.');
      } else {
        setError(result.error?.message || 'Failed to enable passkey.');
      }
    } catch {
      setError('Passkey setup was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSupported =
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined';

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Passkey</h3>
      <p className="text-sm text-gray-600 mb-4">
        Add a passkey after your first sign-in for faster passwordless login.
      </p>

      {!isSupported ? (
        <p className="text-sm text-red-600">Passkeys are not supported on this browser/device.</p>
      ) : (
        <button
          type="button"
          onClick={handleEnablePasskey}
          disabled={isLoading}
          className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Setting up...' : 'Enable Passkey'}
        </button>
      )}

      {success && <p className="text-sm text-green-700 mt-3">{success}</p>}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
