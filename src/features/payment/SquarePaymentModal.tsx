'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { processPayment } from '@/app/actions/processPayment';

interface SquarePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentResult: any) => void;
    amount: number; // e.g. 99.00
    customerDetails: {
        name: string;
        phone: string;
        email: string;
        address: string;
        issue: string;
        urgency: 'Standard' | 'Emergency';
    }
}

declare global {
    interface Window {
        Square: any;
    }
}

export const SquarePaymentModal: React.FC<SquarePaymentModalProps> = ({ isOpen, onClose, onSuccess, amount, customerDetails }) => {
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Refs to store Square instances
    const paymentsRef = useRef<any>(null);
    const cardRef = useRef<any>(null);

    // Clean up on unmount or close
    useEffect(() => {
        if (!isOpen && cardRef.current) {
            cardRef.current.destroy().then(() => {
                cardRef.current = null;
                setStatus('idle');
            });
        }
    }, [isOpen]);

    // Initialize Payment Form when SDK is loaded and Modal is open
    useEffect(() => {
        if (isSdkLoaded && isOpen && !cardRef.current) {
            initializePaymentForm();
        }
    }, [isSdkLoaded, isOpen]);

    const initializePaymentForm = async () => {
        setStatus('loading');
        try {
            if (!window.Square) {
                throw new Error('Square SDK not loaded');
            }

            const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
            const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

            if (!appId || !locationId) {
                throw new Error('Missing Square Configuration');
            }

            if (!paymentsRef.current) {
                paymentsRef.current = window.Square.payments(appId, locationId);
            }

            const card = await paymentsRef.current.card();
            await card.attach('#card-container');
            cardRef.current = card;
            setStatus('idle');
        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || 'Failed to initialize payment form');
            setStatus('error');
        }
    };

    const handlePayment = async () => {
        if (!cardRef.current) return;
        
        setStatus('processing');
        setErrorMessage('');

        try {
            // 1. Tokenize the card
            const result = await cardRef.current.tokenize();
            
            if (result.status === 'OK') {
                // 2. Process payment on server
                const serverResult = await processPayment({
                    sourceId: result.token,
                    amount: amount * 100, // Convert to cents
                    customerDetails
                });
                
                if (serverResult.success) {
                    setStatus('success');
                    setTimeout(() => {
                        onSuccess(serverResult.payment);
                    }, 1500); // Short delay to show success state
                } else {
                    throw new Error(serverResult.error);
                }
            } else {
                throw new Error(result.errors[0].message);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || 'Payment failed');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-blue/90 backdrop-blur-sm">
            {/* Load Square SDK */}
            <Script 
                src="https://sandbox.web.squarecdn.com/v1/square.js"
                onLoad={() => setIsSdkLoaded(true)}
            />

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-gray-200">
                
                {/* Header */}
                <div className="bg-charcoal-blue p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-golden-yellow rounded-full blur-[60px] opacity-10 pointer-events-none"></div>
                    <h3 className="text-xl font-black uppercase tracking-wide flex items-center gap-2 relative z-10">
                        <span className="w-2 h-2 bg-golden-yellow rounded-full animate-pulse"></span>
                        Secure Payment
                    </h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Dispatch Fee Authorization
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* Amount Display */}
                    <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                        <span className="text-gray-500 font-medium">Total Due</span>
                        <span className="text-3xl font-black text-charcoal-blue">${amount.toFixed(2)}</span>
                    </div>

                    {/* Error Display */}
                    {status === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <div className="text-red-500 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <p className="text-sm text-red-600 font-bold">{errorMessage}</p>
                        </div>
                    )}

                    {/* Success Display */}
                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h4 className="text-xl font-black text-charcoal-blue mb-2">Payment Verified</h4>
                            <p className="text-gray-500 text-sm">Dispatching technician now...</p>
                        </div>
                    )}

                    {/* Card Container */}
                    <div className={status === 'success' ? 'hidden' : 'block'}>
                        <div id="card-container" className="min-h-[100px] mb-6">
                            {/* Square SDK injects iframe here */}
                            {!isSdkLoaded && (
                                <div className="flex items-center justify-center h-24 text-gray-300 animate-pulse">
                                    Loading Secure Vault...
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <button 
                            onClick={handlePayment}
                            disabled={status === 'loading' || status === 'processing' || !isSdkLoaded}
                            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg 
                                ${status === 'processing' 
                                    ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                    : 'bg-golden-yellow hover:bg-yellow-400 text-charcoal-blue hover:-translate-y-1 shadow-yellow-500/20'
                                }`}
                        >
                            {status === 'processing' ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            disabled={status === 'processing'}
                            className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
                        Secured by Square
                    </p>
                </div>
            </div>
        </div>
    );
};
