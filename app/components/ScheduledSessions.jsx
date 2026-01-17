import React, { useState } from 'react';
import CreateSessionModal from './CreateSessionModal';
import FullscreenSession from './FullscreenSession';

const ScheduledSessions = ({ groupId, onJoin }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState(null);


    // Dummy data for scheduled sessions
    const [sessions, setSessions] = useState([
        {
            id: 1,
            title: 'Intro to React Hooks',
            date: '2026-01-15',
            time: '14:00 - 15:30',
            host: 'Sarah Chen, Senior Dev',
            description: 'Deep dive into useEffect, useState and custom hooks. Preparation for the upcoming project.',
            attendees: 12,
            tags: ['React', 'Frontend', 'Live Coding']
        },
        {
            id: 2,
            title: 'System Design Interview Prep',
            date: '2026-01-18',
            time: '10:00 - 11:30',
            host: 'Alex Kumar',
            description: 'Mock interview session for system design. We will design a scalable URL shortener.',
            attendees: 5,
            tags: ['Interview', 'Backend', 'System Design']
        },
        {
            id: 3,
            title: 'Weekly Standup & Sync',
            date: '2026-01-20',
            time: '09:00 - 09:30',
            host: 'Team Lead',
            description: 'Regular weekly sync to discuss progress and blockers.',
            attendees: 8,
            tags: ['Agile', 'Team']
        },
        {
            id: 4,
            title: 'Advanced CSS Grid & Flexbox',
            date: '2026-01-22',
            time: '16:00 - 17:30',
            host: 'Design Team',
            description: 'Mastering modern CSS layout techniques. Bring your layout challenges!',
            attendees: 15,
            tags: ['CSS', 'Design', 'UI/UX']
        }
    ]);

    const handleSessionCreated = (newSession) => {
        setSessions([...sessions, newSession]);
    };

    return (
        <>
            {/* Root Container: Full Height, Flex Column 
                - bg-slate-50: Solid background ensures no transparency issues with underlying elements
                - rounded-3xl: Matches dashboard aesthetics
            */}
            <div className="h-full w-full flex flex-col bg-slate-50 rounded-3xl overflow-hidden relative">

                {/* Header Section: Fixed Height, Non-scrolling
                    - z-0: Lower z-index to avoid fighting with sticky dashboard nav (usually z-10 or z-20)
                    - pt-6 pb-6: Generous padding to visual separate from top panel
                */}
                <div className="flex-none px-8 py-6 bg-white border-b border-indigo-50 flex justify-between items-center shadow-sm relative">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Scheduled Sessions</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Manage events, workshops, and study groups</p>
                    </div>

                    {/* Primary Action Button 
                        - Adjusted 'top right' position visibility
                    */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Schedule New</span>
                    </button>
                </div>

                {/* Content Area: scrolling, flex-grow */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                        {sessions.map((session) => (
                            <div key={session.id} className="group bg-white rounded-2xl p-6 flex flex-col h-full min-h-[280px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1">

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-5">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${session.tags[0] === 'React' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        session.tags[0] === 'Interview' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                        {session.tags[0]}
                                    </span>
                                    <div className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {session.date}
                                    </div>
                                </div>

                                {/* Card Title */}
                                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                    {session.title}
                                </h3>

                                {/* Time Info */}
                                <div className="flex items-center text-sm text-slate-500 mb-4 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {session.time}
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                                    {session.description}
                                </p>

                                {/* Card Footer */}
                                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">
                                            {session.host.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">HOSTED BY</p>
                                            <p className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{session.host}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveSession(session)}
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 border border-indigo-100 hover:border-indigo-600"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* "Add New" Card - Interactive State */}
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 group h-full min-h-[280px]"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-indigo-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Schedule Session</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-[200px] group-hover:text-slate-600">Create a new study group or workshop event</p>
                        </div>
                    </div>
                </div>
            </div>

            <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSessionCreated={handleSessionCreated}
            />

            {/* Fullscreen Session */}
            {activeSession && (
                <FullscreenSession
                    roomId={`session-${activeSession.id}`}
                    sessionData={activeSession}
                    onExit={() => setActiveSession(null)}
                />
            )}
        </>
    );
};

export default ScheduledSessions;
