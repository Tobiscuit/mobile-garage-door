'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [usePasskey, setUsePasskey] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    if (usePasskey) {
      try {
        const result = await authClient.signIn.passkey();
        if (result.data) {
          window.location.href = '/app';
          return;
        }
        setError(result.error?.message || 'Passkey sign-in failed.');
      } catch {
        setError('Passkey sign-in was cancelled or failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: `${window.location.origin}/app`,
      });
      if (result.data) {
        setInfo('Magic link sent. Check your email (or server logs in local dev).');
      } else {
        setError(result.error?.message || 'Failed to send magic link');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-charcoal-blue p-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">Mission Control Access</h1>
            <p className="text-gray-300 text-sm">Staff sign in for dispatch and operations.</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium border border-green-100">
                {info}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Work Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  placeholder="staff@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={usePasskey}
                  onChange={(e) => setUsePasskey(e.target.checked)}
                  className="mr-2"
                />
                <label>Use Passkey</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70"
              >
                {loading ? 'Please wait...' : usePasskey ? 'SIGN IN WITH PASSKEY' : 'EMAIL ME A MAGIC LINK'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Customer access?{' '}
              <Link href="/login" className="text-golden-yellow font-bold hover:underline">
                Go to customer login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
