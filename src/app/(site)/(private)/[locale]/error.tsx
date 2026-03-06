'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("CAUGHT BY ERROR BOUNDARY:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)', borderRadius: '1rem', marginTop: '2rem' }}>
            <h2 className="text-2xl font-bold mb-4 text-red-500">Dashboard Render Error</h2>
            <p className="mb-6" style={{ color: 'var(--staff-text)' }}>
                A Server Component or Hydration error occurred and was caught by the boundary.
            </p>

            <div className="text-left w-full max-w-2xl overflow-auto bg-black border border-gray-700 p-4 rounded-lg mb-6 shadow-inset">
                <p className="font-mono text-sm text-yellow-300 break-words mb-2">Message: {error.message || 'No message provided'}</p>
                <p className="font-mono text-sm text-blue-300 break-words mb-2">Digest: {error.digest || 'No digest available'}</p>
                <p className="font-mono text-xs text-gray-400 whitespace-pre-wrap">{error.stack || 'No stack trace'}</p>
            </div>

            <button
                onClick={() => reset()}
                className="px-6 py-3 font-bold text-[#2c3e50] bg-[#f1c40f] rounded-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
                Try Again / Recover
            </button>
        </div>
    );
}
