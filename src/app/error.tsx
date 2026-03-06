'use client';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Forcefully blast the exact unhandled exception into the client console
        // to bypass the Next.js production obfuscation logic "Error occurred in Server Component"
        console.error("====== CRITICAL RSC FATAL EXCEPTION ======");
        console.error("Stack Trace:", error.stack);
        console.error("Message:", error.message);
        if (error.digest) {
            console.error("Next.js Server Digest ID:", error.digest);
        }
        console.error("==========================================");
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-red-500/50 max-w-lg shadow-2xl">
                <h2 className="text-3xl font-black text-red-400 mb-4">Fatal Server Render Error</h2>
                <p className="text-gray-300 mb-6">
                    The dashboard crashed while rendering heavily on the Cloudflare Edge Worker. We have forced the raw exception stack trace into your browser's Developer Console (F12).
                </p>
                <div className="bg-black/50 p-4 rounded-xl text-left border border-white/10 mb-6">
                    <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap overflow-x-auto">
                        {error.message || 'Unknown Server Component Exception'}
                    </pre>
                </div>
                <button
                    onClick={() => reset()}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
                >
                    Attempt Hydration Retry
                </button>
            </div>
        </div>
    );
}
