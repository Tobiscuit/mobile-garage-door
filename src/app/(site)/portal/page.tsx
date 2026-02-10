import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function PortalDashboard() {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) return null; // Should be handled by layout
  const customer = user as any;

  const activeRequests = await payload.find({
    collection: 'service-requests' as any,
    where: {
      customer: { equals: user.id },
      status: { not_equals: 'completed' }, // and not cancelled
    },
    sort: '-createdAt',
  });

  const pastRequests = await payload.find({
    collection: 'service-requests' as any,
    where: {
      customer: { equals: user.id },
      status: { equals: 'completed' },
    },
    sort: '-createdAt',
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-charcoal-blue text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl font-black mb-2">Welcome back, {customer.name}</h1>
                <p className="text-gray-400">Manage your garage service requests and view history.</p>
            </div>
            <Link 
                href="/portal/book"
                className="bg-golden-yellow text-charcoal-blue font-black py-4 px-8 rounded-xl uppercase tracking-wider shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Book New Service
            </Link>
        </div>
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 p-32 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Active Requests */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-blue uppercase tracking-widest border-b border-gray-200 pb-2">Active Service</h2>
            
            {activeRequests.totalDocs === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-gray-200 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-charcoal-blue mb-1">No Active Requests</h3>
                    <p className="text-gray-500 mb-6">Everything looks good! Need help with your door?</p>
                    <Link href="/portal/book" className="text-golden-yellow font-bold hover:underline">Start a new request</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeRequests.docs.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group hover:shadow-lg transition-all">
                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-mono text-sm text-gray-500 font-bold">{req.ticketId}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    req.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    req.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                                    req.status === 'on_site' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {String(req.status).replace('_', ' ')}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-charcoal-blue text-lg mb-1">{String(req.issueDescription).substring(0, 50)}...</h3>
                                        <p className="text-sm text-gray-500">Scheduled: {req.scheduledTime ? new Date(req.scheduledTime).toLocaleDateString() + ' ' + new Date(req.scheduledTime).toLocaleTimeString() : 'Pending Scheduling'}</p>
                                    </div>
                                </div>
                                
                                {/* Status Tracker Bar */}
                                <div className="relative pt-6 pb-2">
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full bg-golden-yellow transition-all duration-1000 ${
                                            req.status === 'pending' ? 'w-1/4' :
                                            req.status === 'confirmed' ? 'w-2/4' :
                                            req.status === 'dispatched' ? 'w-3/4' :
                                            req.status === 'on_site' ? 'w-[90%]' : 'w-full'
                                        }`}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-2">
                                        <span>Received</span>
                                        <span>Confirmed</span>
                                        <span>En Route</span>
                                        <span>On Site</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pastRequests.totalDocs > 0 && (
                <div className="pt-8">
                     <h2 className="text-xl font-bold text-charcoal-blue uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">Service History</h2>
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                        {pastRequests.docs.map(req => (
                            <div key={req.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="font-bold text-charcoal-blue">{String(req.issueDescription).substring(0, 40)}...</div>
                                    <div className="text-xs text-gray-500 font-mono">{req.ticketId} • {new Date(req.createdAt).toLocaleDateString()}</div>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">COMPLETED</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
             <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Account Details</h3>
                <div className="space-y-3">
                    <div>
                        <div className="text-xs text-gray-400">Name</div>
                        <div className="font-medium text-charcoal-blue">{customer.name}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Email</div>
                        <div className="font-medium text-charcoal-blue">{customer.email}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Phone</div>
                        <div className="font-medium text-charcoal-blue">{customer.phone}</div>
                    </div>
                </div>
             </div>

             <div className="bg-charcoal-blue/5 rounded-xl p-6 border border-charcoal-blue/10">
                <h3 className="font-bold text-charcoal-blue text-sm mb-2">Need immediate assistance?</h3>
                <p className="text-sm text-gray-600 mb-4">Our support team is available 24/7 for existing ticket updates.</p>
                <a href="tel:5550000000" className="text-charcoal-blue font-bold text-lg hover:text-golden-yellow transition-colors block">
                    (555) 000-0000
                </a>
             </div>
        </div>

      </div>
    </div>
  );
}
