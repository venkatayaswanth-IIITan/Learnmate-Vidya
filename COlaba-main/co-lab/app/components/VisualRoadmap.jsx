import React from 'react';
import { logEvent, EVENT_TYPES, CONTEXT_MODES, CONTEXT_SOURCES } from '../utils/loggingService';

const VisualRoadmap = ({ roadmapData, toggleTask, onReset }) => {
    if (!roadmapData || !roadmapData.roadmap) {
        return (
            <div className="text-center py-16 px-4 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9.5 3.5" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-slate-500 mb-1">No Active Roadmap</p>
                    <p className="text-sm">Visit the Roadmap page and run a SWOT analysis to get started.</p>
                </div>
                <a href="/roadmap" className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    Go to Roadmap
                </a>
            </div>
        );
    }

    return (
        <div className="relative pl-4 pr-2 py-6">
            {/* Roadmap Items */}
            <div className="space-y-12">
                {roadmapData.roadmap.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isLast = index === roadmapData.roadmap.length - 1;
                    const isNext = !isCompleted && (index === 0 || roadmapData.roadmap[index - 1].status === 'completed');

                    return (
                        <div key={index} className="relative flex items-start gap-6">

                            {/* Connecting Line (drawn BEHIND nodes) */}
                            {!isLast && (
                                <div
                                    className={`absolute left-[19px] top-10 w-1 h-[calc(100%+2rem)] -z-10 transition-colors duration-500 ${isCompleted ? 'bg-gradient-to-b from-green-500 to-green-300' : 'bg-slate-100'
                                        }`}
                                />
                            )}

                            {/* Visual Node */}
                            <div className="flex-shrink-0 relative">
                                <button
                                    onClick={() => {
                                        toggleTask(index);
                                        if (!isCompleted) {
                                            logEvent(EVENT_TYPES.ROADMAP_TASK_COMPLETED, {
                                                mode: CONTEXT_MODES.SOLO,
                                                source: CONTEXT_SOURCES.ROADMAP
                                            }, {
                                                taskId: index,
                                                taskTitle: step.title
                                            });
                                        }
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform hover:scale-110 z-10 bg-white ${isCompleted
                                        ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                        : isNext
                                            ? 'border-indigo-500 text-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                            : 'border-slate-200 text-slate-300'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span className="font-bold text-sm">{index + 1}</span>
                                    )}
                                </button>
                            </div>

                            {/* Content Card */}
                            <div
                                className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${isCompleted
                                    ? 'bg-green-50/50 border-green-200 hover:shadow-md'
                                    : isNext
                                        ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50 transform scale-[1.01]'
                                        : 'bg-slate-50 border-transparent opacity-80 hover:opacity-100'
                                    }`}
                                onClick={() => {
                                    toggleTask(index);
                                    if (!isCompleted) {
                                        logEvent(EVENT_TYPES.ROADMAP_TASK_COMPLETED, {
                                            mode: CONTEXT_MODES.SOLO,
                                            source: CONTEXT_SOURCES.ROADMAP
                                        }, {
                                            taskId: index,
                                            taskTitle: step.title
                                        });
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-green-600' : isNext ? 'text-indigo-500' : 'text-slate-400'
                                                }`}>
                                                {isCompleted ? 'Completed' : isNext ? 'Current Goal' : 'Upcoming'}
                                            </span>
                                            {step.reason && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const el = document.getElementById(`reason-${index}`);
                                                        if (el) el.classList.toggle('hidden');
                                                    }}
                                                    className="px-2 py-0.5 text-[10px] font-black bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-md hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                                >
                                                    Why?
                                                </button>
                                            )}
                                        </div>
                                        <h4 className={`font-bold text-lg ${isCompleted ? 'text-green-800' : 'text-slate-800'}`}>
                                            {step.title}
                                        </h4>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${isCompleted
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {step.duration}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                                    {step.description}
                                </p>

                                {/* Reason Reveal */}
                                <div id={`reason-${index}`} className="hidden mt-3 p-3 bg-indigo-50/50 dark:bg-slate-900/50 border-l-2 border-indigo-400 rounded-r-lg animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-[11px] font-medium text-indigo-800 dark:text-indigo-300 italic">
                                        &ldquo;{step.reason}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {onReset && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onReset}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Reset Custom Roadmap
                    </button>
                </div>
            )}
        </div>
    );
};

export default VisualRoadmap;
