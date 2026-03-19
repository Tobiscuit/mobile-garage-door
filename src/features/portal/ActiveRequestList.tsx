'use client';

import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface Request {
  id: string;
  ticketId: string;
  status: 'pending' | 'confirmed' | 'dispatched' | 'on_site' | 'completed' | 'cancelled';
  issueDescription: string;
  scheduledTime?: string;
}

interface ActiveRequestListProps {
  requests: Request[];
}

export function ActiveRequestList({ requests }: ActiveRequestListProps) {
  const t = useTranslations('portal_page');
  return (
    <div className="lg:col-span-2 space-y-6">
      <h2 className="text-xl font-bold text-charcoal-blue uppercase tracking-widest border-b border-gray-200 pb-2">{t('active_service')}</h2>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-charcoal-blue mb-1">{t('no_active_requests')}</h3>
          <p className="text-gray-500">{t('no_active_desc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
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
                    <p className="text-sm text-gray-500">{t('scheduled')}: {req.scheduledTime === 'ASAP' ? <span className="text-red-600 font-bold">ASAP</span> : req.scheduledTime ? new Date(req.scheduledTime).toLocaleDateString() + ' ' + new Date(req.scheduledTime).toLocaleTimeString() : t('pending_scheduling')}</p>
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
                    <span>{t('received')}</span>
                    <span>{t('confirmed')}</span>
                    <span>{t('en_route')}</span>
                    <span>{t('on_site')}</span>
                  </div>
                </div>

                {/* Track Technician Button — only for dispatched/on_site */}
                {(req.status === 'dispatched' || req.status === 'on_site') && (
                  <a
                    href={`/en/portal/track/${req.ticketId}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-charcoal-blue text-golden-yellow font-bold text-sm uppercase tracking-wider hover:bg-charcoal-blue/90 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Track Technician Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
