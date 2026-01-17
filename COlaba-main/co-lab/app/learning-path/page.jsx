"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flag, CheckCircle, Lock, Star, Trophy } from 'lucide-react';

export default function LearningPathPage() {
    const router = useRouter();
    const [roadmapData, setRoadmapData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('student_roadmap');
        if (stored) {
            setRoadmapData(JSON.parse(stored));
        } else {
            // Redirect if empty? Or just show empty state
        }
        setIsLoading(false);
    }, []);

    const toggleTask = (index) => {
        if (!roadmapData) return;
        const newRoadmap = {
            ...roadmapData,
            roadmap: roadmapData.roadmap.map((item, i) =>
                i === index
                    ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
                    : item
            )
        };

        setRoadmapData(newRoadmap);
        localStorage.setItem('student_roadmap', JSON.stringify(newRoadmap));
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

    if (!roadmapData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center text-gray-400">
                        <Map size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Roadmap Found</h2>
                    <p className="text-gray-500 mb-8">It looks like you haven't started your journey yet. Create a SWOT analysis to generate your path!</p>
                    <button
                        onClick={() => router.push('/roadmap')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                    >
                        Go to Creator
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-x-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-slate-600 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    My Learning Adventure
                </h1>
                <div className="w-20"></div> {/* Spacer */}
            </div>

            {/* Map Container */}
            <div className="max-w-3xl mx-auto pt-32 pb-20 px-4 relative">

                {/* SVG Path Background */}
                <svg className="absolute top-[100px] left-0 w-full h-full -z-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                    {/* Simplified S-Curve implementation for 5 steps */}
                    {/* This would ideally be dynamically generated based on node positions */}
                    <path
                        d="M 400 100 Q 400 200, 200 300 T 200 500 T 400 700 T 400 900 T 200 1100"
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="20,20"
                    />
                </svg>

                <div className="relative flex flex-col gap-32">
                    {roadmapData.roadmap.map((step, index) => {
                        const isEven = index % 2 === 0;
                        const isCompleted = step.status === 'completed';
                        const isLocked = index > 0 && roadmapData.roadmap[index - 1].status !== 'completed';
                        const isCurrent = !isCompleted && !isLocked;

                        return (
                            <div
                                key={index}
                                className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-8 group`}
                            >
                                {/* Content Card */}
                                <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block max-w-sm p-6 rounded-2xl border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-white border-green-200 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.2)]'
                                        : isCurrent
                                            ? 'bg-white border-indigo-200 shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] scale-105'
                                            : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                                        }`}>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCompleted ? 'text-green-600' : isCurrent ? 'text-indigo-600' : 'text-slate-400'
                                            }`}>
                                            {isCompleted ? 'Mission Complete' : isCurrent ? 'Current Mission' : 'Locked'}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>

                                {/* Node */}
                                <div className="relative flex-shrink-0 z-10">
                                    <button
                                        onClick={() => !isLocked && toggleTask(index)}
                                        disabled={isLocked}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-500 relative ${isCompleted
                                            ? 'bg-green-500 border-green-200 text-white scale-100'
                                            : isCurrent
                                                ? 'bg-indigo-600 border-indigo-200 text-white scale-110 animate-bounce-slow'
                                                : 'bg-slate-200 border-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle size={28} /> : isLocked ? <Lock size={24} /> : <Star size={28} fill="currentColor" />}

                                        {/* Step Number Badge */}
                                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isCompleted ? 'bg-white text-green-600 border-green-500' : 'bg-white text-slate-500 border-slate-200'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </button>

                                    {/* Ripple Effect for Current */}
                                    {isCurrent && (
                                        <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping"></div>
                                    )}
                                </div>

                                {/* Spacer for layout balance */}
                                <div className="flex-1"></div>
                            </div>
                        );
                    })}

                    {/* Finish Line */}
                    <div className="flex flex-col items-center justify-center mt-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl text-white mb-4 animate-bounce">
                            <Trophy size={40} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Victory!</h3>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0) scale(1.1); }
                    50% { transform: translateY(-10px) scale(1.1); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}

// Simple Map icon component for empty state
const Map = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
);
