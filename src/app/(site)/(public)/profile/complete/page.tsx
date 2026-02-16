import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { getSessionSafe } from '@/lib/get-session-safe';
import { provisionUserFromSession } from '@/lib/provision-user-from-session';

async function completeStaffProfile(formData: FormData) {
  'use server';

  const session = await getSessionSafe(await headers());
  if (!session) {
    redirect('/login');
  }

  const email = String((session.user as { email?: string } | undefined)?.email || '').toLowerCase().trim();
  if (!email) {
    redirect('/login');
  }

  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (!fullName) {
    redirect('/profile/complete?error=missing_name');
  }

  const payload = await getPayload({ config: configPromise });
  const found = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
    depth: 0,
  });

  const user = found.docs[0] as { id: string | number } | undefined;
  if (!user) {
    redirect('/login');
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      name: fullName,
    } as any,
  });

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

  const { role, profileComplete } = await provisionUserFromSession(
    session.user as { email?: string; role?: string } | undefined,
  );

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
