'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfo('');

    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: `${window.location.origin}/app`,
      });
      setInfo('If your email is eligible, we sent a sign-in link.');
    } catch {
      // Keep response generic to avoid account enumeration.
      setInfo('If your email is eligible, we sent a sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-charcoal-blue p-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">My Garage Portal</h1>
            <p className="text-gray-400 text-sm">Customers, builders, and staff all sign in here.</p>
          </div>
          
          <div className="p-8">
            {info && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium border border-green-100">
                {info}
              </div>
            )}

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await authClient.signIn.social({ 
                    provider: 'google',
                    callbackURL: `${window.location.origin}/app`, 
                  });
                } catch {
                  setInfo('Failed to initialize Google login.');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-bold uppercase tracking-widest">Or Use Email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'CONTINUE WITH MAGIC LINK'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              No password required. We will email a secure one-time sign-in link.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
