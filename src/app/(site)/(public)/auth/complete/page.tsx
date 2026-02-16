import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AuthCompletePage() {
  if (process.env.AUTH_BYPASS === 'true') {
    redirect('/dashboard/dispatch');
  }

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (role === 'admin' || role === 'dispatcher') {
    redirect('/dashboard/dispatch');
  }
  if (role === 'technician') {
    redirect('/dashboard/technician');
  }

  redirect('/portal');
}
