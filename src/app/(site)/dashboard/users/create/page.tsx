import React from 'react';
import Link from 'next/link';
import { inviteStaff } from '../actions';

export default function CreateUserPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto mt-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-white">Invite Staff Member</h1>
        <p className="text-[#bdc3c7] mt-2">Add an approved staff email and role for passwordless sign-in.</p>
      </div>

      <form action={inviteStaff} className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Role</label>
                <select
                  name="role"
                  defaultValue="technician"
                  className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                >
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">First Name (Optional)</label>
                  <input
                    name="firstName"
                    type="text"
                    className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Last Name (Optional)</label>
                  <input
                    name="lastName"
                    type="text"
                    className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                    placeholder="Rivera"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                    type="submit"
                    className="w-full py-4 bg-[#f1c40f] text-[#2c3e50] font-bold rounded-xl hover:bg-[#f39c12] hover:scale-105 transition-all shadow-[0_4px_20px_rgba(241,196,15,0.3)]"
                >
                    Create Invite
                </button>
                <div className="text-center mt-4">
                     <Link href="/dashboard/users" className="text-sm text-[#7f8c8d] hover:text-white transition-colors">
                        Cancel
                     </Link>
                </div>
              </div>
          </div>
      </form>
    </div>
  );
}
