'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendReply, getThreadDetails } from '@/app/(site)/dashboard/emails/actions';
import { RichTextEditor } from './RichTextEditor';
import { useRouter } from 'next/navigation';

interface Message {
  id: string | number;
  from: string;
  to: string;
  bodyRaw: string;
  createdAt: string;
  direction: 'inbound' | 'outbound';
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function ChatInterface({ threadId, initialMessages }: { threadId: string, initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false); // State for Mobile Drawer
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. AUTO-SAVE DRAFTS
  const DRAFT_KEY = `draft_${threadId}`;

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
        setReplyText(saved);
    }
  }, [DRAFT_KEY]);

  useEffect(() => {
    if (replyText && replyText !== '<p></p>') {
        localStorage.setItem(DRAFT_KEY, replyText);
        setLastSaved(new Date());
    } else if (replyText === '' || replyText === '<p></p>') {
        localStorage.removeItem(DRAFT_KEY);
    }
  }, [replyText, DRAFT_KEY]);

  // 2. SMART POLLING
  useInterval(async () => {
    try {
        const newData = await getThreadDetails(threadId);
        if (newData && newData.messages.length > messages.length) {
            const currentIds = new Set(messages.map(m => String(m.id)));
            // Ensure we handle both number/string IDs for comparison
            const newMsgs = newData.messages.filter((m: any) => !currentIds.has(String(m.id)) && !String(m.id).startsWith('temp-'));
            
            if (newMsgs.length > 0) {
                 setMessages(prev => {
                     const existing = prev.filter(m => !String(m.id).startsWith('temp-'));
                     // @ts-ignore - Payload types vs Local types mismatch
                     return [...existing, ...newMsgs].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                 });
            }
        }
    } catch (err) {
        console.error('Polling error:', err);
    }
  }, 10000);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!replyText.trim() || replyText === '<p></p>') return;

    setIsSending(true);
    const content = replyText; 
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      from: 'dispatch@mobilegaragedoor.com', 
      to: messages.find(m => m.direction === 'inbound')?.from || 'unknown',
      bodyRaw: content,
      createdAt: new Date().toISOString(),
      direction: 'outbound',
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setReplyText(''); 
    localStorage.removeItem(DRAFT_KEY);
    
    try {
        const result = await sendReply(threadId, content);
        if (result.success) {
            console.log('Reply sent successfully');
        } else {
            alert('Failed to send message: ' + result.error);
        }
    } catch (err) {
        console.error('Unexpected error sending reply:', err);
    } finally {
        setIsSending(false);
    }
  };

  return (
    <>
      {/* MOBILE HEADER - Visible only on small screens */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#ffffff08] bg-white dark:bg-[#2c3e50]/50 sticky top-0 z-10 backdrop-blur-sm">
          <span className="font-bold text-gray-700 dark:text-gray-200">Chat</span>
          <button 
            onClick={() => setShowMobileDrawer(true)}
            className="text-sm font-medium text-[var(--golden-yellow)] flex items-center gap-1"
          >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Details
          </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50 dark:bg-transparent transition-colors duration-300" ref={scrollRef}>
          {messages.map((msg) => {
              const isOutbound = msg.direction === 'outbound';
              return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                      <div className={`
                        max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group transition-all
                        ${isOutbound 
                            ? 'bg-blue-500 dark:bg-[#3498db] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-[#ffffff08] text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-[#ffffff05]'
                        }
                      `}>
                          {!isOutbound && (
                              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-[#f1c40f] mb-1 opacity-70">
                                  {msg.from}
                              </div>
                          )}

                          <div 
                            className="whitespace-pre-wrap leading-relaxed text-sm prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: msg.bodyRaw }}
                          />
                          
                          <div className={`
                             text-[10px] mt-2 opacity-50 flex items-center gap-1
                             ${isOutbound ? 'justify-end text-blue-100' : 'text-gray-400 dark:text-gray-500'}
                          `}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isOutbound && <span>• Sent</span>}
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      {/* COMPOSER AREA */}
      <div className="p-4 bg-white dark:bg-[#ffffff02] border-t border-gray-200 dark:border-[#ffffff08] transition-colors duration-300">
          <div className="relative">
             <RichTextEditor 
                content={replyText}
                onChange={setReplyText}
                onSend={handleSend}
                disabled={isSending}
             />
             
             {/* TOOLBAR */}
             <div className="flex items-center justify-between mt-3 px-1">
                 <div className="text-[10px] text-gray-500 dark:text-[#7f8c8d] flex items-center gap-3">
                     <span className="hidden md:inline"><strong>Ctrl + Enter</strong> to send</span>
                     {lastSaved && (
                         <span className="text-green-600 dark:text-green-500 fade-in transition-opacity">
                             Draft saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                     )}
                     <span className="text-yellow-600 dark:text-[#f1c40f] flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Draft
                     </span>
                 </div>

                 <div className="flex items-center gap-2">
                    <button 
                        className="p-2 text-gray-500 dark:text-[#7f8c8d] hover:text-[#f1c40f] hover:bg-gray-100 dark:hover:bg-[#ffffff05] rounded-lg transition-all tooltip-trigger"
                        title="Insert Booking Link"
                        onClick={() => setReplyText(prev => prev + '<p><a href="https://mobilegaragedoor.com/book" class="text-blue-500 dark:text-blue-400 underline">Book an Appointment</a></p>')}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    
                    <button 
                    onClick={handleSend}
                    disabled={isSending || !replyText.trim() || replyText === '<p></p>'}
                    className="
                        bg-[#f1c40f] text-[#2c3e50] px-6 py-2 rounded-lg font-bold text-sm
                        hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2 shadow-lg shadow-[#f1c40f]/20
                    "
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-[#2c3e50]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending</span>
                            </>
                        ) : (
                            <>
                                <span>Send</span>
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                 </div>
             </div>
          </div>
      </div>

      {/* MOBILE DRAWER PORTAL - Simple Implementation */}
      {showMobileDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMobileDrawer(false)}
              ></div>
              
              {/* Drawer Content */}
              <div className="relative w-[300px] h-full bg-white dark:bg-[#2c3e50] border-l border-gray-200 dark:border-[#ffffff10] shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">Customer Details</h3>
                      <button 
                        onClick={() => setShowMobileDrawer(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#ffffff10] rounded-full text-gray-500 dark:text-gray-400"
                      >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  {/* Reuse the logic from the Sidebar Page Wrapper if possible, or render placeholder for now since we are inside ChatInterface and passing data out is complex without Context */}
                  <div className="space-y-6">
                       {/* This content duplicates the sidebar logic from page.tsx. 
                           Ideally, we would pass this in as a prop or slot. 
                           For now, duplicating the static placeholder behavior to match current state.
                       */}
                       <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg">
                                {messages.find(m => m.direction === 'inbound')?.from?.[0]?.toUpperCase() || '?'}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {messages.find(m => m.direction === 'inbound')?.from || 'Unknown User'}
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Customer</span>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#ffffff05] border border-gray-200 dark:border-[#ffffff05]">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Lifetime Value</h3>
                            <div className="text-2xl font-black text-[#f1c40f]">$0.00</div>
                            <div className="text-xs text-gray-400 mt-1">0 completed jobs</div>
                        </div>

                        <div>
                            <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 mb-3">
                                Create New Job
                            </button>
                            <button className="w-full py-3 rounded-xl bg-gray-100 dark:bg-[#ffffff05] hover:bg-gray-200 dark:hover:bg-[#ffffff10] text-gray-800 dark:text-white font-bold text-sm transition-all border border-gray-200 dark:border-[#ffffff05]">
                                View Invoices
                            </button>
                        </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}
