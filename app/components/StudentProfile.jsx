"use client";
import { useEffect, useState } from "react";

export default function StudentProfile() {

    const [profile, setProfile] = useState({
        sessionsJoined: 14,
        resourcesUsed: {
            whiteboard: 8,
            chat: 22,
            notes: 5,
            quiz: 3,
            chatbot: 6,
        },
        roadmap: {
            totalTasks: 20,
            completedTasks: 7,
        },
    });

    const [activity, setActivity] = useState({
        "2026-01-01": 2,
        "2026-01-02": 5,
        "2026-01-04": 1,
        "2026-01-07": 4,
    });

    const [roadmapData, setRoadmapData] = useState(null);

    // Simulate real-time updates and load roadmap
    useEffect(() => {
        // Load roadmap from local storage
        if (typeof window !== 'undefined') {
            const savedRoadmap = localStorage.getItem('student_roadmap');
            if (savedRoadmap) {
                try {
                    const parsedData = JSON.parse(savedRoadmap);
                    setRoadmapData(parsedData);

                    // Sync profile stats with loaded roadmap
                    if (parsedData && parsedData.roadmap) {
                        const completed = parsedData.roadmap.filter(r => r.status === 'completed').length;
                        setProfile(prev => ({
                            ...prev,
                            roadmap: {
                                ...prev.roadmap,
                                completedTasks: completed,
                                totalTasks: parsedData.roadmap.length
                            }
                        }));
                    }
                } catch (e) {
                    console.error("Error parsing roadmap JSON", e);
                }
            }
        }

        const interval = setInterval(() => {
            setProfile((prev) => ({
                ...prev,
                // sessionsJoined: prev.sessionsJoined + 1, // Disabled as per request
                /*
                roadmap: {
                    ...prev.roadmap,
                    completedTasks: Math.min(
                        prev.roadmap.completedTasks + 1,
                        prev.roadmap.totalTasks
                    ),
                },
                */
            }));

            const today = new Date().toISOString().split("T")[0];
            setActivity((prev) => ({
                ...prev,
                [today]: (prev[today] || 0) + 1,
            }));
        }, 6000);

        return () => clearInterval(interval);
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

        // Update profile progress
        const completed = newRoadmap.roadmap.filter(r => r.status === 'completed').length;
        setProfile(prev => ({
            ...prev,
            roadmap: {
                ...prev.roadmap,
                completedTasks: completed,
                totalTasks: newRoadmap.roadmap.length
            }
        }));
    };

    const handleViewRoadmap = () => {
        if (!roadmapData || !roadmapData.roadmap) {
            alert("Roadmap not generated yet. Please visit the Roadmap page and run a SWOT analysis to generate your personalized learning path.");
            return;
        }
        // Navigate to roadmap view page
        window.location.href = '/roadmap/view';
    };

    const progressPercent = Math.round(
        (profile.roadmap.completedTasks / profile.roadmap.totalTasks) * 100
    );

    const Card = ({ title, children, className = "" }) => (
        <div className={`p-6 rounded-2xl bg-white shadow-lg border border-slate-100 ${className}`}>
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sessions Joined Card */}
            <Card title="Sessions Joined">
                <div className="flex items-center h-full pb-4">
                    <p className="text-5xl font-bold text-slate-800">{profile.sessionsJoined}</p>
                    <span className="ml-2 text-slate-400 mb-2">total sessions</span>
                </div>
            </Card>

            {/* Progress Card */}
            <Card title="Course Progress">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-bold text-indigo-600">{progressPercent}%</span>
                        <span className="text-sm text-slate-500">{profile.roadmap.completedTasks}/{profile.roadmap.totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <button
                        onClick={handleViewRoadmap}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-4 rounded-xl transition-colors border border-indigo-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9.5 3.5" />
                        </svg>
                        View Roadmap
                    </button>
                </div>
            </Card>

            {/* Resources Used Card */}
            <Card title="Resources Used" className="md:col-span-1">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(profile.resourcesUsed).map(([key, value]) => (
                        <div
                            key={key}
                            className="flex items-center px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                            <span className="capitalize font-medium mr-2">{key}</span>
                            <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm text-indigo-600">{value}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Activity Calendar Card */}
            <Card title="Recent Activity" className="md:col-span-1">
                <div className="flex items-center space-x-1">
                    {Array.from({ length: 14 }).map((_, i) => {
                        const dayOffset = 13 - i;
                        const date = new Date();
                        date.setDate(date.getDate() - dayOffset);
                        const key = date.toISOString().split("T")[0];
                        const count = activity[key] || 0;

                        const intensity =
                            count === 0
                                ? "bg-slate-100"
                                : count < 3
                                    ? "bg-indigo-200"
                                    : count < 6
                                        ? "bg-indigo-400"
                                        : "bg-indigo-600";

                        return (
                            <div key={key} className="flex flex-col items-center gap-1">
                                <div
                                    title={`${key}: ${count} activities`}
                                    className={`w-3 h-8 rounded-sm transition-all hover:scale-110 ${intensity}`}
                                />
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-400 mt-3 text-right">Last 14 Days</p>
            </Card>
        </div>
    );
}
