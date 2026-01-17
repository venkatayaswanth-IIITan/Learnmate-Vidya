'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../components/sidebar';
import { runStudentSWOT } from '../utils/studentSwotEngine';
import SwotModal from '../components/SwotModal';

export default function RoadmapPage() {
    const [isSwotModalOpen, setIsSwotModalOpen] = useState(false);
    const [swotLoading, setSwotLoading] = useState(false);
    const [swotData, setSwotData] = useState(null);

    const handleSwotClick = async () => {
        setIsSwotModalOpen(true);
        setSwotLoading(true);
        try {
            // Dummy ID for now
            const data = await runStudentSWOT('student_123');
            setSwotData(data);
        } catch (error) {
            console.error("Failed to generate SWOT:", error);
        } finally {
            setSwotLoading(false);
        }
    };

    return (
        <DashboardLayout activeItem="roadmap">
            <div
                className="h-full rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-8"
                style={{
                    backgroundImage: "url('/roadmap-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl">
                    <h1 className="text-5xl font-bold text-white mb-8 text-center drop-shadow-lg tracking-wide">
                        Your Journey to Success
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <Link
                            href="/dashboard?tab=profile"
                            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Student Profile</h2>
                                <p className="text-indigo-100 text-sm">View and manage your academic trajectory</p>
                            </div>
                        </Link>

                        <button
                            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 text-center text-left"
                            onClick={handleSwotClick}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">SWOT Analysis</h2>
                                <p className="text-pink-100 text-sm">Evaluate your strengths and opportunities</p>
                            </div>
                        </button>
                    </div>
                </div>

                <SwotModal
                    isOpen={isSwotModalOpen}
                    onClose={() => setIsSwotModalOpen(false)}
                    swotData={swotData}
                    isLoading={swotLoading}
                />
            </div>
        </DashboardLayout>
    );
}
