import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';
import { provisionUserFromSession } from '@/lib/provision-user-from-session';

export default async function AppEntryPage() {
  if (process.env.AUTH_BYPASS === 'true') {
    redirect('/dashboard/dispatch');
  }

  const headerList = await headers();
  const session = await getSessionSafe(headerList);

  if (!session) {
    redirect('/login');
  }

  const { role, profileComplete } = await provisionUserFromSession(session.user as { email?: string; role?: string } | undefined);

  if ((role === 'admin' || role === 'technician' || role === 'dispatcher') && !profileComplete) {
    redirect('/profile/complete');
  }

  if (role === 'admin' || role === 'dispatcher') {
    redirect('/dashboard/dispatch');
  }
  if (role === 'technician') {
    redirect('/dashboard/technician');
  }

  redirect('/portal');
}
