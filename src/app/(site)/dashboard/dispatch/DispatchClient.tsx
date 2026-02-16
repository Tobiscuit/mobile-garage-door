'use client';

import React, { useState } from 'react';
import { assignJobToTechnician } from '@/app/actions/dispatch';
import { useRouter } from 'next/navigation';

export function DispatchClient({ jobs, technicians }: { jobs: any[], technicians: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedTechs, setSelectedTechs] = useState<{[key: string]: string}>({});

    const handleAssign = async (jobId: string) => {
        const techId = selectedTechs[jobId];
        if (!techId) {
            alert('Please select a technician first');
            return;
        }

        setLoading(jobId);
        try {
            await assignJobToTechnician(jobId, techId);
            alert('Job Dispatched Successfully! Technician Notified.');
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Error dispatching job');
        } finally {
            setLoading(null);
        }
    };

    const handleTechSelect = (jobId: string, techId: string) => {
        setSelectedTechs(prev => ({
            ...prev,
            [jobId]: techId
        }));
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: 'var(--staff-text)' }}>
                        Dispatch <span className="text-[#f1c40f]">Board</span>
                    </h1>
                    <p className="mt-2 font-mono text-sm" style={{ color: 'var(--staff-muted)' }}>
                        / ASSIGN TECHNICIANS TO PENDING REQUESTS
                    </p>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: 'var(--staff-muted)' }}>Pending Jobs:</span>
                    <span className="text-[#f1c40f] font-mono font-bold text-xl">{jobs.length}</span>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="rounded-3xl p-16 text-center shadow-2xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
                    <div className="w-20 h-20 bg-[#f1c40f]/10 text-[#f1c40f] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#f1c40f]/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: 'var(--staff-text)' }}>All Clear!</h3>
                    <p className="max-w-md mx-auto" style={{ color: 'var(--staff-muted)' }}>No pending service requests waiting for assignment. Good job keeping the queue empty.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map(job => (
                        <div key={job.id} className="group rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-[#f1c40f]/30" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
                            <div className="flex flex-col lg:flex-row">
                                {/* Left: Job Context */}
                                <div className="p-8 flex-1 lg:border-r relative" style={{ borderColor: 'var(--staff-border)' }}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#f1c40f] to-transparent opacity-50"></div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                                            job.urgency === 'emergency' 
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {job.urgency} Priority
                                        </span>
                                        <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: 'var(--staff-muted)', backgroundColor: 'var(--staff-surface-alt)' }}>
                                            ID: {job.ticketId || job.id.substring(0, 8)}
                                        </span>
                                        <span className="text-xs font-mono" style={{ color: 'var(--staff-muted)' }}>
                                            {new Date(job.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-[#f1c40f] transition-colors" style={{ color: 'var(--staff-text)' }}>
                                        {job.customer?.name || 'Unknown Customer'}
                                    </h3>
                                    
                                    <div className="flex items-start gap-2 mb-6" style={{ color: 'var(--staff-muted)' }}>
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--staff-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <p className="leading-relaxed">{job.customer?.address || 'No Address Provided'}</p>
                                    </div>

                                    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)' }}>
                                        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--staff-text)' }}>
                                            "{job.issueDescription}"
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Action Area */}
                                <div className="p-8 lg:w-[350px] flex flex-col justify-center gap-4" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--staff-muted)' }}>
                                            Select Technician
                                        </label>
                                        <div className="relative">
                                            <select 
                                                className="w-full rounded-xl px-4 py-4 appearance-none focus:outline-none focus:border-[#f1c40f] focus:ring-1 focus:ring-[#f1c40f] transition-all cursor-pointer"
                                                style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
                                                value={selectedTechs[job.id] || ''}
                                                onChange={(e) => handleTechSelect(job.id, e.target.value)}
                                            >
                                                <option value="" style={{ color: 'var(--staff-muted)' }}>Choose available tech...</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.id}>
                                                        {tech.name} {tech.pushSubscription ? '🟢' : '⚪'}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4" style={{ color: 'var(--staff-muted)' }}>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleAssign(job.id)}
                                        disabled={loading === job.id || !selectedTechs[job.id]}
                                        className="w-full bg-[#f1c40f] hover:bg-[#f39c12] disabled:opacity-50 disabled:cursor-not-allowed text-[#2c3e50] font-bold text-lg py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg hover:shadow-[#f1c40f]/20 flex items-center justify-center gap-2 group/btn"
                                    >
                                        {loading === job.id ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-[#2c3e50]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Dispatching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>DISPATCH JOB</span>
                                                <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="text-center">
                                         <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: 'var(--staff-muted)' }}>
                                            Status: {technicians.find(t => t.id === selectedTechs[job.id])?.pushSubscription ? 'Online 🟢' : 'Offline ⚪'}
                                         </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
