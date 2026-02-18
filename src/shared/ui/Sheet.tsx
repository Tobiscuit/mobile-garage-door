'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom'; // Desktop default right, Mobile default bottom
}

export function Sheet({ isOpen, onClose, title, children, side = 'right' }: SheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!mounted) return null;

  // Determine animation variants based on side/mobile
  // On mobile, we almost always want 'bottom' sheet behavior for "modern" feel
  const effectiveSide = isMobile ? 'bottom' : side;

  const variants = {
    hidden: { 
      x: effectiveSide === 'right' ? '100%' : '0', 
      y: effectiveSide === 'bottom' ? '100%' : '0',
      opacity: 0.5,
      scale: 0.95
    },
    visible: { 
      x: '0', 
      y: '0',
      opacity: 1,
      scale: 1,
      transition: { 
        type: 'spring' as const, 
        damping: 25, 
        stiffness: 300, 
        mass: 0.8 
      }
    },
    exit: { 
      x: effectiveSide === 'right' ? '100%' : '0', 
      y: effectiveSide === 'bottom' ? '100%' : '0',
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.2,
        ease: 'easeInOut' as const
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end items-end md:items-stretch pointer-events-none">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Sheet Panel */}
          <motion.div
            className={`
              pointer-events-auto
              backdrop-blur-2xl 
              border-l border-t 
              shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]
              w-full 
              ${effectiveSide === 'right' 
                ? 'h-full md:max-w-md' 
                : 'h-[85vh] rounded-t-[2rem]'
              }
              flex flex-col
              overflow-hidden
            `}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={effectiveSide === 'bottom' ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (effectiveSide === 'bottom' && (offset.y > 100 || velocity.y > 500)) {
                onClose();
              }
            }}
            style={{ backgroundColor: 'var(--staff-surface)', borderColor: 'var(--staff-border)' }}
          >
            {/* Drag Handle for Mobile */}
            {effectiveSide === 'bottom' && (
              <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'var(--staff-border)' }} />
              </div>
            )}

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b shrink-0" style={{ borderColor: 'var(--staff-border)' }}>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--staff-text)' }}>{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--staff-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
