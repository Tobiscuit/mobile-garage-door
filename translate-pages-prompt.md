You are translating a Next.js garage door service website (Mobil Garage Door Pros, Houston TX) into Spanish (es) and Vietnamese (vi). The app uses `next-intl` with JSON message files in `messages/en.json`, `messages/es.json`, `messages/vi.json`.

## Your Task

For EACH page below:
1. Extract all hardcoded English strings
2. Create a namespace with descriptive translation keys
3. Output the JSON entries for en.json, es.json, and vi.json
4. Output the modified page.tsx using `useTranslations` (client) or `getTranslations` from `@/lib/server-translations` (server)

## Translation Patterns

**Client components** use:
```tsx
'use client';
import { useTranslations } from '@/hooks/useTranslations';

export default function SomePage() {
  const t = useTranslations('namespace_name');
  return <h1>{t('heading')}</h1>;
}
```

**Server components** use:
```tsx
import { getTranslations } from '@/lib/server-translations';

export default async function SomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'namespace_name' });
  return <h1>{t('heading')}</h1>;
}
```

## JSON Format

Flat key-value pairs inside a namespace object:
```json
{
  "login_page": {
    "title": "My Garage Portal",
    "email_label": "Email Address"
  }
}
```

For interpolation use `{variable}`: `"welcome_back": "Welcome back, {email}"`

## Important Rules
- Error messages FROM the auth API (`error.message`) should NOT be translated — they come from the server
- Fallback error strings in `setInfo()` / `setError()` SHOULD be translated
- Keep placeholder text like "name@example.com" and "••••••••" as-is
- Translate aria-labels
- Placeholders like "John Doe", "Jane Doe", "Acme Construction LLC" should be localized
- Spanish = Latin American Spanish, casual/professional tone for Houston TX garage door company
- Vietnamese = standard Vietnamese

---

## PAGE 1: `login/page.tsx` — Namespace: `login_page` (Client Component)

```tsx
'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'email' | 'methods' | 'password' | 'signup'>('email');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setInfo('Please enter your email address first.');
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
        setInfo(error.message || 'Login failed. Please check your credentials.');
      } else {
        window.location.href = '/app';
      }
    } catch {
      setInfo('An unexpected error occurred during login.');
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
        setInfo(error.message || 'Sign up failed. Please check your details.');
      } else {
        window.location.href = '/app';
      }
    } catch {
      setInfo('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSSO = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/app` });
    } catch {
      setInfo('Failed to initialize Google login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
          <div className="bg-charcoal-blue p-8 text-center relative">
            {step !== 'email' && (
              <button onClick={() => setStep('email')} className="absolute left-6 top-8 text-white/70 hover:text-white transition-colors" aria-label="Go back">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
            )}
            <h1 className="text-3xl font-black text-white mb-2">My Garage Portal</h1>
            <p className="text-gray-400 text-sm">
              {step === 'email' ? 'Enter your email to continue.' : 
               step === 'methods' ? `Welcome back, ${email}` :
               step === 'password' ? 'Enter your password.' :
               'Create your account.'}
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
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
                  NEXT
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
                  CONTINUE WITH GOOGLE
                </button>
                
                <button
                  onClick={() => setStep('password')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                  USE PASSWORD
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400 font-bold uppercase tracking-widest">New User?</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('signup')}
                  disabled={loading}
                  className="w-full bg-golden-yellow text-charcoal-blue hover:bg-[#f3ce34] font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  CREATE NEW ACCOUNT
                </button>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
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
                  ) : 'SIGN IN'}
                </button>
              </form>
            )}

            {step === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Create Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all tracking-[0.3em]"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters.</p>
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
                  ) : 'CREATE ACCOUNT'}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>By signing in, you agree to our Terms of Service.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## PAGE 2: `signup/page.tsx` — Namespace: `signup_page` (Client Component)

```tsx
'use client';

import React, { useState } from 'react';
import Link from '@/shared/ui/Link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
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
        setError("Passwords do not match.");
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
                        <div className="font-bold text-charcoal-blue text-sm">I represent a Builder / Company</div>
                        <div className="text-xs text-gray-500">Manage multiple job sites and access commercial pricing.</div>
                    </div>
                </label>

                {formData.isBuilder && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Company Name</label>
                        <input 
                            type="text" 
                            name="companyName"
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 font-medium text-[#2c3e50] focus:ring-2 focus:ring-[#f1c40f] outline-none"
                            placeholder="Acme Construction LLC"
                            onChange={handleChange}
                        />
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
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
    </div>
  );
}
```

---

## PAGE 3: `profile/complete/page.tsx` — Namespace: `profile_complete` (Server Component)

This is a SERVER component — use `getTranslations` from `@/lib/server-translations`.
Note: it also has a server action `completeStaffProfile` — DO NOT translate redirect paths.
The page function needs `params: Promise<{ locale: string }>` added to its props.

```tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDB } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionSafe } from '@/lib/get-session-safe';
import { getCloudflareContext } from "@/lib/cloudflare";

async function completeStaffProfile(formData: FormData) {
  'use server';

  const session = await getSessionSafe(await headers());
  if (!session) {
    redirect('/login');
  }

  const email = String(session.user.email || '').toLowerCase().trim();
  if (!email) {
    redirect('/login');
  }

  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (!fullName) {
    redirect('/profile/complete?error=missing_name');
  }

  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];

  if (!user) {
    redirect('/login');
  }

  await db.update(users).set({ name: fullName }).where(eq(users.id, user.id));

  redirect('/app');
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (process.env.AUTH_BYPASS === 'true') {
    redirect('/dashboard/dispatch');
  }

  const session = await getSessionSafe(await headers());
  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  const profileComplete = session.user.name ? true : false;

  if (!(role === 'admin' || role === 'technician' || role === 'dispatcher')) {
    redirect('/app');
  }

  if (profileComplete) {
    redirect('/app');
  }

  const params = await searchParams;
  const hasError = params.error === 'missing_name';

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-charcoal-blue p-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">Complete Your Profile</h1>
            <p className="text-gray-300 text-sm">Add your name to finish staff setup.</p>
          </div>

          <div className="p-8">
            {hasError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
                Please enter your first and last name.
              </div>
            )}

            <form action={completeStaffProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  placeholder="Alex"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 font-medium text-black focus:ring-2 focus:ring-[#f1c40f] focus:border-transparent outline-none transition-all"
                  placeholder="Rivera"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-4 rounded-xl transition-all"
              >
                Save and Continue
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## PAGE 4: `portal/page.tsx` — Namespace: `portal_page` (Server Component)

Server component — use `getTranslations` from `@/lib/server-translations`.
The page function needs `params: Promise<{ locale: string }>` added to its props.
Only a few inline strings (sub-components like PortalHeader, ActiveRequestList, AccountSidebar, ServiceHistory have their own hardcoded strings but are separate files):

```tsx
{/* Only inline strings to extract: */}
<h3 className="font-bold text-charcoal-blue">Builder Account</h3>
<p className="text-sm text-gray-600">You have access to multi-site management features.</p>
```

---

## OUTPUT FORMAT

For each page, output:
1. **`en.json` additions** — the namespace JSON block
2. **`es.json` additions** — Spanish translations
3. **`vi.json` additions** — Vietnamese translations
4. **Modified `page.tsx`** — full file with translations wired up

Output all 4 pages' translations, then all 4 modified files.
