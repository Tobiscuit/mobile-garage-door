import React from 'react';

interface Request {
  id: string;
  ticketId: string;
  issueDescription: string;
  createdAt: string;
}

interface ServiceHistoryProps {
  requests: Request[];
}

export function ServiceHistory({ requests }: ServiceHistoryProps) {
  if (requests.length === 0) return null;

  return (
    <div className="pt-8">
      <h2 className="text-xl font-bold text-charcoal-blue uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">Service History</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {requests.map(req => (
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
  );
}
