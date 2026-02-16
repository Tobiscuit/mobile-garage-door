'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
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
          const userRole = (result.data.user as { role?: string } | undefined)?.role;
          if (userRole === 'admin') router.push('/dashboard');
          else if (userRole === 'technician') router.push('/dashboard/technician');
          else router.push('/portal');
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
            <h1 className="text-3xl font-black text-white mb-2">My Garage Portal</h1>
            <p className="text-gray-400 text-sm">Sign in to manage service requests.</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={usePasskey} 
                  onChange={(e) => setUsePasskey(e.target.checked)} 
                  className="mr-2"
                />
                <label>Use Passkey (skip password/MFA)</label>
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
                ) : (
                    usePasskey ? 'SIGN IN WITH PASSKEY' : 'EMAIL ME A MAGIC LINK'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-golden-yellow font-bold hover:underline">
                Register here
              </Link>
            </div>
            <div className="mt-3 text-center text-sm text-gray-400">
              Staff member?{' '}
              <Link href="/staff-login" className="text-charcoal-blue font-bold hover:underline">
                Staff sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
