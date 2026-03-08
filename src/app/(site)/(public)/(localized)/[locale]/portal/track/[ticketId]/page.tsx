import { headers } from 'next/headers';
import { getDB } from "@/db";
import { serviceRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionSafe } from '@/lib/get-session-safe';
import { getCloudflareContext } from "@/lib/cloudflare";
import TechTracker from '@/features/portal/TechTracker';

export const dynamic = 'force-dynamic';

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; ticketId: string }>;
}) {
  const { ticketId } = await params;

  let headerList = new Headers();
  try {
    headerList = await headers();
  } catch {}
  const session = await getSessionSafe(headerList);
  if (!session) return null;

  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  // Find the service request by ticketId
  const [sr] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.ticketId, ticketId))
    .limit(1);

  if (!sr) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-white mb-2">Ticket not found</h2>
        <p className="text-gray-400">No service request found for #{ticketId}</p>
      </div>
    );
  }

  const isTrackable = ['dispatched', 'on_site'].includes(sr.status || '');

  if (!isTrackable) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">📋</p>
        <h2 className="text-xl font-bold text-white mb-2">Not yet dispatched</h2>
        <p className="text-gray-400 mb-1">
          Ticket #{ticketId} — Status: <span className="capitalize font-medium">{sr.status}</span>
        </p>
        <p className="text-gray-500 text-sm">
          Live tracking will appear here once your technician is en route.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <TechTracker requestId={String(sr.id)} ticketId={ticketId} />
    </div>
  );
}
