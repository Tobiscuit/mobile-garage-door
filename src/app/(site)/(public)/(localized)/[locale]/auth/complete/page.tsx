import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';

export default async function AuthCompletePage() {
  if (process.env.AUTH_BYPASS === 'true') {
    redirect('/dashboard/dispatch');
  }

  let headerList = new Headers();
  let isStaticPass = false;
  try {
    headerList = await headers();
  } catch (e) {
    isStaticPass = true;
  }
  const session = await getSessionSafe(headerList);

  if (!session && !isStaticPass) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  const profileComplete = !!session.user.name;

  // All roles must complete their profile (name) before proceeding
  if (!profileComplete) {
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
