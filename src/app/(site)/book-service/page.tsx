'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/app/actions/booking';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Contact, 1: Issue, 2: Schedule, 3: Payment
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestAddress: '',
    issueDescription: '',
    urgency: 'standard',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Square SDK State
  const [card, setCard] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || 'sandbox-sq0idb-YOUR_APP_ID_HERE'; 
  const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID_HERE';

  // Initialize Square Card
  useEffect(() => {
    if (sdkLoaded && step === 3 && !card) {
      async function initializeCard() {
        if(!(window as any).Square) return;
        
        try {
            const payments = await (window as any).Square.payments(APP_ID, LOCATION_ID);
            const cardInstance = await payments.card();
            await cardInstance.attach('#card-container');
            setCard(cardInstance);
        } catch (e) {
            console.error('Square Init Error:', e);
            setError('Failed to load payment form. Please refresh.');
        }
      }
      initializeCard();
    }
  }, [sdkLoaded, step, card, APP_ID, LOCATION_ID]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
        // 1. Tokenize Card
        const result = await card.tokenize();
        if (result.status !== 'OK') {
            throw new Error(`Payment Failed: ${result.errors[0].message}`);
        }
        
        const token = result.token; // sourceId

        // 2. Create FormData for Server Action
        const submissionData = new FormData();
        submissionData.append('guestName', formData.guestName);
        submissionData.append('guestEmail', formData.guestEmail);
        submissionData.append('guestPhone', formData.guestPhone);
        submissionData.append('guestAddress', formData.guestAddress);
        submissionData.append('guestPassword', formData.guestPassword);
        submissionData.append('issueDescription', formData.issueDescription);
        submissionData.append('urgency', formData.urgency);
        submissionData.append('scheduledTime', formData.scheduledTime);
        submissionData.append('sourceId', token);

        // 3. Call Server Action
        const response = await createBooking(null, submissionData);
        
        if (response?.error) {
            throw new Error(response.error);
        }

        // Redirect is handled by the server action on success

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Booking failed.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white py-12 px-4 font-work-sans">
      <Script 
        src="https://sandbox.web.squarecdn.com/v1/square.js"
        onLoad={() => setSdkLoaded(true)} 
      />

      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                <span className={step >= 0 ? 'text-charcoal-blue' : ''}>Contact</span>
                <span className={step >= 1 ? 'text-charcoal-blue' : ''}>Issue</span>
                <span className={step >= 2 ? 'text-charcoal-blue' : ''}>Time</span>
                <span className={step >= 3 ? 'text-charcoal-blue' : ''}>Secure</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-golden-yellow transition-all duration-500 ease-in-out`} style={{ width: `${(step + 1) * 25}%` }}></div>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>

            {/* STEP 0: CONTACT */}
            {step === 0 && (
                <div className="space-y-6 animate-fadeIn relative z-10">
                    <h1 className="text-4xl font-black text-charcoal-blue tracking-tight">Rapid Dispatch</h1>
                    <p className="text-gray-500">Enter your details to locate the nearest technician.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                            <input 
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                                placeholder="John Doe"
                                value={formData.guestName}
                                onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                            <input 
                                type="tel"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                                placeholder="(555) 123-4567"
                                value={formData.guestPhone}
                                onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input 
                                type="email"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                                placeholder="john@example.com"
                                value={formData.guestEmail}
                                onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                            />
                        </div>
                         <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Service Address</label>
                            <textarea 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none h-24 resize-none"
                                placeholder="1234 Main St, City, State, ZIP"
                                value={formData.guestAddress}
                                onChange={(e) => setFormData({...formData, guestAddress: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2 pt-4 border-t border-gray-100">
                             <div className="flex items-center gap-3 mb-4">
                                <input 
                                    type="checkbox" 
                                    id="createAccount"
                                    className="w-5 h-5 text-golden-yellow rounded focus:ring-golden-yellow border-gray-300"
                                    checked={!!formData.guestPassword}
                                    onChange={(e) => setFormData({...formData, guestPassword: e.target.checked ? 'temp123' : ''})} 
                                />
                                <label htmlFor="createAccount" className="font-bold text-charcoal-blue cursor-pointer select-none">
                                    Create an account to track my repair history
                                </label>
                             </div>
                             
                             {formData.guestPassword && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Create Password</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white border border-gray-300 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                                        placeholder="Choose a secure password"
                                        value={formData.guestPassword === 'temp123' ? '' : formData.guestPassword}
                                        onChange={(e) => setFormData({...formData, guestPassword: e.target.value})}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">We'll use your email as your username.</p>
                                </div>
                             )}
                        </div>
                    </div>

                    <button 
                        onClick={handleNext}
                        disabled={!formData.guestName || !formData.guestPhone || !formData.guestEmail || !formData.guestAddress}
                        className="w-full bg-charcoal-blue text-white font-black py-5 rounded-xl text-lg disabled:opacity-50 hover:bg-dark-charcoal transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        LOCATE TECHNICIAN
                    </button>
                </div>
            )}

            {/* STEP 1: ISSUE */}
            {step === 1 && (
                <div className="space-y-6 animate-fadeIn relative z-10">
                    <h1 className="text-3xl font-black text-charcoal-blue">What's the status?</h1>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Issue Description</label>
                        <textarea 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none h-32 resize-none"
                            placeholder="e.g. Garage door stuck halfway, making a grinding noise..."
                            value={formData.issueDescription}
                            onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Urgency Level</label>
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setFormData({...formData, urgency: 'standard'})}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'standard' ? 'border-charcoal-blue bg-blue-50/50 ring-2 ring-charcoal-blue' : 'border-gray-100 hover:border-gray-300'}`}
                            >
                                <div className="font-bold text-charcoal-blue">Standard</div>
                                <div className="text-xs text-gray-500">Next available slot</div>
                            </button>
                            <button 
                                onClick={() => setFormData({...formData, urgency: 'emergency'})}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'emergency' ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500' : 'border-gray-100 hover:border-red-200'}`}
                            >
                                <div className="font-bold text-red-600 flex items-center gap-2">
                                    Emergency
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">24/7 Priority Dispatch</div>
                            </button>
                         </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleBack} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">BACK</button>
                        <button 
                            onClick={handleNext}
                            disabled={!formData.issueDescription}
                            className="w-2/3 bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: SCHEDULE */}
            {step === 2 && (
                <div className="space-y-6 animate-fadeIn relative z-10">
                     <h1 className="text-3xl font-black text-charcoal-blue">Preferred Time</h1>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Date & Time</label>
                        <input 
                            type="datetime-local"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                            value={formData.scheduledTime}
                            onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                        />
                        <p className="text-xs text-gray-400 mt-2">Note: Actual arrival window will be confirmed via SMS.</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={handleBack} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">BACK</button>
                        <button 
                            onClick={handleNext}
                            disabled={!formData.scheduledTime}
                            className="w-2/3 bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
                        >
                            CONTINUE
                        </button>
                     </div>
                </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
                <div className="space-y-6 animate-fadeIn relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h1 className="text-3xl font-black text-charcoal-blue mb-2">Technician Available</h1>
                        <p className="text-gray-500">Secure your slot now. The <span className="text-charcoal-blue font-bold">$99 Trip Fee</span> is credited towards your repair.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">{error}</div>
                    )}
                    
                    {/* Square Card Container */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                         <div id="card-container" className="min-h-[100px]"></div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleBack} disabled={loading} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">BACK</button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !card}
                            className="w-2/3 bg-golden-yellow text-charcoal-blue font-black py-4 rounded-xl disabled:opacity-50 hover:bg-yellow-400 shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    AUTHORIZE $99
                                </>
                            )}
                        </button>
                     </div>
                     <p className="text-center text-[10px] text-gray-400 mt-4">
                        100% Secure Payment via Square. We do not store your card details.
                     </p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}
