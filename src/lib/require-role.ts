import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';

/**
 * Server-side role guard for admin-only pages.
 * Call at the top of any page that should be restricted to admins.
 * Technicians and customers will be redirected.
 */
export async function requireAdmin() {
  let headersList = new Headers();
  try {
    headersList = await headers();
  } catch {
    return; // Static pass during build
  }

  const session = await getSessionSafe(headersList);
  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role === 'technician') {
    redirect('/dashboard/technician');
  }
  if (role === 'customer' || !role) {
    redirect('/portal');
  }
}

/**
 * Server-side role guard that allows both admin and technician.
 * Use for pages accessible to all staff (notifications, etc.)
 */
export async function requireStaff() {
  let headersList = new Headers();
  try {
    headersList = await headers();
  } catch {
    return;
  }

  const session = await getSessionSafe(headersList);
  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  if (role === 'customer' || !role) {
    redirect('/portal');
  }
}
