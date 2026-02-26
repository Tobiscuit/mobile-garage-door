'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DiagnosePage() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [aiState, setAiState] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [aiMessage, setAiMessage] = useState("I'm listening. Point your camera at the garage door.");
  const [waveformData, setWaveformData] = useState<number[]>(new Array(20).fill(0));
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const videoIntervalRef = useRef<number | null>(null);
  const streamsStartedRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fullTranscriptRef = useRef('');
  const typewriterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayedLenRef = useRef(0);

  useEffect(() => {
    return () => {
      stopMedia();
      wsRef.current?.close();
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, []);

  // Visibility API: kill audio/WS on Android swipe-away or tab switch
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        audioContextRef.current?.suspend();
        playbackContextRef.current?.suspend();
        wsRef.current?.close();
        setStatus('idle');
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const stopMedia = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => {
           track.stop();
           track.enabled = false;
       });
       videoRef.current.srcObject = null;
    }
    audioContextRef.current?.close();
    playbackContextRef.current?.close();
    if (videoIntervalRef.current !== null) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    streamsStartedRef.current = false;
  };



  const startCamera = async () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true
        }
      });
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error('Play Error:', e));
      }
      
      connectWebSocket(stream);

    } catch (err: any) {
      console.error('Camera Error:', err);
      setHasPermission(false);
      alert("We need camera access. Please check permissions.");
    }
  };

  const connectWebSocket = (stream: MediaStream) => {
      setStatus('connecting');
      
      const wsUrl = window.location.hostname === 'localhost' 
          ? 'ws://localhost:3001' 
          : 'wss://mobile-garage-door-realtime-proxy.tobiasramzy.workers.dev';
          
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
          setStatus('connected');
      };

      ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.setupComplete) {
                if (!streamsStartedRef.current) {
                    streamsStartedRef.current = true;
                    startAudioStreaming(stream);
                    startVideoStreaming();
                    ws.send(JSON.stringify({
                      clientContent: {
                        turns: [{
                          role: "user",
                          parts: [{ text: "[The customer has connected and pointed their camera at the garage door. Greet them warmly and begin your visual inspection.]" }]
                        }],
                        turnComplete: true
                      }
                    }));
                }
            }
            
            // 1. Handle Audio Output (Skip text from modelTurn — it's thinking, not speech)
            if (data.serverContent?.modelTurn?.parts) {
                setAiState('speaking');
                for (const part of data.serverContent.modelTurn.parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                        playPcmAudio(part.inlineData.data);
                    }
                }
            }

            // 2. Handle Tool Calls from AI (Live API sends this under serverContent.toolCall, not modelTurn)
            if (data.serverContent?.toolCall?.functionCalls) {
                for (const call of data.serverContent.toolCall.functionCalls) {
                    if (call.name === 'report_diagnosis') {
                        const args = call.args || {};
                        const hour = new Date().getHours();
                        const isAfterHours = hour < 7 || hour >= 19;
                        const finalUrgency = args.urgency === 'emergency' || isAfterHours
                            ? 'emergency' : 'standard';
                        
                        // Store diagnosis in sessionStorage for the booking form
                        sessionStorage.setItem('aiDiagnosis', JSON.stringify({
                            issueDescription: args.issue_summary || "Automated diagnostic completed.",
                            urgency: finalUrgency,
                            fromDiagnosis: true
                        }));

                        console.log("TOOL CALL RECEIVED, REDIRECTING:", args);

                        setTimeout(() => {
                            wsRef.current?.close();
                            stopMedia();
                            window.location.href = '/book-service';
                        }, 1500); // Slight delay then hard redirect
                    }
                }
            }

            // Handle Transcript (Typewriter Effect)
            if (data.serverContent?.outputTranscription?.text) {
                const newChunk = data.serverContent.outputTranscription.text;
                fullTranscriptRef.current += newChunk; 
                
                if (!typewriterTimerRef.current) {
                    typewriterTimerRef.current = setInterval(() => {
                        if (displayedLenRef.current < fullTranscriptRef.current.length) {
                             displayedLenRef.current += 1;
                             setAiMessage(fullTranscriptRef.current.slice(0, displayedLenRef.current));
                        }
                    }, 30);
                }
            }

            if (data.serverContent?.turnComplete) {
                setAiState('listening');
                // Reset transcript for next turn
                fullTranscriptRef.current = '';
                displayedLenRef.current = 0;
                if (typewriterTimerRef.current) {
                    clearInterval(typewriterTimerRef.current);
                    typewriterTimerRef.current = null;
                }
            }
          } catch (e) {
              console.error('Parse error', e);
          }
      };

      ws.onerror = (err) => {
          console.error('WS Error:', err);
          setStatus('error');
      };

      ws.onclose = () => {
          setStatus('idle');
      };
  };

  const startAudioStreaming = async (stream: MediaStream) => {
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      try {
          await audioCtx.audioWorklet.addModule('/worklets/pcm-processor.js');

          const source = audioCtx.createMediaStreamSource(stream);
          const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');

          // AnalyserNode for live waveform visualization
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          // Start waveform animation loop
          const updateWaveform = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            // Sample 20 bars from the frequency data
            const bars = Array.from({ length: 20 }, (_, i) => {
              const idx = Math.floor((i / 20) * dataArray.length);
              return dataArray[idx] / 255;
            });
            setWaveformData(bars);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          updateWaveform();
          
          workletNode.port.onmessage = (event) => {
              if (wsRef.current?.readyState !== WebSocket.OPEN) return;

              const pcmBuffer = event.data;
              const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));

              wsRef.current.send(JSON.stringify({
                  realtimeInput: {
                      audio: {
                          mimeType: "audio/pcm;rate=16000",
                          data: base64Audio
                      }
                  }
              }));
          };

          source.connect(workletNode);
          workletNode.connect(audioCtx.destination);

      } catch (e: any) {
          console.error('AudioWorklet Error:', e);
      }
  };

  const startVideoStreaming = () => {
      const interval = window.setInterval(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN || !videoRef.current) return;

          // Debug: Check if video is actually ready
          if (videoRef.current.readyState < 2) {
             // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA
             return; 
          }
          
          if (videoRef.current.videoWidth === 0) {
              // Log only once per second to avoid spam (simple throttle check could be added here but keeping it simple)

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
                  video: {
                      mimeType: "image/jpeg",
                      data: base64Image
                  }
              }
          }));

      }, 500);
      videoIntervalRef.current = interval;
  };

  const playPcmAudio = (base64String: string) => {
    try {
      // Initialize playback context once at 24kHz (Gemini's output rate)
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextStartTimeRef.current = playbackContextRef.current.currentTime;
      }
      const audioCtx = playbackContextRef.current;
      if (!audioCtx) return;

      // Decode base64 → raw bytes
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Int16 PCM → Float32 for Web Audio
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

      // Schedule sequentially — don't overlap chunks
      if (nextStartTimeRef.current < audioCtx.currentTime) {
        nextStartTimeRef.current = audioCtx.currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

    } catch (e: any) {
      console.error('Audio Out Error:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">


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
        {/* Video is always in the DOM so videoRef survives re-renders */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover ${!hasPermission ? 'hidden' : ''}`}
        />

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
                             
                             {/* LIVE AUDIO WAVEFORM */}
                             <div className="flex items-center justify-center gap-1 h-8">
                                 {waveformData.map((level, i) => (
                                     <div key={i} className="w-1 bg-[#f1c40f]/70 rounded-full transition-all duration-75" style={{ height: `${Math.max(8, level * 100)}%` }}></div>
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
