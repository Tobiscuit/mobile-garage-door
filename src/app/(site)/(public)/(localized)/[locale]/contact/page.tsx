'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { ContactHero } from '@/features/contact/ContactHero';
import { AddressAutocomplete } from '@/shared/ui/AddressAutocomplete';
import { ServiceAreaMap } from '@/shared/ui/ServiceAreaMap';
import { SquarePaymentModal } from '@/features/payment/SquarePaymentModal';


const ContactContent = () => {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const t = useTranslations('contact_page');
    
    // Determine Hero Type
    let heroType: 'repair' | 'install' | 'contractor' | 'general' = 'general';
    if (typeParam === 'repair') heroType = 'repair';
    if (typeParam === 'install') heroType = 'install';
    if (typeParam === 'contractor') heroType = 'contractor';

    const isFromPortal = searchParams.get('source') === 'portal';

    // State for urgency toggle
    const [urgency, setUrgency] = useState<'Standard' | 'Emergency'>('Standard');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [recentAddresses, setRecentAddresses] = useState<{ address: string; label: string | null }[]>([]);
    const [prefillLoaded, setPrefillLoaded] = useState(false);

    useEffect(() => {
        if (heroType === 'repair') {
            setUrgency('Emergency');
        } else {
            setUrgency('Standard');
        }
    }, [heroType]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        issue: '',
        scheduledTime: ''
    });

    // Smart prefill: fetch profile + addresses for logged-in users
    useEffect(() => {
        if (prefillLoaded) return;
        (async () => {
            try {
                const res = await fetch('/api/user/prefill', { credentials: 'include' });
                if (!res.ok) throw new Error('prefill failed');
                const data = await res.json();
                if (data.prefill) {
                    setFormData(prev => ({
                        ...prev,
                        name: prev.name || data.prefill.name,
                        email: prev.email || data.prefill.email,
                        phone: prev.phone || data.prefill.phone,
                        address: prev.address || data.prefill.lastAddress,
                    }));
                }
                if (data.recentAddresses?.length > 0) {
                    setRecentAddresses(data.recentAddresses);
                }
            } catch (e) {
                // Silent fail — non-logged-in users won't have data
            }

            // AI Diagnosis prefill from sessionStorage
            try {
                const raw = sessionStorage.getItem('aiDiagnosis');
                if (raw) {
                    const diagnosis = JSON.parse(raw);
                    if (diagnosis.fromDiagnosis) {
                        setFormData(prev => ({
                            ...prev,
                            issue: diagnosis.issueDescription || prev.issue,
                        }));
                        if (diagnosis.urgency === 'emergency') {
                            setUrgency('Emergency');
                        }
                        sessionStorage.removeItem('aiDiagnosis');
                    }
                }
            } catch (e) {
                console.error('Failed to parse aiDiagnosis', e);
            }

            setPrefillLoaded(true);
        })();
    }, [prefillLoaded]);

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
        // Save the address for future prefill
        if (formData.address) {
            fetch('/api/user/save-address', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: formData.address }),
            }).catch(() => {});
        }
        // Open Payment Modal
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentResult: any) => {
        // TODO: Create Service Request in Payload CMS
        console.log('Payment Successful:', paymentResult);
        setShowPaymentModal(false);
        setIsPaid(true);
        // alert('Payment Confirmed! Technician Dispatched.');
    };

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    if (isPaid) {
        return (
             <>
                <ContactHero type={heroType} />
                <div className="container mx-auto max-w-4xl -mt-20 relative z-20 px-6 pb-24">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-t-8 border-green-500">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-4xl font-black text-charcoal-blue mb-4">
                            {urgency === 'Emergency' ? 'REQUEST RECEIVED' : 'REQUEST RECEIVED'}
                        </h2>
                        <p className="text-gray-500 text-lg mb-4 max-w-lg mx-auto">
                            Your service request for <span className="font-bold text-charcoal-blue">{formData.address || t('your_location')}</span> has been submitted successfully.
                        </p>
                        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                            {urgency === 'Emergency' 
                                ? "🚨 Our team is reviewing your emergency request and will assign a technician shortly. You'll receive a notification when they're on the way."
                                : "We'll review your request and assign a technician. You'll receive a notification with your appointment details."
                            }
                        </p>
                        
                        {/* Map showing service area */}
                        <div className="bg-charcoal-blue rounded-3xl p-1 overflow-hidden shadow-lg relative h-64 mb-8">
                             <ServiceAreaMap />
                             <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Status</div>
                                <div className="text-white font-mono font-bold text-lg">PENDING REVIEW</div>
                             </div>
                        </div>

                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">
                            Priority: {urgency}
                        </p>
                        <a href="/portal" className="inline-block bg-charcoal-blue hover:bg-dark-charcoal text-white font-bold py-3 px-8 rounded-xl transition-all">
                            View in My Portal →
                        </a>
                    </div>
                </div>
             </>
        );
    }

    return (
        <>
            <SquarePaymentModal 
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                amount={99.00}
                customerDetails={{
                    ...formData,
                    urgency
                }}
            />

            <ContactHero type={heroType} />
            <div className="container mx-auto max-w-6xl -mt-20 relative z-20 px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT: FORM SECTION */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden group">
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-gray-100"></div>
                            
                            <h2 className="text-4xl font-black text-charcoal-blue mb-2 tracking-tight relative z-10">
                                {t('open_ticket')}
                            </h2>
                            <p className="text-gray-500 font-medium mb-8 relative z-10">
                                {t('ticket_desc')}
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
                                    {t('emergency')}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('contact_name')}</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                        placeholder={t('full_name')}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('email_label')}</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            required
                                            value={formData.email}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            placeholder="john@example.com"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('phone_label')}</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            placeholder="(555) 000-0000"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('location_label')}</label>
                                    <AddressAutocomplete
                                        onAddressSelect={handleAddressSelect}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                        placeholder={t('location_placeholder')}
                                        defaultValue={formData.address}
                                        recentAddresses={recentAddresses}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('issue_label')}</label>
                                        <a
                                            href="/diagnose"
                                            className="flex items-center gap-1.5 text-xs font-bold text-golden-yellow hover:text-charcoal-blue transition-colors group"
                                        >
                                            <span className="w-4 h-4 bg-golden-yellow/10 rounded-full flex items-center justify-center group-hover:bg-golden-yellow/20 transition-colors">⚡</span>
                                            Try AI Diagnosis
                                        </a>
                                    </div>
                                    <textarea 
                                        name="issue"
                                        rows={4}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all resize-none"
                                        placeholder={t('issue_placeholder')}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                {/* Scheduling — Standard gets date picker, Emergency gets ASAP */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {urgency === 'Emergency' ? t('response_time') || 'Response Time' : t('preferred_time') || 'Preferred Date & Time'}
                                    </label>
                                    {urgency === 'Emergency' ? (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                                            <span className="text-2xl">🚨</span>
                                            <div>
                                                <div className="font-black text-red-600">ASAP</div>
                                                <div className="text-xs text-red-500/70">{t('emergency_asap_note') || 'Our team will contact you within minutes.'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type="datetime-local"
                                            name="scheduledTime"
                                            value={formData.scheduledTime || ''}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow focus:border-transparent outline-none transition-all"
                                            onChange={handleInputChange}
                                        />
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-charcoal-blue hover:bg-dark-charcoal text-white'}`}
                                >
                                    {urgency === 'Emergency' ? t('submit_emergency') : t('submit_standard')}
                                </button>
                                
                                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {t('secure_note')}
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
                                {t('direct_contact')}
                            </h3>
                            
                            <div className="space-y-8 relative z-10">
                                <a href="tel:832-419-1293" className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-4 -mx-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-golden-yellow shrink-0 group-hover:bg-golden-yellow group-hover:text-charcoal-blue transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('hotline')}</div>
                                        <div className="text-2xl font-bold font-mono tracking-tight group-hover:text-golden-yellow transition-colors">832-419-1293</div>
                                    </div>
                                </a>

                                <a href="mailto:dispatch@mobilgarage.com" className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-4 -mx-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-golden-yellow shrink-0 group-hover:bg-golden-yellow group-hover:text-charcoal-blue transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('email_support')}</div>
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
      <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-charcoal-blue">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-golden-yellow mb-4"></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
            </div>
      }>
        <ContactContent />
      </Suspense>
    </div>
  );
}