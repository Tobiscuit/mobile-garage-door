import React from 'react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-[#f1c40f] rounded-full shadow-[0_0_10px_#f1c40f]"></span>
          Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/services/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">New Service</div>
                  <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Add a service offering</div>
              </div>
          </Link>

          <Link href="/dashboard/projects/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">New Project</div>
                  <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Showcase recent work</div>
              </div>
          </Link>

          <Link href="/dashboard/posts/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">Write Post</div>
                  <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Publish blog content</div>
              </div>
          </Link>
      </div>
    </div>
  );
}
