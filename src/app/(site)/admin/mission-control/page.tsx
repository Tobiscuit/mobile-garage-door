'use client';

import React, { useEffect, useState } from 'react';
import { getUnassignedJobs, getAllTechnicians } from '@/app/actions/admin';
import { assignJobToTechnician } from '@/app/actions/dispatch';

export default function MissionControl() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [techs, setTechs] = useState<any[]>([]);
    const [selectedTech, setSelectedTech] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [j, t] = await Promise.all([getUnassignedJobs(), getAllTechnicians()]);
        setJobs(j);
        setTechs(t);
    };

    const handleAssign = async (jobId: string) => {
        if (!selectedTech) return alert('Select a technician first!');
        
        setLoading(true);
        const result = await assignJobToTechnician(jobId, selectedTech);
        if (result.success) {
            alert('Job Dispatched & Tech Notified!');
            loadData(); // Refresh
        } else {
            alert('Failed to assign job');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest text-white">Mission Control</h1>
                    <p className="text-gray-400 text-sm mt-1">Dispatch Command Center</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-golden-yellow">{jobs.length}</div>
                        <div className="text-xs uppercase text-gray-500 font-bold">Pending</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{techs.filter(t => t.isOnline).length}</div>
                        <div className="text-xs uppercase text-gray-500 font-bold">Online Techs</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Incoming Tickets</h2>
                    
                    {jobs.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl text-gray-600">
                            No pending jobs. Good work.
                        </div>
                    )}

                    {jobs.map(job => (
                        <div key={job.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-golden-yellow/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide 
                                        ${job.urgency === 'emergency' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {job.urgency}
                                    </span>
                                    <span className="font-mono text-gray-500 text-sm">#{job.ticketId}</span>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">
                                    {new Date(job.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Customer</label>
                                    <div className="font-bold text-lg">{job.customerName}</div>
                                    <div className="text-gray-400 text-sm">{job.customerAddress}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Issue</label>
                                    <p className="text-gray-300 text-sm italic">"{job.issue}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                                <select 
                                    className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-golden-yellow transition-colors"
                                    onChange={(e) => setSelectedTech(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select Technician...</option>
                                    {techs.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} {tech.isOnline ? '(Online)' : '(Offline)'}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => handleAssign(job.id)}
                                    disabled={loading}
                                    className="bg-golden-yellow text-charcoal-blue px-8 py-3 rounded-lg font-black uppercase tracking-wide hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Dispatching...' : 'Dispatch'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tech Status Panel */}
                <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Field Units</h2>
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <div className="space-y-4">
                            {techs.map(tech => (
                                <div key={tech.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${tech.isOnline ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`}></div>
                                        <div>
                                            <div className="font-bold text-sm">{tech.name}</div>
                                            <div className="text-xs text-gray-500">{tech.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600 uppercase">
                                        {tech.isOnline ? 'Active' : 'Idle'}
                                    </div>
                                </div>
                            ))}
                            {techs.length === 0 && (
                                <div className="text-center text-gray-500 text-sm py-4">No technicians found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}