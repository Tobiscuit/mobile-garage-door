'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from '@/hooks/useTranslations';

type ViewState = 'idle' | 'gmail-nudge' | 'sent';

export default function LoginPage() {
  const t = useTranslations('login_page');
  const [email, setEmail] = useState('');
  const [view, setView] = useState<ViewState>('idle');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const isGmail = email.toLowerCase().endsWith('@gmail.com') || email.toLowerCase().endsWith('@googlemail.com');

  const triggerGoogleSSO = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/auth/complete` });
    } catch {
      setInfo(t('error_google'));
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      setInfo(t('error_email_required'));
      return;
    }
    setLoading(true);
    setInfo('');
    try {
      const result = await authClient.signIn.magicLink({ email, callbackURL: `${window.location.origin}/auth/complete` });
      if (result?.error) {
        setInfo(result.error.message || t('error_magic_link'));
      } else {
        setView('sent');
      }
    } catch {
      setInfo(t('error_magic_link'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setInfo(t('error_email_required'));
      return;
    }
    if (isGmail) {
      setView('gmail-nudge');
    } else {
      sendMagicLink();
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Subtle animated background circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-golden-yellow/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-charcoal-blue/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphic card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden transition-all duration-500">
          {/* Header */}
          <div className="bg-charcoal-blue p-8 text-center">
            <h1 className="text-3xl font-black text-white mb-1">{t('title')}</h1>
            <p className="text-gray-400 text-sm">{t('subtitle')}</p>
          </div>

          <div className="p-8">
            {info && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 text-sm font-medium border border-amber-100 animate-[fadeSlideIn_0.3s_ease-out]">
                {info}
              </div>
            )}

            {/* ── IDLE STATE ─────────────────────────── */}
            {view === 'idle' && (
              <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease-out]">
                {/* Google OAuth hero button */}
                <button
                  onClick={triggerGoogleSSO}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-charcoal-blue/30 hover:shadow-lg text-gray-700 font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t('btn_google')}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white/80 text-gray-400 font-semibold uppercase tracking-widest">{t('or_email')}</span>
                  </div>
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('email_label')}</label>
                    <input
                      type="email"
                      required
                      autoFocus
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 font-medium text-black focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all text-lg"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setInfo(''); }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        {t('btn_send_magic_link')}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── GMAIL NUDGE STATE ──────────────────── */}
            {view === 'gmail-nudge' && (
              <div className="space-y-5 animate-[fadeSlideIn_0.4s_ease-out]">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
                  <div className="text-2xl mb-2">💡</div>
                  <p className="font-bold text-charcoal-blue text-base mb-1">{t('gmail_detected')}</p>
                  <p className="text-sm text-gray-500">{t('gmail_suggestion')}</p>
                </div>

                <button
                  onClick={triggerGoogleSSO}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" fillOpacity="0.8" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" fillOpacity="0.6" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#fff" fillOpacity="0.7" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" fillOpacity="0.8" />
                  </svg>
                  {t('btn_google')}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white/80 text-gray-400 font-semibold uppercase tracking-widest">{t('or')}</span>
                  </div>
                </div>

                <button
                  onClick={sendMagicLink}
                  disabled={loading}
                  className="w-full text-gray-500 hover:text-charcoal-blue font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : t('btn_magic_link_anyway')}
                </button>
              </div>
            )}

            {/* ── SENT STATE ─────────────────────────── */}
            {view === 'sent' && (
              <div className="text-center space-y-6 animate-[fadeSlideIn_0.4s_ease-out]">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-charcoal-blue mb-2">{t('check_email')}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t('magic_link_sent', { email })}
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={sendMagicLink}
                    disabled={loading}
                    className="text-sm font-semibold text-charcoal-blue hover:text-golden-yellow transition-colors disabled:opacity-60"
                  >
                    {t('btn_resend')}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { setView('idle'); setEmail(''); setInfo(''); }}
                    className="text-sm font-semibold text-gray-400 hover:text-charcoal-blue transition-colors"
                  >
                    {t('btn_different_email')}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>{t('terms_agree')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}