'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableJobs, acceptJob } from '@/app/actions/technician';

export default function TechnicianDashboard() {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = async () => {
      const data = await getAvailableJobs();
      setJobs(data);
  };

  useEffect(() => {
    // Initial fetch
    fetchJobs();
    
    // Poll for new jobs every 15 seconds (Simple "Real-time" for MVP)
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (jobId: string) => {
      if (confirm('Accept this assignment?')) {
          await acceptJob(jobId);
          await fetchJobs(); // Refresh list
      }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // run only in browser
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        reg.pushManager.getSubscription().then(sub => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime)) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribeToNotifications = async () => {
    if (!registration) return;
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });
      setSubscription(sub);
      setIsSubscribed(true);
      console.log('Web Push Subscription:', JSON.stringify(sub));
      // TODO: Send subscription to server to save in User profile
      alert('Subscribed to Dispatch Alerts!');
    } catch (error) {
        console.error('Failed to subscribe', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <div className="min-h-screen bg-charcoal-blue text-white font-work-sans p-6">
        <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-3 h-3 bg-golden-yellow rounded-full animate-pulse"></span>
                    Tech Ops
                </h1>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-golden-yellow">
                    JD
                </div>
            </div>

            {/* Notification Status */}
            <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uplink Status</div>
                    <div className={`font-bold ${isSubscribed ? 'text-green-400' : 'text-gray-500'}`}>
                        {isSubscribed ? 'CONNECTED (PUSH ACTIVE)' : 'OFFLINE'}
                    </div>
                </div>
                {!isSubscribed && (
                    <button 
                        onClick={subscribeToNotifications}
                        className="bg-golden-yellow text-charcoal-blue px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-yellow-400 transition-colors"
                    >
                        Enable Alerts
                    </button>
                )}
            </div>

            {/* Job List */}
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Pending Assignments</h2>
            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white/10 rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide ${job.urgency === 'Emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                {job.urgency}
                            </span>
                            <span className="text-xs font-mono text-gray-400">{job.ticketId}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{job.customerName}</h3>
                        <p className="text-gray-300 text-sm mb-1">{job.customerAddress}</p>
                        <p className="text-gray-400 text-xs italic mb-4 line-clamp-2">"{job.issue}"</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white/10 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-white/20 transition-colors">
                                Decline
                            </button>
                            <button 
                                onClick={() => handleAccept(job.id)}
                                className="bg-green-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-green-400 transition-colors shadow-lg shadow-green-900/20"
                            >
                                Accept Mission
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
