import { headers } from 'next/headers';
import { redirect } from 'vinext/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';

export default async function AuthCompletePage() {
  if (process.env.AUTH_BYPASS === 'true') {
    redirect('/dashboard/dispatch');
  }

  const headerList = await headers();
  const session = await getSessionSafe(headerList);

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  const profileComplete = true; // Temporary mock

  if ((role === 'admin' || role === 'technician' || role === 'dispatcher') && !profileComplete) {
    redirect('/profile/complete');
  }

  if (role === 'admin' || role === 'dispatcher') {
    redirect('/dashboard');
  }
  if (role === 'technician') {
    redirect('/dashboard/technician');
  }

  redirect('/portal');
}
