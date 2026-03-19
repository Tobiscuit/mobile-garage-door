'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, MapPin, CheckCircle, AlertTriangle, Navigation } from 'lucide-react';

interface TechJobActionsProps {
  jobId: number;
  ticketId: string;
  currentStatus: string;
}

/**
 * TechJobActions — client component for tech job card.
 * Handles "I'm heading out" → dispatched + GPS tracking,
 * "I've arrived" → on_site, "Job complete" → completed + stop tracking.
 */
export default function TechJobActions({ jobId, ticketId, currentStatus }: TechJobActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isTracking, setIsTracking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Send GPS to tracking API
  const sendLocation = useCallback(async () => {
    const coords = latestCoordsRef.current;
    if (!coords) return;

    try {
      await fetch('/api/tracking/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceRequestId: jobId,
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy,
        }),
      });
    } catch (err) {
      console.error('[Tracking] Send failed:', err);
    }
  }, [jobId]);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS not available on this device');
      return;
    }

    // Watch position — updates on every GPS change
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        latestCoordsRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      },
      (err) => {
        console.error('[Tracking] GPS error:', err.message);
        setError(`GPS error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
    watchIdRef.current = watchId;

    // Send latest coords every 30 seconds
    const interval = setInterval(sendLocation, 30000);
    intervalRef.current = interval;

    // Send immediately on start
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latestCoordsRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        sendLocation();
      },
      () => {}, // Error handled by watchPosition
      { enableHighAccuracy: true, timeout: 10000 }
    );

    setIsTracking(true);
  }, [sendLocation]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  // Resume tracking if page loaded while dispatched
  useEffect(() => {
    if (status === 'dispatched' && !isTracking) {
      startTracking();
    }
  }, []);

  // Update status
  const updateStatus = useCallback(async (newStatus: string) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch('/api/tracking/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRequestId: jobId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      setStatus(newStatus);

      if (newStatus === 'dispatched') {
        startTracking();
      } else if (newStatus === 'completed') {
        stopTracking();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }, [jobId, startTracking, stopTracking]);

  return (
    <div className="tech-actions">
      {/* Tracking banner */}
      {isTracking && (
        <div className="tech-actions-banner">
          <span className="tech-actions-dot" />
          <Navigation className="w-4 h-4" /> Sharing location for #{ticketId}
        </div>
      )}

      {/* Action buttons based on current status */}
      <div className="tech-actions-buttons">
        {(status === 'pending' || status === 'confirmed') && (
          <button
            onClick={() => updateStatus('dispatched')}
            disabled={updating}
            className="tech-actions-btn tech-actions-btn-primary"
          >
            {updating ? '...' : <><Truck className="w-4 h-4 inline -mt-0.5" /> I'm heading out</>}
          </button>
        )}

        {status === 'dispatched' && (
          <>
            <button
              onClick={() => updateStatus('on_site')}
              disabled={updating}
              className="tech-actions-btn tech-actions-btn-success"
            >
              {updating ? '...' : <><MapPin className="w-4 h-4 inline -mt-0.5" /> I've arrived</>}
            </button>
            <button
              onClick={stopTracking}
              className="tech-actions-btn tech-actions-btn-ghost"
            >
              Stop sharing
            </button>
          </>
        )}

        {status === 'on_site' && (
          <button
            onClick={() => updateStatus('completed')}
            disabled={updating}
            className="tech-actions-btn tech-actions-btn-complete"
          >
            {updating ? '...' : <><CheckCircle className="w-4 h-4 inline -mt-0.5" /> Job complete</>}
          </button>
        )}

        {status === 'completed' && (
          <div className="tech-actions-done"><CheckCircle className="w-4 h-4 inline -mt-0.5" /> Completed</div>
        )}
      </div>

      {error && <div className="tech-actions-error"><AlertTriangle className="w-4 h-4 inline -mt-0.5" /> {error}</div>}

      <style>{`
        .tech-actions {
          width: 100%;
        }

        .tech-actions-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: #10B981;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .tech-actions-dot {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          animation: blink 1.5s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .tech-actions-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tech-actions-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }

        .tech-actions-btn:active { transform: scale(0.97); }
        .tech-actions-btn:disabled { opacity: 0.5; cursor: wait; }

        .tech-actions-btn-primary {
          background: var(--staff-accent);
          color: var(--staff-bg);
        }

        .tech-actions-btn-success {
          background: var(--staff-accent);
          color: var(--staff-bg);
        }

        .tech-actions-btn-complete {
          background: var(--staff-accent);
          color: var(--staff-bg);
        }

        .tech-actions-btn-ghost {
          background: var(--staff-border);
          border: 1px solid var(--staff-border);
          color: var(--staff-muted);
          font-size: 0.8rem;
          padding: 0.5rem;
        }

        .tech-actions-done {
          text-align: center;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          color: #10B981;
          font-weight: 700;
        }

        .tech-actions-error {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: #EF4444;
        }
      `}</style>
    </div>
  );
}
