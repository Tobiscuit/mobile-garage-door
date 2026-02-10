'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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

        // 2. Submit to Backend
        const res = await fetch('/api/service-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                sourceId: token,
                amount: 9900, // $99
            }),
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Booking failed.');
        }

        // Success!
        router.push('/portal?success=booked');

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Script 
        src="https://sandbox.web.squarecdn.com/v1/square.js"
        onLoad={() => setSdkLoaded(true)} 
      />

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span className={step >= 1 ? 'text-charcoal-blue' : ''}>1. Details</span>
            <span className={step >= 2 ? 'text-charcoal-blue' : ''}>2. Schedule</span>
            <span className={step >= 3 ? 'text-charcoal-blue' : ''}>3. Deposit</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-golden-yellow transition-all duration-500 ease-in-out ${
                step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
            }`}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
        
        {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
                <h1 className="text-3xl font-black text-charcoal-blue">How can we help?</h1>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Issue Description</label>
                    <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none h-32 resize-none"
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
                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'standard' ? 'border-charcoal-blue bg-blue-50/50' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <div className="font-bold text-charcoal-blue">Standard</div>
                            <div className="text-xs text-gray-500">Next available slot</div>
                        </button>
                        <button 
                            onClick={() => setFormData({...formData, urgency: 'emergency'})}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'emergency' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 hover:border-red-200'}`}
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
                <button 
                    onClick={handleNext}
                    disabled={!formData.issueDescription}
                    className="w-full bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
                >
                    CONTINUE
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
                 <h1 className="text-3xl font-black text-charcoal-blue">Preferred Time</h1>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Date & Time</label>
                    <input 
                        type="datetime-local"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
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

        {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-charcoal-blue mb-2">Secure Slot</h1>
                    <p className="text-gray-500">A <span className="text-charcoal-blue font-bold">$99 Trip Fee Deposit</span> is required to dispatch a technician. This will be credited to your final repair bill.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">{error}</div>
                )}
                
                {/* Square Card Container */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                     <div id="card-container" className="min-h-[100px]"></div>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleBack} disabled={loading} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">BACK</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !card}
                        className="w-2/3 bg-golden-yellow text-charcoal-blue font-black py-4 rounded-xl disabled:opacity-50 hover:bg-yellow-400 shadow-lg hover:shadow-xl transition-all flex justify-center"
                    >
                        {loading ? 'PROCESSING...' : 'AUTHORIZE $99 DEPOSIT'}
                    </button>
                 </div>
                 <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Payments secured by Square. No card data is stored on our servers.
                 </p>
            </div>
        )}

      </div>
    </div>
  );
}
