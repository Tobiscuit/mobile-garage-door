'use client';

import { useEffect, useState, useCallback } from 'react';

interface TrackingData {
  center: { lat: number; lng: number };
  radius: number;
  status: 'on_the_way' | 'getting_close' | 'almost_there' | 'arriving';
  etaMinutes: number;
  techName: string;
  lastUpdate: string;
  staleMinutes: number;
  isStale: boolean;
}

interface TechTrackerProps {
  requestId: string;
  ticketId: string;
}

const STATUS_META: Record<string, { label: string; emoji: string; color: string; bgGlow: string }> = {
  on_the_way: { label: 'On the way', emoji: '🚐', color: '#3B82F6', bgGlow: 'rgba(59,130,246,0.15)' },
  getting_close: { label: 'Getting close', emoji: '📍', color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)' },
  almost_there: { label: 'Almost there', emoji: '⚡', color: '#10B981', bgGlow: 'rgba(16,185,129,0.15)' },
  arriving: { label: 'Arriving now!', emoji: '🎉', color: '#8B5CF6', bgGlow: 'rgba(139,92,246,0.20)' },
};

/**
 * TechTracker — SVG circle visualization for tech arrival tracking.
 * Polls /api/tracking/latest every 10s with smooth CSS animations.
 */
export default function TechTracker({ requestId, ticketId }: TechTrackerProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/tracking/latest/${requestId}`);
      if (!res.ok) throw new Error('Failed to fetch tracking');
      const data = await res.json();
      if (data.tracking) {
        setTracking(data.tracking);
        setError(null);
      } else {
        setTracking(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="tracker-skeleton">
        <div className="tracker-skeleton-circle" />
        <div className="tracker-skeleton-text" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="tracker-empty">
        <p className="tracker-empty-icon">📡</p>
        <p className="tracker-empty-text">Waiting for your technician to start tracking...</p>
        <p className="tracker-empty-sub">You&apos;ll see their location here once they&apos;re en route.</p>
      </div>
    );
  }

  const meta = STATUS_META[tracking.status] || STATUS_META.on_the_way;

  // Map radius (miles) to circle size (0-100% of container)
  // 5mi = tiny dot, 0.1mi = fills container
  const maxRadiusMiles = 5;
  const circlePercent = Math.max(15, Math.min(95, (1 - tracking.radius / maxRadiusMiles) * 85 + 10));

  return (
    <div className="tracker-container">
      {/* Header */}
      <div className="tracker-header">
        <span className="tracker-header-emoji">{meta.emoji}</span>
        <div>
          <h3 className="tracker-header-title">{meta.label}</h3>
          <p className="tracker-header-sub">Ticket #{ticketId}</p>
        </div>
      </div>

      {/* SVG Circle Visualization */}
      <div className="tracker-viz" style={{ '--glow-color': meta.bgGlow } as React.CSSProperties}>
        <svg viewBox="0 0 200 200" className="tracker-svg">
          {/* Background rings */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Fuzzy circle — shrinks as tech gets closer */}
          <circle
            cx="100"
            cy="100"
            r={circlePercent}
            fill={meta.bgGlow}
            stroke={meta.color}
            strokeWidth="2"
            className="tracker-circle"
          />

          {/* Pulse ring */}
          <circle
            cx="100"
            cy="100"
            r={circlePercent}
            fill="none"
            stroke={meta.color}
            strokeWidth="1.5"
            className="tracker-pulse"
            opacity="0.4"
          />

          {/* Center dot (tech) */}
          <circle
            cx="100"
            cy="100"
            r="6"
            fill={meta.color}
            className="tracker-dot"
          />
          <circle
            cx="100"
            cy="100"
            r="3"
            fill="white"
          />
        </svg>

        {/* ETA overlay */}
        <div className="tracker-eta">
          <span className="tracker-eta-number">{tracking.etaMinutes}</span>
          <span className="tracker-eta-label">min</span>
        </div>
      </div>

      {/* Info bar */}
      <div className="tracker-info">
        <div className="tracker-info-item">
          <span className="tracker-info-label">Technician</span>
          <span className="tracker-info-value">{tracking.techName}</span>
        </div>
        <div className="tracker-info-item">
          <span className="tracker-info-label">ETA</span>
          <span className="tracker-info-value">~{tracking.etaMinutes} min</span>
        </div>
        <div className="tracker-info-item">
          <span className="tracker-info-label">Precision</span>
          <span className="tracker-info-value">~{tracking.radius} mi</span>
        </div>
      </div>

      {/* Stale warning */}
      {tracking.isStale && (
        <div className="tracker-stale">
          ⚠️ Last update {tracking.staleMinutes} min ago — GPS signal may be lost
        </div>
      )}

      {/* Styles */}
      <style>{`
        .tracker-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 1.5rem;
          background: rgba(17, 17, 17, 0.95);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }

        .tracker-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .tracker-header-emoji {
          font-size: 2rem;
        }

        .tracker-header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .tracker-header-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0.15rem 0 0;
          font-family: monospace;
        }

        .tracker-viz {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
          border-radius: 1rem;
          margin-bottom: 1.5rem;
        }

        .tracker-svg {
          width: 100%;
          height: 100%;
        }

        .tracker-circle {
          transition: r 1s cubic-bezier(0.4, 0, 0.2, 1), fill 0.5s ease;
        }

        .tracker-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .tracker-dot {
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { r: inherit; opacity: 0.4; }
          50% { r: calc(inherit + 8); opacity: 0; }
        }

        @keyframes dotPulse {
          0%, 100% { r: 6; }
          50% { r: 8; }
        }

        .tracker-eta {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .tracker-eta-number {
          display: block;
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .tracker-eta-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .tracker-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .tracker-info-item {
          text-align: center;
          padding: 0.5rem;
          background: rgba(255,255,255,0.04);
          border-radius: 0.75rem;
        }

        .tracker-info-label {
          display: block;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.2rem;
        }

        .tracker-info-value {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
        }

        .tracker-stale {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 0.75rem;
          font-size: 0.8rem;
          color: #F59E0B;
          text-align: center;
        }

        .tracker-skeleton {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
        }

        .tracker-skeleton-circle {
          width: 200px;
          height: 200px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          animation: shimmer 1.5s infinite;
        }

        .tracker-skeleton-text {
          width: 60%;
          height: 1rem;
          margin: 0 auto;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.05);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .tracker-empty {
          max-width: 400px;
          margin: 0 auto;
          padding: 3rem 2rem;
          text-align: center;
        }

        .tracker-empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tracker-empty-text {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .tracker-empty-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
}
