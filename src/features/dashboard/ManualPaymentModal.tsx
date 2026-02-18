'use client';

import React, { useState } from 'react';
import { createManualPayment } from '@/app/(site)/dashboard/actions';
import { useRouter } from 'next/navigation';

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ManualPaymentModal({ isOpen, onClose }: ManualPaymentModalProps) {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [sourceType, setSourceType] = useState<'CASH' | 'EXTERNAL'>('CASH');
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            const result = await createManualPayment(numAmount, sourceType, note);
            
            if (result.success) {
                // Refresh dashboard data
                router.refresh();
                onClose();
                // Reset form
                setAmount('');
                setNote('');
                setSourceType('CASH');
            } else {
                alert('Failed to record payment');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-charcoal-blue p-6 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Record Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-charcoal-blue text-lg focus:ring-2 focus:ring-golden-yellow outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Source */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSourceType('CASH')}
                                className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${sourceType === 'CASH' ? 'border-golden-yellow bg-golden-yellow/10 text-charcoal-blue' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                onClick={() => setSourceType('EXTERNAL')}
                                className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${sourceType === 'EXTERNAL' ? 'border-golden-yellow bg-golden-yellow/10 text-charcoal-blue' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                External / Check
                            </button>
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note (Optional)</label>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none transition-all resize-none"
                            rows={3}
                            placeholder="e.g. Job #123, Check #4501"
                        />
                    </div>

                    {/* Submit */}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-golden-yellow text-charcoal-blue font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Recording...' : 'Record Payment'}
                    </button>

                </form>
            </div>
        </div>
    );
}