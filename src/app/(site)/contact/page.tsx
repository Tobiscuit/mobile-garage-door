'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactHero } from '@/components/contact/ContactHero';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { ServiceAreaMap } from '@/components/ui/ServiceAreaMap';

const ContactContent = () => {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    
    // Determine Hero Type
    let heroType: 'repair' | 'install' | 'contractor' | 'general' = 'general';
    if (typeParam === 'repair') heroType = 'repair';
    if (typeParam === 'install') heroType = 'install';
    if (typeParam === 'contractor') heroType = 'contractor';

    // State for urgency toggle
    const [urgency, setUrgency] = useState<'Standard' | 'Emergency'>('Standard');

    useEffect(() => {
        if (heroType === 'repair') {
            setUrgency('Emergency');
        } else {
            setUrgency('Standard');
        }
    }, [heroType]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        issue: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
        if (place.formatted_address) {
            setFormData(prev => ({ ...prev, address: place.formatted_address! }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mimic original alert behavior or implement server action later
        alert('Dispatch request received. Technician alerted.');
    };

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <APIProvider apiKey={API_KEY}>
            <ContactHero type={heroType} />
            <div className="container mx-auto max-w-6xl -mt-20 relative z-20 px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT: FORM SECTION */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden group">
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-gray-100"></div>
                            
                            <h2 className="text-4xl font-black text-charcoal-blue mb-2 tracking-tight relative z-10">
                                Open Support Ticket
                            </h2>
                            <p className="text-gray-500 font-medium mb-8 relative z-10">
                                Complete the secure dispatch form below.
                            </p>

                            {/* Urgency Toggle */}
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 relative z-10">
                                <button 
                                    onClick={() => setUrgency('Standard')}
                                    className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${urgency === 'Standard' ? 'bg-white text-charcoal-blue shadow-lg scale-100' : 'text-gray-400 hover:text-gray-600 scale-95'}`}
                                    type="button"
                                >
                                    Standard
                                </button>
                                <button 
                                    onClick={() => setUrgency('Emergency')}
                                    className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${urgency === 'Emergency' ? 'bg-red-600 text-white shadow-lg scale-100 shadow-red-500/30' : 'text-gray-400 hover:text-gray-600 scale-95'}`}
                                    type="button"
                                >
                                    <span className="relative flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${urgency === 'Emergency' ? 'bg-white' : 'bg-red-400'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${urgency === 'Emergency' ? 'bg-white' : 'bg-red-400'}`}></span>
                                    </span>
                                    Emergency (24/7)
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Name</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
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
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            placeholder="(555) 000-0000"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Location</label>
                                    <AddressAutocomplete
                                        onAddressSelect={handleAddressSelect}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                        placeholder="Street Address, City, Zip"
                                        defaultValue={formData.address}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issue Description</label>
                                    <textarea 
                                        name="issue"
                                        rows={4}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Describe the problem (e.g. 'Door stuck halfway', 'Spring snapped', 'New install quote')..."
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-charcoal-blue hover:bg-dark-charcoal text-white'}`}
                                >
                                    {urgency === 'Emergency' ? 'DISPATCH TECHNICIAN NOW' : 'SUBMIT REQUEST'}
                                </button>
                                
                                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Secure Transmission • 256-bit Encryption
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: INFO & MAP */}
                    <div className="lg:col-span-5 space-y-8 pt-12 lg:pt-0">
                        
                        {/* INFO CARD */}
                        <div className="bg-charcoal-blue text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
                            <div className="absolute top-0 right-0 p-32 bg-golden-yellow rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                            <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-golden-yellow rounded-full"></span>
                                Direct Contact
                            </h3>
                            
                            <div className="space-y-8 relative z-10">
                                <a href="tel:832-419-1293" className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-4 -mx-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-golden-yellow shrink-0 group-hover:bg-golden-yellow group-hover:text-charcoal-blue transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">24/7 Hotline</div>
                                        <div className="text-2xl font-bold font-mono tracking-tight group-hover:text-golden-yellow transition-colors">832-419-1293</div>
                                    </div>
                                </a>

                                <a href="mailto:dispatch@mobilgarage.com" className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-4 -mx-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-golden-yellow shrink-0 group-hover:bg-golden-yellow group-hover:text-charcoal-blue transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Support</div>
                                        <div className="text-lg font-medium group-hover:text-golden-yellow transition-colors">dispatch@mobilgarage.com</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* SERVICE AREA (Map Placeholder) */}
                        <ServiceAreaMap />
                    </div>
                </div>
            </div>
        </>
    );
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={
             <div className="h-screen flex items-center justify-center bg-charcoal-blue">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-golden-yellow mb-4"></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Establishing Uplink...</p>
                </div>
             </div>
        }>
            <ContactContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}