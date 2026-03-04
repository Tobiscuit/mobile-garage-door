import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDB } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionSafe } from '@/lib/get-session-safe';
import { getCloudflareContext } from "@/lib/cloudflare";
import { getTranslations } from '@/lib/server-translations';

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
  params,
}: {
  searchParams: Promise<{ error?: string }>;
  params: Promise<{ locale: string }>;
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

  const [search, { locale }] = await Promise.all([searchParams, params]);
  const hasError = search.error === 'missing_name';
  const t = await getTranslations({ locale, namespace: 'profile_complete' });

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-charcoal-blue p-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">{t('title')}</h1>
            <p className="text-gray-300 text-sm">{t('subtitle')}</p>
          </div>

          <div className="p-8">
            {hasError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {t('error_missing_name')}
              </div>
            )}

            <form action={completeStaffProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {t('first_name_label')}
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
                  {t('last_name_label')}
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
                {t('btn_save')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}