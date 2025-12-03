'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { visualizer } from '../../ai/visualizer';

const DOOR_STYLES = [
    { id: 'modern', name: 'Modern Steel', image: '/images/doors/modern.jpg' },
    { id: 'wood', name: 'Classic Wood', image: '/images/doors/wood.jpg' },
    { id: 'glass', name: 'Aluminum Glass', image: '/images/doors/glass.jpg' },
    { id: 'carriage', name: 'Carriage House', image: '/images/doors/carriage.jpg' },
];

export default function VisualizePage() {
    const [selectedStyle, setSelectedStyle] = useState(DOOR_STYLES[0].id);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setProcessedImage(null);
            setError(null);
        }
    };

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleVisualize = async () => {
        if (!imageFile) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await visualizer.processImage(imageFile, selectedStyle);

            if (result.success && result.result) {
                setProcessedImage(result.result);
            } else {
                setError(result.error || 'Failed to process image');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-steel-gray">
                    AI Door Visualizer
                </h1>
                <p className="text-steel-gray text-center mb-12">
                    Capture your home and see it transform instantly with Google Gemini.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {/* Style Selector */}
                        <div className="card-forge p-6">
                            <h3 className="text-xl font-bold mb-4 text-brand-yellow">1. Select Style</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {DOOR_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`p-3 rounded-lg border transition-all text-left ${selectedStyle === style.id
                                                ? 'border-brand-yellow bg-brand-yellow/10 text-white'
                                                : 'border-white/10 hover:border-white/30 text-steel-gray'
                                            }`}
                                    >
                                        <span className="block font-bold">{style.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload Section */}
                        <div className="card-forge p-6">
                            <h3 className="text-xl font-bold mb-4 text-tech-cyan">2. Capture Home</h3>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />

                            {!previewUrl ? (
                                <button
                                    onClick={handleCapture}
                                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-tech-cyan/50 hover:bg-tech-cyan/5 transition-all group"
                                >
                                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-tech-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-medium">Take Photo</span>
                                </button>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10">
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                    <button
                                        onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                                        className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-500/80 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleVisualize}
                            disabled={!imageFile || isProcessing}
                            className={`w-full btn-molten py-4 text-xl flex items-center justify-center gap-3 ${(!imageFile || isProcessing) ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-6 w-6 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span>Visualize Transformation</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="card-forge p-6 flex flex-col h-full min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4 text-white">Transformation Result</h3>
                        <div className="flex-1 rounded-xl bg-slate-950/50 border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden">
                            {processedImage ? (
                                <div className="relative w-full h-full">
                                    <Image src={processedImage} alt="AI Result" fill className="object-contain" />
                                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-xs text-tech-cyan font-mono">GENERATED BY GEMINI</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 opacity-50">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium">Ready to Visualize</p>
                                    <p className="text-sm">Select a style and capture a photo to see the magic.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
