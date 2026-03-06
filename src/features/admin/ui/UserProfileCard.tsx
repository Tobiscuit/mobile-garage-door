'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateUser } from '@/app/(site)/(private)/[locale]/dashboard/users/actions';

export function UserProfileCard({ user }: { user: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Local state for edits
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    role: user.role || 'customer',
    customerType: user.customerType || 'residential',
    companyName: user.companyName || '',
  });

  // Track if changes made to show Save button
  const hasChanges =
    formData.name !== (user.name || '') ||
    formData.phone !== (user.phone || '') ||
    formData.address !== (user.address || '') ||
    formData.role !== (user.role || 'customer') ||
    formData.customerType !== (user.customerType || 'residential') ||
    formData.companyName !== (user.companyName || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser(user.id, formData);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to save user');
    }
    setIsSaving(false);
  };

  // Role Badge Color Mapping
  const roleColors: Record<string, string> = {
    admin: 'bg-[#e74c3c]/20 text-[#e74c3c] border border-[#e74c3c]/50 shadow-[0_0_15px_rgba(231,76,60,0.2)]', // Red
    technician: 'bg-[#2ecc71]/20 text-[#2ecc71] border border-[#2ecc71]/50 shadow-[0_0_15px_rgba(46,204,113,0.2)]', // Green
    dispatcher: 'bg-[#9b59b6]/20 text-[#9b59b6] border border-[#9b59b6]/50 shadow-[0_0_15px_rgba(155,89,182,0.2)]', // Purple
    customer: 'bg-[#3498db]/20 text-[#3498db] border border-[#3498db]/50', // Blue
  };

  const activeRoleColor = roleColors[formData.role] || roleColors.customer;

  return (
    <div className="space-y-6 relative">
      {/* Save Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-charcoal-blue border border-golden-yellow/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-6 py-4 flex items-center gap-6">
            <span className="text-white font-medium text-sm">You have unsaved changes.</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-golden-yellow hover:bg-yellow-400 text-charcoal-blue px-6 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(241,196,15,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-8 shadow-xl flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-golden-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-[var(--staff-accent)] to-[#d4ac0d] flex items-center justify-center text-[var(--staff-surface-alt)] font-black text-4xl shadow-lg border-4 border-[var(--staff-surface)] z-10">
          {(formData.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
        </div>

        <div className="flex-1 z-10">
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h2 className="text-3xl font-black text-[var(--staff-text)] tracking-tight">{formData.name || 'Unknown User'}</h2>
            <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${activeRoleColor} transition-colors duration-300`}>
              {formData.role}
            </div>
          </div>
          <p className="text-[var(--staff-muted)] font-medium text-lg">{user.email}</p>
        </div>

        <div className="flex flex-col gap-2 text-right z-10 bg-[var(--staff-surface-alt)] p-4 rounded-xl border border-[var(--staff-border)]">
          <div className="text-sm">
            <span className="text-[var(--staff-muted)] uppercase tracking-wider text-xs font-bold block mb-1">Joined</span>
            <span className="text-[var(--staff-text)] font-medium">{user.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.createdAt)) : 'Unknown'}</span>
          </div>
          <div className="text-sm mt-2 pt-2 border-t border-[var(--staff-border)]">
            <span className="text-[var(--staff-muted)] uppercase tracking-wider text-xs font-bold block mb-1">Last Login</span>
            <span className="text-[var(--staff-text)] font-medium">{user.lastLogin ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(user.lastLogin)) : 'Never'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--staff-accent)]/10 rounded-lg text-[var(--staff-accent)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--staff-text)]">Profile Data</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] focus:ring-1 focus:ring-[var(--staff-accent)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Service Address</label>
              <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] transition-all resize-none"></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* System Classification */}
          <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--staff-accent)]/10 rounded-lg text-[var(--staff-accent)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--staff-text)]">Access & Classification</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">System Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] transition-all appearance-none cursor-pointer">
                  <option value="customer">Customer (Portal Only)</option>
                  <option value="technician">Technician (Field App)</option>
                  <option value="dispatcher">Dispatcher (Operations)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Customer Type</label>
                <select name="customerType" value={formData.customerType} onChange={handleChange} className="w-full bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] transition-all appearance-none cursor-pointer">
                  <option value="residential">Residential (Homeowner)</option>
                  <option value="builder">Commercial / Builder</option>
                </select>
              </div>

              {formData.customerType === 'builder' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-xs font-bold text-[var(--staff-accent)] uppercase tracking-wider mb-2">Company / Builder Name</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-[var(--staff-accent)]/5 border border-[var(--staff-accent)]/30 text-[var(--staff-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--staff-accent)] transition-all" placeholder="e.g. Texas Prestige Custom Homes" />
                </div>
              )}
            </div>
          </div>

          {/* Business Insights Placeholder */}
          <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#3498db]/10 rounded-lg text-[#3498db]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--staff-text)]">Business Insights</h3>
            </div>
            {user.squareCustomerId ? (
              <div className="text-sm text-[var(--staff-muted)] flex justify-between items-center bg-[var(--staff-surface-alt)] p-4 rounded-xl">
                <span>Square ID: <code className="text-white ml-2 bg-black/50 px-2 py-1 rounded">{user.squareCustomerId}</code></span>
                <button className="text-[var(--staff-accent)] hover:underline font-bold text-xs uppercase tracking-wider">View Billing</button>
              </div>
            ) : (
              <div className="text-sm text-[var(--staff-muted)] italic text-center p-4 bg-[var(--staff-surface-alt)] rounded-xl border border-dashed border-[var(--staff-border)]">
                No Square billing profile linked.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
