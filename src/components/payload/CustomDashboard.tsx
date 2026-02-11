'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CustomDashboard: React.FC = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cancelled, router]);

  if (cancelled) {
    return (
      <div className="p-12 text-center text-[#7f8c8d]">
        <h1 className="text-3xl font-black text-[#2c3e50] mb-4">Database View</h1>
        <p className="mb-8">You are accessing the raw database tables.</p>
        <Link 
          href="/dashboard"
          className="px-6 py-3 bg-[#f1c40f] text-[#2c3e50] font-bold rounded-lg hover:bg-[#f39c12] transition-colors"
        >
          Go to Command Center
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="animate-spin w-12 h-12 border-4 border-[#ffffff10] border-t-[#f1c40f] rounded-full mb-8"></div>
      
      <h1 className="text-3xl font-black text-[#2c3e50] mb-2">
        Welcome Back
      </h1>
      <p className="text-[#7f8c8d] mb-8 text-lg">
        Redirecting to Command Center in {countdown}s...
      </p>

      <div className="flex gap-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-[#2c3e50] text-white font-bold rounded-lg hover:bg-[#34495e] transition-colors"
        >
          Go Now
        </button>
        <button 
          onClick={() => setCancelled(true)}
          className="px-6 py-3 bg-transparent border border-[#bdc3c7] text-[#7f8c8d] font-bold rounded-lg hover:bg-[#ecf0f1] transition-colors"
        >
          Stay Here (Database)
        </button>
      </div>
    </div>
  );
};

export default CustomDashboard;
