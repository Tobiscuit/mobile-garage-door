'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface PwaInstallModalProps {
  show: boolean;
  onClose: () => void;
  onInstall: () => void;
  platform: 'ios' | 'android' | 'other';
}

export function PwaInstallModal({ show, onClose, onInstall, platform }: PwaInstallModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-charcoal-blue/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f1c40f]/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />

        <div className="relative">
          {/* Guardian Icon */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-[#f1c40f] blur-2xl opacity-20 rounded-full animate-pulse" />
            <div className="relative bg-charcoal-blue border border-[#f1c40f]/30 rounded-2xl p-4 shadow-inner">
              <svg className="w-full h-full text-[#f1c40f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {platform === 'ios' ? 'Upgrade to Native Portal' : 'Activate Native Field Dispatch'}
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            {platform === 'ios' 
              ? 'Install the Mobile Garage Door app for 30-day persistence and faster field access.'
              : 'Unlock the full native experience with instant notifications and persistent sessions.'}
          </p>

          {platform === 'ios' ? (
            <div className="space-y-6 text-left bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#f1c40f] font-bold">1</div>
                <p className="text-sm text-gray-200">Tap the <span className="text-blue-400 font-bold">Share</span> menu below.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#f1c40f] font-bold">2</div>
                <p className="text-sm text-gray-200">Scroll down and select <span className="text-blue-400 font-bold">"Add to Home Screen"</span>.</p>
              </div>
              
              {/* Pointing animation */}
              <div className="flex justify-center pt-4">
                 <div className="animate-bounce text-[#f1c40f]">
                    <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                 </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onInstall}
              className="w-full bg-[#f1c40f] hover:bg-[#e6b800] text-black font-black py-4 rounded-xl shadow-lg shadow-[#f1c40f]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              INSTALL NOW
            </button>
          )}

          <button
            onClick={onClose}
            className="mt-6 text-gray-400 text-sm font-medium hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
