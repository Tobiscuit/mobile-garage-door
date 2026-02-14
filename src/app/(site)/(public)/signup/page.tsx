'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
        }),
      });

      if (res.ok) {
        // Signup successful, now login automatically or redirect to login
        // Let's try to login automatically to be smooth
        const loginRes = await fetch('/api/customers/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        
        if (loginRes.ok) {
            router.push('/portal');
        } else {
            router.push('/login?success=registered');
        }
      } else {
        const err = await res.json();
        setError(err.errors?.[0]?.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-golden-yellow p-8 text-center">
            <h1 className="text-3xl font-black text-charcoal-blue mb-2">Join the Hub</h1>
            <p className="text-charcoal-blue/80 text-sm font-medium">Create an account for instant 24/7 dispatch.</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="name@company.com"
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                    <input 
                    type="tel" 
                    name="phone"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="(555) 000-0000"
                    onChange={handleChange}
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                    <input 
                    type="password" 
                    name="password"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="Create a password"
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm Password</label>
                    <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="Confirm password"
                    onChange={handleChange}
                    />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    'CREATE ACCOUNT'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-golden-yellow font-bold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
