'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from '@/hooks/useTranslations';

export default function LoginPage() {
  const t = useTranslations('login_page');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'email' | 'methods' | 'password' | 'signup'>('email');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setInfo(t('error_email_first'));
      return;
    }
    setInfo('');
    setStep('methods');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfo('');
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setInfo(error.message || t('error_login_failed'));
      } else {
        window.location.href = '/app';
      }
    } catch {
      setInfo(t('error_login_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfo('');
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) {
        setInfo(error.message || t('error_signup_failed'));
      } else {
        window.location.href = '/app';
      }
    } catch {
      setInfo(t('error_signup_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSSO = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/app` });
    } catch {
      setInfo(t('error_google_init'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
          <div className="bg-charcoal-blue p-8 text-center relative">
            {step !== 'email' && (
              <button onClick={() => setStep('email')} className="absolute left-6 top-8 text-white/70 hover:text-white transition-colors" aria-label={t('go_back_aria')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
            )}
            <h1 className="text-3xl font-black text-white mb-2">{t('title')}</h1>
            <p className="text-gray-400 text-sm">
              {step === 'email' ? t('step_email') : 
               step === 'methods' ? t('welcome_back', { email }) :
               step === 'password' ? t('step_password') :
               t('step_signup')}
            </p>
          </div>
          
          <div className="p-8">
            {info && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-lg mb-6 text-sm font-medium border border-amber-100 animate-in fade-in slide-in-from-top-2">
                {info}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailNext} className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('email_label')}</label>
                  <input 
                    type="email" 
                    required
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all text-lg"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex justify-center items-center text-lg tracking-wide"
                >
                  {t('btn_next')}
                </button>
              </form>
            )}

            {step === 'methods' && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <button
                  onClick={triggerGoogleSSO}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t('btn_google')}
                </button>
                
                <button
                  onClick={() => setStep('password')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                  {t('btn_password')}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400 font-bold uppercase tracking-widest">{t('new_user')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('signup')}
                  disabled={loading}
                  className="w-full bg-golden-yellow text-charcoal-blue hover:bg-[#f3ce34] font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  {t('btn_new_account')}
                </button>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('password_label')}</label>
                  <input 
                    type="password" 
                    required
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all text-lg tracking-[0.3em]"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex justify-center items-center text-lg tracking-wide disabled:opacity-70"
                >
                  {loading ? (
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : t('btn_signin')}
                </button>
              </form>
            )}

            {step === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('fullname_label')}</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder={t('placeholder_name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('create_password_label')}</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all tracking-[0.3em]"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2">{t('password_hint')}</p>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex justify-center items-center text-lg tracking-wide disabled:opacity-70"
                >
                  {loading ? (
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : t('btn_create_account')}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>{t('terms_agree')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}