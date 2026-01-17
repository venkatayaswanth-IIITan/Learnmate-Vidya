'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/sidebar';
import { useTaskWatcher } from '../../hooks/useTaskWatcher';
import { calculateMetrics } from '../../utils/metricsService';
import { logEvent } from '../../utils/loggingService';

export default function RoadmapViewPage() {
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, upcoming: 0 });
    const [expandedReasons, setExpandedReasons] = useState({});

    const toggleHeroReason = (index) => {
        setExpandedReasons(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

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

    // Integrate Shared Automated Watcher
    useTaskWatcher(roadmapData, setRoadmapData, (updatedData) => {
        calculateStats(updatedData);
    }, 1000); // Check every 1s for instant feedback

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
        // Manual override disabled for students
        console.log("Tasks are completed automatically based on your activity!");
    };

    const simulateActivity = (task, index) => {
        const criteria = task.successCriteria || { minDuration: 10 };
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        const now = Date.now();
        const startTime = now - (criteria.minDuration || 10) * 60 * 1000 - 1000;

        // 1. Create start log
        const startLog = {
            id: `sim-start-${now}`,
            eventType: "SESSION_START",
            timestamp: startTime,
            metadata: { mode: "solo" },
            context: { source: "demo_simulator" }
        };

        // 2. Create required events logs
        const eventLogs = (criteria.requiredEvents || ["WHITEBOARD_USED"]).map((type, i) => ({
            id: `sim-event-${now}-${i}`,
            eventType: type,
            timestamp: startTime + (i + 1) * 1000,
            metadata: { mode: "solo" },
            context: { source: "demo_simulator" }
        }));

        // 3. Create interaction logs if needed
        const interactionLogs = [];
        if (criteria.minInteractions) {
            for (let i = 0; i < criteria.minInteractions; i++) {
                interactionLogs.push({
                    id: `sim-int-${now}-${i}`,
                    eventType: "CHAT_MESSAGE_SENT",
                    timestamp: startTime + (i + 5) * 1000,
                    metadata: { mode: "solo" },
                    context: { source: "demo_simulator" }
                });
            }
        }

        // 4. Create end log to satisfy duration
        const endLog = {
            id: `sim-end-${now}`,
            eventType: "SESSION_END",
            timestamp: now,
            metadata: { mode: "solo" },
            context: { source: "demo_simulator" }
        };

        const simulatedLogs = [startLog, ...eventLogs, ...interactionLogs, endLog];
        const newLogs = [...logs, ...simulatedLogs];

        localStorage.setItem('activity_logs', JSON.stringify(newLogs));

        // SIMULTANEOUSLY update the state and localStorage for instant demo feedback
        const currentMetrics = calculateMetrics(newLogs);
        const signal = evaluateGrowthSignal(task.learningStateBefore?.metrics, currentMetrics);

        const completedTask = {
            ...task,
            status: 'completed',
            completedAt: now,
            signal: signal,
            metricsAfter: currentMetrics
        };

        const newRoadmap = {
            ...roadmapData,
            roadmap: roadmapData.roadmap.map((t, i) => i === index ? completedTask : t)
        };

        setRoadmapData(newRoadmap);
        localStorage.setItem('student_roadmap', JSON.stringify(newRoadmap));
        calculateStats(newRoadmap);

        // Log to Firestore instantly
        logEvent("ROADMAP_TASK_AUTO_COMPLETED", {
            mode: 'solo',
            source: 'system_demo_sim'
        }, {
            taskId: task.id || task.title,
            title: task.title,
            signal: signal
        });
    };

    const evaluateGrowthSignal = (oldMetrics, newMetrics) => {
        if (!oldMetrics || !newMetrics) return 'neutral';
        const engagementDiff = newMetrics.engagementScore - oldMetrics.engagementScore;
        const handsOnDiff = (newMetrics.handsOnRate || 0) - (oldMetrics.handsOnRate || 0);

        if (engagementDiff > 0.05 || handsOnDiff > 0.1) return 'success';
        if (engagementDiff < -0.05) return 'fail';
        return 'neutral';
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to delete this roadmap?")) {
            setRoadmapData(null);
            localStorage.removeItem('student_roadmap');
            setStats({ total: 0, completed: 0, inProgress: 0, upcoming: 0 });
        }
    };

    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

    const handleRecalculate = () => {
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        const newState = calculateMetrics(logs) || { metrics: {} };
        const initialState = roadmapData.roadmap[0]?.learningStateBefore?.metrics || {};

        // Group signals by intent
        const intentGroups = {};
        roadmapData.roadmap.forEach(task => {
            const intent = task.intent || "General Growth";
            if (!intentGroups[intent]) intentGroups[intent] = { tasks: 0, success: 0, fail: 0, neutral: 0 };
            intentGroups[intent].tasks++;
            intentGroups[intent][task.signal || 'neutral']++;
        });

        // Generate Meta-Feedback
        const feedback = generateMetaFeedback(intentGroups);

        setAnalysisData({
            initialState,
            newState,
            intentGroups,
            feedback
        });

        // Save to meta-context for future AI use
        localStorage.setItem('roadmap_meta_feedback', JSON.stringify({
            feedback,
            intentGroups,
            metricsImprovement: {
                engagement: (newState.metrics?.engagementScore || 0) - (initialState.engagementScore || 0),
                handsOn: (newState.metrics?.handsOnRate || 0) - (initialState.handsOnRate || 0)
            },
            timestamp: Date.now()
        }));

        setShowAnalysis(true);
    };

    const generateMetaFeedback = (groups) => {
        const insights = [];
        Object.entries(groups).forEach(([intent, stats]) => {
            if (stats.success > stats.fail) {
                insights.push(`Your performance in **${intent}** was strong. These types of tasks are highly effective for you.`);
            } else if (stats.fail > stats.success) {
                insights.push(`Tasks focused on **${intent}** seemed challenging. We'll adjust the difficulty and approach in your next roadmap.`);
            }
        });
        return insights;
    };

    const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const allCompleted = stats.total > 0 && stats.completed === stats.total;

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
            <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12 px-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCIvPjwvc3ZnPg==')] opacity-20"></div>
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

                {/* Main Content */}
                <div className="max-w-6xl mx-auto -mt-8 px-8">
                    {/* Stat Cards */}
                    {!showAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-xl border border-indigo-100 flex items-center justify-center">
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="42" stroke="#e0e7ff" strokeWidth="8" fill="none" />
                                        <circle
                                            cx="48" cy="48" r="42"
                                            stroke="url(#gradient)"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 42}`}
                                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
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
                                        <span className="text-2xl font-extrabold text-indigo-600">{progressPercent}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total</p>
                                <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                                <p className="text-green-500 text-xs font-bold uppercase mb-1">Completed</p>
                                <p className="text-3xl font-black text-green-600">{stats.completed}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                                <p className="text-amber-500 text-xs font-bold uppercase mb-1">Remaining</p>
                                <p className="text-3xl font-black text-amber-600">{stats.total - stats.completed}</p>
                            </div>
                        </div>
                    )}

                    {/* Completion Analysis / Comparison View */}
                    {allCompleted && !showAnalysis && (
                        <div className="mb-8 p-10 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl shadow-2xl text-white text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-4xl font-black mb-4">Journey Completed!</h2>
                            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">You've finished your personalized roadmap. Now, let's analyze how much you've grown and evolve your learning strategy.</p>
                            <button
                                onClick={handleRecalculate}
                                className="px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                            >
                                Generate Growth Analysis
                            </button>
                        </div>
                    )}

                    {showAnalysis && analysisData && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                            {/* Comparison Dashboard */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Metric Improvements
                                    </h3>
                                    <div className="space-y-6">
                                        {['Engagement', 'Hands-on Rate', 'Sustain Focus'].map((label, i) => {
                                            const key = i === 0 ? 'engagementScore' : i === 1 ? 'handsOnRate' : 'consistencyScore';
                                            const before = (analysisData.initialState[key] || 0);
                                            const after = (analysisData.newState.metrics?.[key] || 0);
                                            const diff = after - before;
                                            const isImprovement = diff > 0;

                                            return (
                                                <div key={label} className="group">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-slate-700">{label}</span>
                                                        <span className={`text-sm font-black px-2 py-0.5 rounded ${isImprovement ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {isImprovement ? '+' : ''}{(diff * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute left-0 top-0 h-full bg-indigo-200 transition-all duration-1000"
                                                            style={{ width: `${before * 100}%` }}
                                                        />
                                                        <div
                                                            className={`absolute left-0 top-0 h-full ${isImprovement ? 'bg-green-500' : 'bg-red-400'} transition-all duration-1000 delay-500`}
                                                            style={{ width: `${after * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1 px-1">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Initial</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">New State</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        Platform Feedback
                                    </h3>
                                    <div className="space-y-4">
                                        {analysisData.feedback.map((msg, i) => (
                                            <div key={i} className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl">
                                                <p className="text-sm text-indigo-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                            </div>
                                        ))}
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Task Effectiveness by Intent</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(analysisData.intentGroups).map(([intent, stats]) => (
                                                    <div key={intent} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <p className="text-[11px] font-black text-slate-800 mb-1 truncate">{intent}</p>
                                                        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-green-500 transition-all duration-1000" style={{ width: `${(stats.success / stats.tasks) * 100}%` }} />
                                                            <div className="bg-red-400 transition-all duration-1000" style={{ width: `${(stats.fail / stats.tasks) * 100}%` }} />
                                                            <div className="bg-slate-300 transition-all duration-1000" style={{ width: `${(stats.neutral / stats.tasks) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    localStorage.removeItem('student_roadmap');
                                    window.location.href = '/dashboard';
                                }}
                                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Finish Journey & Strengthen Next SWOT
                            </button>
                        </div>
                    )}

                    {!showAnalysis && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-2xl font-bold text-slate-800">Your Roadmap</h2>
                                <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-colors">
                                    Reset Roadmap
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 hidden md:block"></div>
                                <div className="space-y-16">
                                    {roadmapData.roadmap.map((step, index) => {
                                        const isCompleted = step.status === 'completed';
                                        const isNext = !isCompleted && (index === 0 || roadmapData.roadmap[index - 1].status === 'completed');
                                        const isLeft = index % 2 === 0;

                                        return (
                                            <div key={index} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col group`}>
                                                <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                                                    <div
                                                        className={`p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${isCompleted
                                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg'
                                                            : isNext
                                                                ? 'bg-white border-indigo-300 shadow-2xl ring-4 ring-indigo-100'
                                                                : 'bg-white/80 border-slate-200 opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-green-100 text-green-700' : isNext ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {step.intent || 'Development'}
                                                                </span>
                                                                {isNext && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); simulateActivity(step, index); }}
                                                                        className="px-2 py-1 text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md hover:bg-emerald-600 hover:text-white transition-all"
                                                                    >
                                                                        Simulate Done
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                                                            <p className="text-sm text-slate-600 mt-2">{step.description}</p>

                                                            {step.reason && (
                                                                <div className="mt-4">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleHeroReason(index); }}
                                                                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${expandedReasons[index] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                        {expandedReasons[index] ? 'Hide Why' : 'Why this task?'}
                                                                    </button>

                                                                    {expandedReasons[index] && (
                                                                        <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                                                                            <p className="text-[11px] font-medium text-indigo-800 italic">&ldquo;{step.reason}&rdquo;</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                                                <span className="text-xs font-bold text-slate-400 capitalize">{step.duration} expected</span>
                                                                {isCompleted && taskSignals[step.signal || 'neutral']}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-200' : isNext ? 'bg-indigo-500 border-indigo-200 animate-pulse' : 'bg-white border-slate-200'}`}>
                                                        {isCompleted ? <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg> : <span className={`font-bold ${isNext ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>}
                                                    </div>
                                                </div>

                                                <div className={`hidden md:block absolute top-1/2 ${isLeft ? 'left-1/2 ml-6' : 'right-1/2 mr-6'} w-6 h-0.5 ${isCompleted ? 'bg-green-300' : 'bg-slate-200'}`}></div>
                                                <div className="hidden md:block w-5/12"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

const taskSignals = {
    success: <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Growth Detected</span>,
    fail: <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-tighter"><span className="w-2 h-2 rounded-full bg-red-500" /> Improvement Lag</span>,
    neutral: <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter"><span className="w-2 h-2 rounded-full bg-slate-400" /> Stable State</span>
};
