'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DiagnosePage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [aiMessage, setAiMessage] = useState("I'm listening. Please press the wall button.");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      stopMedia();
      wsRef.current?.close();
    };
  }, []);

  const stopMedia = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
       tracks.forEach(track => track.stop());
    }
    audioContextRef.current?.close();
    processorRef.current?.disconnect();
  };

  // Debug Logger state
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
      setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
      console.log(msg);
  };

  const startCamera = async () => {
    addLog("Starting Camera...");
    try {
      // 1. Create AudioContext immediately within user gesture (Click)
      addLog("Creating AudioContext...");
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      addLog(`AudioContext State: ${audioCtx.state}`);
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
        addLog("AudioContext Resumed");
      }

      addLog("Requesting getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true
        }
      });
      addLog("Stream Acquired");
      setHasPermission(true);
      // We don't assign videoRef.current.srcObject here anymore.
      // We pass the stream to the state or a ref that the useEffect watches.
      // However, to keep it simple with the current structure, we will use a dedicated helper function 
      // that is called HERE, but uses the proper event listeners.
      
      if (videoRef.current) {
        addLog("Assigning Stream to Video Element...");
        videoRef.current.srcObject = stream;
        
        // Context7/MDN Standard: Call play() immediately to trigger loading
        videoRef.current.play().then(() => {
            addLog("Video Playing (Promise Resolved)");
        }).catch(e => {
             addLog(`Play Error: ${e.message}`);
        });

        // Use metadata event just for logging dimensions
        videoRef.current.onloadedmetadata = () => {
            addLog(`Metadata Loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
        };

        videoRef.current.onerror = (e) => {
            if (typeof e === 'string') {
                addLog(`Video Error: ${e}`);
                return;
            }
            const target = e.target as HTMLVideoElement;
            const msg = target?.error?.message || "Unknown Video Error";
            addLog(`Video Element Error: ${msg}`);
        };
      }
      
      connectWebSocket(stream);

    } catch (err: any) {
      addLog(`Camera Error: ${err.message}`);
      setHasPermission(false);
      alert("We need camera access. Please check permissions.");
    }
  };

  const connectWebSocket = (stream: MediaStream) => {
      setStatus('connecting');
      addLog("Connecting WebSocket...");
      
      const wsUrl = window.location.hostname === 'localhost' 
          ? 'ws://localhost:3001' 
          : 'wss://mobile-garage-door-realtime-proxy.tobiasramzy.workers.dev';
          
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
          addLog("WS Connected");
          setStatus('connected');
          startAudioStreaming(stream);
          startVideoStreaming();
      };

      ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle Audio Output
            if (data.serverContent?.modelTurn?.parts) {
                for (const part of data.serverContent.modelTurn.parts) {
                    if (part.text) {
                        setAiMessage(part.text);
                    }
                    if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                        playPcmAudio(part.inlineData.data);
                    }
                }
            }
          } catch (e) {
              // Ignore parse errors for non-JSON messages if any, or log them
          }
      };

      ws.onerror = (err) => {
          addLog("WS Error Event");
          console.error(err);
          setStatus('error');
      };

      ws.onclose = (e) => {
          addLog(`WS Closed: ${e.code} ${e.reason}`);
          setStatus('idle');
      };
  };

  const startAudioStreaming = async (stream: MediaStream) => {
      addLog("Starting Audio Stream (Worklet)...");
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      try {
          // Load the worklet module from public folder
          await audioCtx.audioWorklet.addModule('/worklets/pcm-processor.js');
          addLog("AudioWorklet Module Loaded");

          const source = audioCtx.createMediaStreamSource(stream);
          const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
          
          workletNode.port.onmessage = (event) => {
              if (wsRef.current?.readyState !== WebSocket.OPEN) return;

              const pcmBuffer = event.data; // ArrayBuffer from worklet
              const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));

              wsRef.current.send(JSON.stringify({
                  realtimeInput: {
                      mediaChunks: [{
                          mimeType: "audio/pcm",
                          data: base64Audio
                      }]
                  }
              }));
          };

          source.connect(workletNode);
          workletNode.connect(audioCtx.destination); // Keep pipeline alive
          addLog("Audio Pipeline Active");

      } catch (e: any) {
          addLog(`AudioWorklet Error: ${e.message}`);
          console.error(e);
      }
  };

  const startVideoStreaming = () => {
      addLog("Starting Video Stream...");
      const interval = window.setInterval(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN || !videoRef.current) return;

          // Debug: Check if video is actually ready
          if (videoRef.current.readyState < 2) {
             // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA
             return; 
          }
          
          if (videoRef.current.videoWidth === 0) {
              // Log only once per second to avoid spam (simple throttle check could be added here but keeping it simple)
              // addLog("Video Width is 0!"); 
              return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

          wsRef.current.send(JSON.stringify({
              realtimeInput: {
                  mediaChunks: [{
                      mimeType: "image/jpeg",
                      data: base64Image
                  }]
              }
          }));

      }, 500);
      (window as any).videoInterval = interval;
  };

  const playPcmAudio = (base64String: string) => {
    try {
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const samples = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      
      for (let i = 0; i < samples.length; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        samples[i] = int16 / 32768;
      }

      const buffer = audioCtx.createBuffer(1, samples.length, 24000); 
      buffer.getChannelData(0).set(samples);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();

    } catch (e: any) {
      addLog(`Audio Out Error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* DEBUG OVERLAY */}
      <div className="absolute top-20 left-4 z-50 pointer-events-none opacity-50 text-[10px] font-mono text-green-400 bg-black/80 p-2 rounded max-w-[200px] overflow-hidden">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           <span className="text-sm font-bold uppercase tracking-widest">Exit</span>
        </Link>
        <div className={`px-3 py-1 border rounded-full flex items-center gap-2 backdrop-blur-md transition-colors ${
            status === 'connected' ? 'bg-green-600/30 border-green-500/50' : 
            status === 'error' ? 'bg-red-600/30 border-red-500/50' : 
            'bg-yellow-600/30 border-yellow-500/50'
        }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status === 'connected' ? 'bg-green-400' : 
                  status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === 'connected' ? 'bg-green-500' : 
                  status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
                {status === 'connected' ? 'Live Connection' : 
                 status === 'connecting' ? 'Connecting...' :
                 status === 'error' ? 'Connection Failed' : 'Ready to Connect'}
            </span>
        </div>
      </div>

      {/* MAIN CONTENT LAYER */}
      <div className="flex-1 relative flex items-center justify-center">
        {!hasPermission ? (
            <div className="text-center p-8 max-w-md animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#f1c40f]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#f1c40f]/30 relative">
                     <span className="absolute inset-0 rounded-full animate-ping bg-[#f1c40f]/20"></span>
                     <svg className="w-10 h-10 text-[#f1c40f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h1 className="text-3xl font-black mb-4 tracking-tight">Let's see what's wrong.</h1>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                    I need to <strong className="text-white">see</strong> and <strong className="text-white">hear</strong> your garage door.
                </p>
                <button 
                    onClick={startCamera}
                    className="w-full py-4 bg-[#f1c40f] hover:bg-yellow-400 text-charcoal-blue font-black text-lg uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(241,196,15,0.3)] transition-all transform hover:scale-105"
                >
                    Start Diagnostic
                </button>
            </div>
        ) : (
            <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* AI OVERLAY UI */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-10 px-6">
                    <div className="flex items-end gap-4">
                         <div className="flex-1">
                             <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4 animate-in slide-in-from-bottom-5 fade-in duration-500 delay-200">
                                 <p className="text-[#f1c40f] font-bold text-xs uppercase tracking-wider mb-1">Service Hero AI</p>
                                 <p className="text-lg font-medium leading-snug">
                                     "{aiMessage}"
                                 </p>
                             </div>
                             
                             {/* AUDIO WAVEFORM VISUALIZER */}
                             <div className="flex items-center justify-center gap-1 h-8 opacity-50">
                                 {[...Array(20)].map((_, i) => (
                                     <div key={i} className="w-1 bg-white/50 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                                 ))}
                             </div>
                         </div>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
