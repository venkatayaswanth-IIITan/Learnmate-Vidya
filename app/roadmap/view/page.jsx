'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/sidebar';

export default function RoadmapViewPage() {
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, upcoming: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRoadmap = localStorage.getItem('student_roadmap');
            if (savedRoadmap) {
                try {
                    const parsedData = JSON.parse(savedRoadmap);
                    setRoadmapData(parsedData);
                    calculateStats(parsedData);
                } catch (e) {
                    console.error("Error parsing roadmap JSON", e);
                }
            }
            setLoading(false);
        }
    }, []);

    const calculateStats = (data) => {
        if (!data || !data.roadmap) return;

        const total = data.roadmap.length;
        const completed = data.roadmap.filter(item => item.status === 'completed').length;
        const firstIncomplete = data.roadmap.findIndex(item => item.status !== 'completed');
        const inProgress = firstIncomplete >= 0 ? 1 : 0;
        const upcoming = total - completed - inProgress;

        setStats({ total, completed, inProgress, upcoming });
    };

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
        calculateStats(newRoadmap);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to delete this roadmap?")) {
            setRoadmapData(null);
            localStorage.removeItem('student_roadmap');
            setStats({ total: 0, completed: 0, inProgress: 0, upcoming: 0 });
        }
    };

    const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    if (loading) {
        return (
            <DashboardLayout activeItem="roadmap">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading your journey...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!roadmapData || !roadmapData.roadmap) {
        return (
            <DashboardLayout activeItem="roadmap">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9.5 3.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">No Roadmap Yet</h2>
                        <p className="text-slate-500 mb-6">Start your learning journey by generating a personalized roadmap</p>
                        <Link href="/roadmap" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                            Generate Roadmap
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeItem="roadmap">
            <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12 px-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                    <div className="max-w-6xl mx-auto relative z-10">
                        <Link href="/dashboard?tab=profile" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Profile
                        </Link>
                        <h1 className="text-5xl font-extrabold mb-3 tracking-tight">Your Learning Journey</h1>
                        <p className="text-white/90 text-lg">Track progress, achieve goals, transform your future</p>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="max-w-6xl mx-auto -mt-8 px-8 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Circular Progress */}
                        <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-xl border border-indigo-100">
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="#e0e7ff" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 56}`}
                                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-indigo-600">{progressPercent}%</span>
                                    <span className="text-xs text-slate-500 font-medium">Complete</span>
                                </div>
                            </div>
                        </div>

                        {/* Stat Cards */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Tasks</span>
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-extrabold text-slate-800">{stats.total}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Completed</span>
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-extrabold text-green-600">{stats.completed}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Remaining</span>
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-extrabold text-amber-600">{stats.inProgress + stats.upcoming}</p>
                        </div>
                    </div>

                    {/* Roadmap Timeline */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-bold text-slate-800">Your Roadmap</h2>
                            <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-colors">
                                Reset Roadmap
                            </button>
                        </div>

                        {/* Zigzag Timeline Layout */}
                        <div className="relative">
                            {/* Central Timeline Line */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 hidden md:block"></div>

                            <div className="space-y-16">
                                {roadmapData.roadmap.map((step, index) => {
                                    const isCompleted = step.status === 'completed';
                                    const isNext = !isCompleted && (index === 0 || roadmapData.roadmap[index - 1].status === 'completed');
                                    const isLeft = index % 2 === 0;

                                    return (
                                        <div key={index} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col group`}>
                                            {/* Task Card */}
                                            <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                                                <div
                                                    onClick={() => toggleTask(index)}
                                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 transform hover:scale-105 ${isCompleted
                                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-100'
                                                            : isNext
                                                                ? 'bg-white border-indigo-300 shadow-2xl ring-4 ring-indigo-100 animate-pulse'
                                                                : 'bg-white/80 border-slate-200 shadow-md hover:shadow-lg'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${isCompleted ? 'bg-green-200 text-green-800' : isNext ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'
                                                                }`}>
                                                                {isCompleted ? '✓ Completed' : isNext ? '→ Current Goal' : 'Upcoming'}
                                                            </span>
                                                            <h3 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-green-900' : 'text-slate-900'}`}>
                                                                {step.title}
                                                            </h3>
                                                            <p className={`text-sm leading-relaxed ${isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                                                                {step.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                                                            }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {step.duration}
                                                        </span>
                                                        <span className={`text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                                                            Step {index + 1} of {roadmapData.roadmap.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Central Node */}
                                            <div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
                                                <button
                                                    onClick={() => toggleTask(index)}
                                                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 transform hover:scale-125 hover:rotate-12 shadow-2xl ${isCompleted
                                                            ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 shadow-green-300'
                                                            : isNext
                                                                ? 'bg-gradient-to-br from-indigo-400 to-purple-600 border-indigo-300 shadow-indigo-300 animate-pulse'
                                                                : 'bg-white border-slate-300 shadow-slate-200'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <span className={`font-extrabold text-2xl ${isNext ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Mobile Node (shown on small screens) */}
                                            <div className="md:hidden mb-4">
                                                <button
                                                    onClick={() => toggleTask(index)}
                                                    className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform hover:scale-110 mx-auto ${isCompleted
                                                            ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 shadow-lg shadow-green-200'
                                                            : isNext
                                                                ? 'bg-gradient-to-br from-indigo-400 to-purple-600 border-indigo-300 shadow-lg shadow-indigo-200 animate-pulse'
                                                                : 'bg-white border-slate-300 shadow-md'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <span className={`font-extrabold text-xl ${isNext ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Connecting Line (Desktop only) */}
                                            <div className={`hidden md:block absolute top-1/2 ${isLeft ? 'left-1/2 ml-8' : 'right-1/2 mr-8'} w-8 h-0.5 ${isCompleted ? 'bg-gradient-to-r from-green-400 to-green-300' : 'bg-slate-200'
                                                }`}></div>

                                            {/* Empty space for layout balance */}
                                            <div className="hidden md:block w-5/12"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
