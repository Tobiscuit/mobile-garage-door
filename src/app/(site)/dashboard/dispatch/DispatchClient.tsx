'use client';

import React, { useState } from 'react';
import { dispatchJob } from '@/app/actions/dispatch';
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
            await dispatchJob(jobId, techId);
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
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-8">
                Dispatch <span className="text-[#f1c40f]">Board</span>
            </h1>

            {jobs.length === 0 ? (
                <div className="bg-[#34495e]/50 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-[#f1c40f]/20 text-[#f1c40f] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
                    <p className="text-gray-400">No pending jobs waiting for assignment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-[#34495e] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-lg">
                            {/* Job Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${job.urgency === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {job.urgency}
                                    </span>
                                    <span className="text-gray-400 text-sm font-mono">#{job.ticketId || job.id.substring(0, 8)}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{job.customer?.name || 'Unknown Customer'}</h3>
                                <p className="text-gray-300 mb-2">{job.customer?.address || 'No Address'}</p>
                                <div className="bg-[#2c3e50] rounded p-3 text-sm text-gray-400 italic">
                                    "{job.issueDescription}"
                                </div>
                            </div>

                            {/* Assignment Control */}
                            <div className="w-full md:w-auto flex flex-col gap-3 min-w-[250px]">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assign Technician</label>
                                <div className="flex gap-2">
                                    <select 
                                        className="flex-1 bg-[#2c3e50] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f]"
                                        value={selectedTechs[job.id] || ''}
                                        onChange={(e) => handleTechSelect(job.id, e.target.value)}
                                    >
                                        <option value="">Select Tech...</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>
                                                {tech.name} {tech.pushSubscription ? '🟢' : '⚪'}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleAssign(job.id)}
                                        disabled={loading === job.id || !selectedTechs[job.id]}
                                        className="bg-[#f1c40f] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#2c3e50] font-bold px-4 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        {loading === job.id ? (
                                            <svg className="animate-spin h-5 w-5 text-[#2c3e50]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="text-[10px] text-gray-500 text-center">
                                    🟢 = Notifications Enabled
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
