import { requireAdmin } from '@/lib/require-role';
import React from 'react';
import Link from '@/shared/ui/Link';
import { inviteStaff } from '../actions';

export default async function CreateUserPage() {
  await requireAdmin();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto mt-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black" style={{ color: 'var(--staff-text)' }}>Invite Staff Member</h1>
        <p className="mt-2" style={{ color: 'var(--staff-muted)' }}>Add an approved staff email and role for passwordless sign-in.</p>
      </div>

      <form action={inviteStaff} className="backdrop-blur-md rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
          <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--staff-muted)' }}>Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--staff-muted)' }}>Role</label>
                <select
                  name="role"
                  defaultValue="technician"
                  className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
                >
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--staff-muted)' }}>First Name (Optional)</label>
                  <input
                    name="firstName"
                    type="text"
                    className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--staff-muted)' }}>Last Name (Optional)</label>
                  <input
                    name="lastName"
                    type="text"
                    className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
                    placeholder="Rivera"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                    type="submit"
                    className="w-full py-4 font-bold rounded-xl hover:scale-105 transition-all"
                    style={{ backgroundColor: 'var(--staff-accent)', color: 'var(--staff-surface-alt)', boxShadow: '0 4px 20px color-mix(in srgb, var(--staff-accent) 30%, transparent)' }}
                >
                    Create Invite
                </button>
                <div className="text-center mt-4">
                     <Link href="/dashboard/users" className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--staff-muted)' }}>
                        Cancel
                     </Link>
                </div>
              </div>
          </div>
      </form>
    </div>
  );
}

