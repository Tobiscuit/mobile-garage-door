'use client'

import React, { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';

function ContactContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [ticketId, setTicketId] = useState('');
  const [urgency, setUrgency] = useState<'Standard' | 'Emergency'>('Standard');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    issue: '',
  });

  useEffect(() => {
    // Generate a random ticket ID on mount (simulating a system generation)
    setTicketId(`TKT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().getFullYear()}`);
    
    // Auto-set urgency based on URL param
    if (typeParam === 'repair') {
        setUrgency('Emergency');
    }
  }, [typeParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Ticket ${ticketId} Created. Dispatching ${urgency} Team.`);
  };

  return (
        <div className="container mx-auto max-w-6xl">
            
            <div className="grid lg:grid-cols-12 gap-12">
                
                {/* LEFT: COMMAND CENTER FORM */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative">
                        {/* Status Bar */}
                        <div className={`h-2 w-full ${urgency === 'Emergency' ? 'bg-red-500 animate-pulse' : 'bg-charcoal-blue'}`}></div>
                        
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-charcoal-blue mb-2">Open Support Ticket</h1>
                                    <p className="text-steel-gray">Complete the dispatch form below.</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ticket ID</div>
                                    <div className="text-xl font-mono text-charcoal-blue">{ticketId}</div>
                                </div>
                            </div>

                            {/* URGENCY TOGGLE */}
                            <div className="bg-cloudy-white p-2 rounded-xl flex mb-10 border border-gray-200">
                                <button 
                                    onClick={() => setUrgency('Standard')}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${urgency === 'Standard' ? 'bg-white shadow-md text-charcoal-blue' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Standard Service
                                </button>
                                <button 
                                    onClick={() => setUrgency('Emergency')}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${urgency === 'Emergency' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-red-400'}`}
                                >
                                    <span className="relative flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 ${urgency !== 'Emergency' && 'hidden'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${urgency === 'Emergency' ? 'bg-white' : 'bg-red-400'}`}></span>
                                    </span>
                                    Emergency (24/7)
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Name</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            placeholder="Full Name"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            placeholder="(555) 000-0000"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Location</label>
                                    <input 
                                        type="text" 
                                        name="address"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                        placeholder="Street Address, City, Zip"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issue Description</label>
                                    <textarea 
                                        name="issue"
                                        rows={4}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                        placeholder="Describe the problem (e.g. 'Door stuck halfway', 'Spring snapped', 'New install quote')..."
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-charcoal-blue hover:bg-dark-charcoal text-white'}`}
                                >
                                    {urgency === 'Emergency' ? 'DISPATCH TECHNICIAN NOW' : 'SUBMIT REQUEST'}
                                </button>
                                
                                <p className="text-center text-xs text-gray-400">
                                    By submitting, you agree to receive SMS updates about your service request.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT: INFO & MAP */}
                <div className="lg:col-span-5 space-y-8">
                    
                    {/* INFO CARD */}
                    <div className="bg-charcoal-blue text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-golden-yellow rounded-full blur-[100px] opacity-10"></div>
                        <h3 className="text-2xl font-black mb-6 relative z-10">Direct Contact</h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-golden-yellow">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">24/7 Hotline</div>
                                    <div className="text-2xl font-bold font-mono">555-0123-456</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-golden-yellow">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Support</div>
                                    <div className="text-lg font-medium">dispatch@mobiledoor.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SERVICE AREA (Map Placeholder) */}
                    <div className="bg-gray-200 rounded-2xl h-80 w-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('/map-placeholder-if-exists.jpg')" }}>
                            {/* If no image, fallback gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
                        </div>
                        
                        {/* Radar Scan Effect */}
                        <div className="absolute inset-0 overflow-hidden">
                             <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-transparent via-golden-yellow/20 to-transparent -translate-x-1/2 -translate-y-1/2 animate-spin origin-center rounded-full opacity-30 blur-xl"></div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-bold text-charcoal-blue uppercase tracking-widest">Service Area</div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Serving the Greater Metropolitan Area + 50 mile radius. 3 techs currently in your sector.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20 px-6">
        <Suspense fallback={
             <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-blue"></div>
                <p className="mt-4 text-gray-500">Initializing Support Ticket...</p>
             </div>
        }>
            <ContactContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
