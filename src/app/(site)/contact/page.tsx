'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

const ContactContent = () => {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [urgency, setUrgency] = useState<'Standard' | 'Emergency'>('Standard');
    const [ticketId, setTicketId] = useState('TKT-LOADING...');

    useEffect(() => {
        if (typeParam === 'repair') {
            setUrgency('Emergency');
        } else {
            setUrgency('Standard');
        }
        // Generate pseudo-random ticket ID
        setTicketId(`TKT-2252-${Math.floor(1000 + Math.random() * 9000)}`);
    }, [typeParam]);

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
        alert('Dispatch request received. Technician alerted.');
        // Here you would typically call a server action
    };

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <APIProvider apiKey={API_KEY}>
            <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* LEFT: FORM SECTION */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">

                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-charcoal-blue mb-2 tracking-tight">Open Support Ticket</h1>
                                    <p className="text-gray-500 font-medium">Complete the dispatch form below.</p>
                                </div>
                                <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-sm font-bold text-gray-500 tracking-wider">
                                    TICKET ID <br/>
                                    <span className="text-charcoal-blue text-lg">{ticketId}</span>
                                </div>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8">
                                <button 
                                    onClick={() => setUrgency('Standard')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${urgency === 'Standard' ? 'bg-white text-charcoal-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    type="button"
                                >
                                    Standard Service
                                </button>
                                <button 
                                    onClick={() => setUrgency('Emergency')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${urgency === 'Emergency' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    type="button"
                                >
                                    {urgency === 'Emergency' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                                    Emergency (24/7)
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
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
                        <div className="bg-gray-200 rounded-3xl h-80 w-full relative overflow-hidden group shadow-inner border border-black/5">
                            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('/images/map-bg.jpg')" }}>
                                {/* Fallback gradient if image fails */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 -z-10"></div>
                            </div>

                            {/* Radar Scan Effect */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                 <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-transparent via-golden-yellow/20 to-transparent -translate-x-1/2 -translate-y-1/2 animate-spin-slow origin-center rounded-full opacity-30 blur-2xl"></div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-[10px] font-bold text-charcoal-blue uppercase tracking-widest">Deployment Zone</div>
                                        <div className="flex items-center gap-1.5 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-green-700 uppercase">Active</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        Greater Houston Metropolitan Area + 50 mile radius. <span className="text-charcoal-blue font-bold">3 technicians</span> currently patrolling your sector.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </APIProvider>
    );
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <Header />
      <main className="flex-grow pt-24">
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
