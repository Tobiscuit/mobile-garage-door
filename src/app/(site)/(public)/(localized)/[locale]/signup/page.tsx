'use client';

import React, { useState } from 'react';
import Link from '@/shared/ui/Link';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('signup_page');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isBuilder: false,
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
        setError(t('error_passwords_match'));
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            customerType: formData.isBuilder ? 'builder' : 'residential',
            companyName: formData.isBuilder ? formData.companyName : undefined,
        }),
      });

      if (res.ok) {
        const loginRes = await fetch('/api/users/login', {
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
        setError(err.errors?.[0]?.message || t('error_registration_failed'));
      }
    } catch (err) {
      setError(t('error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-golden-yellow p-8 text-center">
            <h1 className="text-3xl font-black text-charcoal-blue mb-2">{t('title')}</h1>
            <p className="text-charcoal-blue/80 text-sm font-medium">{t('subtitle')}</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('fullname_label')}</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  placeholder={t('placeholder_name')}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('email_label')}</label>
                    <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="name@company.com"
                    onChange={handleChange}
                    />
              </div>

              {/* Builder Toggle */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox"
                        name="isBuilder"
                        checked={formData.isBuilder}
                        onChange={handleChange}
                        className="w-5 h-5 text-golden-yellow rounded focus:ring-golden-yellow border-gray-300"
                    />
                    <div>
                        <div className="font-bold text-charcoal-blue text-sm">{t('builder_toggle_title')}</div>
                        <div className="text-xs text-gray-500">{t('builder_toggle_desc')}</div>
                    </div>
                </label>

                {formData.isBuilder && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('company_label')}</label>
                        <input 
                            type="text" 
                            name="companyName"
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] outline-none"
                            placeholder={t('placeholder_company')}
                            onChange={handleChange}
                        />
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('phone_label')}</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('password_label')}</label>
                    <input 
                    type="password" 
                    name="password"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('confirm_password_label')}</label>
                    <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
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
                    t('btn_create_account')
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              {t('already_have_account')}{' '}
              <Link href="/login" className="text-golden-yellow font-bold hover:underline">
                {t('sign_in_link')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}