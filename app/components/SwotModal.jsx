import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, TrendingUp, AlertCircle, Lightbulb, ShieldAlert } from 'lucide-react';
import { generatePersonalizedRoadmap } from '../utils/aiRoadmapEngine';
import VisualRoadmap from './VisualRoadmap';
import { deriveLearningState, deriveDecisionLayer, deriveActionLayer } from '../utils/metricsService';
import { Target, Zap, Heart, MessageSquare, Users, MoveRight, ChevronRight, Bell, Clock, Rocket } from 'lucide-react';

const SwotModal = ({ isOpen, onClose, swotData, isLoading }) => {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [view, setView] = useState('swot'); // 'swot' | 'roadmap'
    const [roadmapData, setRoadmapData] = useState(null);
    const [expandedWhy, setExpandedWhy] = useState(null); // String like 's-0', 'w-1' etc
    const [showLearningState, setShowLearningState] = useState(false);
    const [showDecisionLayer, setShowDecisionLayer] = useState(false);
    const [showActionLayer, setShowActionLayer] = useState(false);
    const [actionsData, setActionsData] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [genProgress, setGenProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState("Initializing analysis...");
    const [internalLoading, setInternalLoading] = useState(false);

    // Reset view when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            // Optional: reset to swot when closed?
            // setView('swot'); 
            setShowLearningState(false);
            setShowDecisionLayer(false);
            setShowActionLayer(false);
            setActionsData([]);
            setLoadingProgress(0);
            setLoadingStep("Initializing analysis...");
            setInternalLoading(false);
        }
    }, [isOpen]);

    // Sync internal loading with prop initiation
    React.useEffect(() => {
        if (isLoading && isOpen) {
            setInternalLoading(true);
        }
    }, [isLoading, isOpen]);

    // Simulated Loading Progress Effect
    React.useEffect(() => {
        if (internalLoading && isOpen) {
            const steps = [
                { msg: "Scanning recent activity logs...", threshold: 20 },
                { msg: "Calculating learning performance metrics...", threshold: 40 },
                { msg: "Distilling patterns into strategic insights...", threshold: 60 },
                { msg: "Synthesizing SWOT analysis profiles...", threshold: 80 },
                { msg: "Preparing your personalized results...", threshold: 100 }
            ];

            let count = 0;
            const interval = setInterval(() => {
                // Smoother, slightly faster increments
                const increment = Math.random() * 1.5 + 0.8;
                count += increment;

                if (count >= 100) {
                    count = 100;
                    clearInterval(interval);
                    // Shorter pause at 100%
                    setTimeout(() => setInternalLoading(false), 500);
                }

                setLoadingProgress(Math.floor(count));

                const currentStep = steps.find(s => count < s.threshold) || steps[steps.length - 1];
                setLoadingStep(currentStep.msg);
            }, 60);

            return () => clearInterval(interval);
        }
    }, [internalLoading, isOpen]);

    const handleGenerateRoadmap = async () => {
        setIsGenerating(true);
        setGenProgress(0);
        setLoadingStep("Mapping unique learning state...");

        try {
            const steps = [
                { msg: "Finding your learning style...", threshold: 20 },
                { msg: "Planning your study strategy...", threshold: 40 },
                { msg: "Picking the best tools for you...", threshold: 60 },
                { msg: "Creating helpful reminders...", threshold: 80 },
                { msg: "Building your final roadmap...", threshold: 100 }
            ];

            let count = 0;
            const progressPromise = new Promise((resolve) => {
                const interval = setInterval(() => {
                    // Slower, smoother increments for readability
                    count += Math.random() * 0.8 + 0.3;
                    if (count >= 100) {
                        count = 100;
                        clearInterval(interval);
                        resolve();
                    }
                    setGenProgress(Math.floor(count));
                    const currentStep = steps.find(s => count < s.threshold) || steps[steps.length - 1];
                    setLoadingStep(currentStep.msg);
                }, 80);
            });

            // Simultaneously run the logic in the background
            const lState = deriveLearningState(swotData.metrics);
            const dLayer = deriveDecisionLayer(lState);
            const history = JSON.parse(localStorage.getItem('action_history') || '[]');
            const actions = deriveActionLayer(dLayer, history);

            // Update history
            const newHistory = [...new Set([...history, ...actions.map(a => a.id)])].slice(-20);
            localStorage.setItem('action_history', JSON.stringify(newHistory));

            // Create roadmap data from derived actions
            let data = {
                roadmap: actions.map(action => ({
                    title: action.type === 'nudge' ? "Strategic Nudge" : action.label,
                    description: action.type === 'nudge' ? action.message : `Strategic Activity: ${action.variant.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                    duration: action.type === 'nudge' ? "Action Nudge" : `${action.duration} mins`,
                    status: 'pending',
                    reason: action.reason || "This task is selected based on your recent learning patterns to optimize your progress.",
                    intent: action.intent || "Growth Objective", // Added intent
                    learningStateBefore: {
                        ...lState,
                        metrics: swotData.metrics // Preserve raw metrics for growth comparison
                    },
                    successCriteria: action.successCriteria || { minDuration: 10 },
                    assignedAt: Date.now()
                }))
            };

            // If actions failed for some reason, fallback to AI roadmap
            if (!data.roadmap || data.roadmap.length === 0) {
                data = await generatePersonalizedRoadmap(swotData);
            }

            // Defensive check
            if (!data || !data.roadmap) {
                data = { roadmap: data?.steps || data || [] };
                if (!Array.isArray(data.roadmap)) data.roadmap = [];
            }

            // Wait for the progress bar to finish for professional feel
            await progressPromise;
            await new Promise(r => setTimeout(r, 600)); // Final pause

            setRoadmapData(data);

            if (typeof window !== 'undefined') {
                localStorage.setItem('student_roadmap', JSON.stringify(data));
            }

            router.push('/roadmap/view');
        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            alert("Failed to generate roadmap. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleMapTask = (index) => {
        if (!roadmapData) return;
        const newRoadmap = { ...roadmapData };
        const currentStatus = newRoadmap.roadmap[index].status;
        newRoadmap.roadmap[index].status = currentStatus === 'completed' ? 'pending' : 'completed';

        setRoadmapData(newRoadmap);
        if (typeof window !== 'undefined') {
            localStorage.setItem('student_roadmap', JSON.stringify(newRoadmap));
        }
    };

    const calculateProgress = () => {
        if (!roadmapData || !roadmapData.roadmap || roadmapData.roadmap.length === 0) return 0;
        const completed = roadmapData.roadmap.filter(t => t.status === 'completed').length;
        return Math.round((completed / roadmapData.roadmap.length) * 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {view === 'roadmap' ? 'Your Learned Path 🚀' : 'Personalized SWOT Analysis'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {view === 'roadmap' ? 'A custom roadmap based on your unique profile' : 'AI-Powered Insights for Your Growth'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {internalLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in duration-500">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 border-8 border-indigo-100 dark:border-indigo-900/20 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-8 border-indigo-600 rounded-full transition-all duration-300 border-t-transparent shadow-lg"
                                    style={{ transform: `rotate(${loadingProgress * 3.6}deg)` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-indigo-600">{loadingProgress}%</span>
                                </div>
                            </div>

                            <div className="w-full max-w-sm space-y-4 text-center">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                                                AI Analysis Sync
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100 dark:bg-slate-700">
                                        <div
                                            style={{ width: `${loadingProgress}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500 ease-out"
                                        ></div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 animate-pulse capitalize">
                                    {loadingStep}
                                </h3>
                                <p className="text-slate-500 dark:text-gray-400 text-xs">
                                    Please wait while Vidya-AI reconstructs your learning graph...
                                </p>
                            </div>
                        </div>
                    ) : (isGenerating) ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in duration-500">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 border-8 border-indigo-100 dark:border-indigo-900/20 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-8 border-indigo-600 rounded-full transition-all duration-300 border-t-transparent shadow-lg"
                                    style={{ transform: `rotate(${genProgress * 3.6}deg)` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-indigo-600">{genProgress}%</span>
                                </div>
                            </div>

                            <div className="w-full max-w-sm space-y-4 text-center">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                                                Roadmap Engineering
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100 dark:bg-slate-700">
                                        <div
                                            style={{ width: `${genProgress}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500 ease-out"
                                        ></div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 animate-pulse capitalize">
                                    {loadingStep}
                                </h3>
                                <p className="text-slate-500 dark:text-gray-400 text-xs">
                                    Reconfiguring your learning trajectory...
                                </p>
                            </div>
                        </div>
                    ) : swotData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Strengths */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-xl text-green-600 dark:text-green-400">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Strengths</h3>
                                </div>
                                <ul className="space-y-4">
                                    {swotData.swot.strengths.length > 0 ? (
                                        swotData.swot.strengths.map((item, idx) => (
                                            <li key={idx} className="flex flex-col gap-1">
                                                <div className="flex items-start gap-3 text-green-700 dark:text-green-200/90">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                    <span className="flex-grow">{item.insight || item}</span>
                                                    {item.explanation && (
                                                        <button
                                                            onClick={() => setExpandedWhy(prev => prev === `s-${idx}` ? null : `s-${idx}`)}
                                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-300 transition-colors"
                                                        >
                                                            Why?
                                                        </button>
                                                    )}
                                                </div>
                                                {expandedWhy === `s-${idx}` && (
                                                    <div className="ml-5 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-green-600 dark:text-green-400 border-l-2 border-green-400 italic">
                                                        {item.explanation}
                                                    </div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-green-600 italic">Keep working to build your strengths!</p>
                                    )}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-xl text-orange-600 dark:text-orange-400">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">Weaknesses</h3>
                                </div>
                                <ul className="space-y-4">
                                    {swotData.swot.weaknesses.length > 0 ? (
                                        swotData.swot.weaknesses.map((item, idx) => (
                                            <li key={idx} className="flex flex-col gap-1">
                                                <div className="flex items-start gap-3 text-orange-700 dark:text-orange-200/90">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                    <span className="flex-grow">{item.insight || item}</span>
                                                    {item.explanation && (
                                                        <button
                                                            onClick={() => setExpandedWhy(prev => prev === `w-${idx}` ? null : `w-${idx}`)}
                                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 transition-colors"
                                                        >
                                                            Why?
                                                        </button>
                                                    )}
                                                </div>
                                                {expandedWhy === `w-${idx}` && (
                                                    <div className="ml-5 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-orange-600 dark:text-orange-400 border-l-2 border-orange-400 italic">
                                                        {item.explanation}
                                                    </div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-orange-600 italic">Great job! No major weaknesses detected.</p>
                                    )}
                                </ul>
                            </div>

                            {/* Opportunities */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Lightbulb size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Opportunities</h3>
                                </div>
                                <ul className="space-y-4">
                                    {swotData.swot.opportunities.length > 0 ? (
                                        swotData.swot.opportunities.map((item, idx) => (
                                            <li key={idx} className="flex flex-col gap-1">
                                                <div className="flex items-start gap-3 text-blue-700 dark:text-blue-200/90">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="flex-grow">{item.insight || item}</span>
                                                    {item.explanation && (
                                                        <button
                                                            onClick={() => setExpandedWhy(prev => prev === `o-${idx}` ? null : `o-${idx}`)}
                                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 transition-colors"
                                                        >
                                                            Why?
                                                        </button>
                                                    )}
                                                </div>
                                                {expandedWhy === `o-${idx}` && (
                                                    <div className="ml-5 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-blue-600 dark:text-blue-400 border-l-2 border-blue-400 italic">
                                                        {item.explanation}
                                                    </div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-blue-600 italic">You're capitalizing on your opportunities well!</p>
                                    )}
                                </ul>
                            </div>

                            {/* Threats */}
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-xl text-red-600 dark:text-red-400">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Threats</h3>
                                </div>
                                <ul className="space-y-4">
                                    {swotData.swot.threats.length > 0 ? (
                                        swotData.swot.threats.map((item, idx) => (
                                            <li key={idx} className="flex flex-col gap-1">
                                                <div className="flex items-start gap-3 text-red-700 dark:text-red-200/90">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                                    <span className="flex-grow">{item.insight || item}</span>
                                                    {item.explanation && (
                                                        <button
                                                            onClick={() => setExpandedWhy(prev => prev === `t-${idx}` ? null : `t-${idx}`)}
                                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 hover:bg-red-300 transition-colors"
                                                        >
                                                            Why?
                                                        </button>
                                                    )}
                                                </div>
                                                {expandedWhy === `t-${idx}` && (
                                                    <div className="ml-5 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-red-600 dark:text-red-400 border-l-2 border-red-400 italic">
                                                        {item.explanation}
                                                    </div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-red-600 italic">No immediate threats detected. Keep it up!</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Something went wrong. Please try again.
                        </div>
                    )}

                </div>

                {/* Footer with Main Action */}
                <div className="px-8 pb-8 pt-2 bg-white dark:bg-slate-800 rounded-b-3xl">
                    {view === 'swot' && !isGenerating && (
                        <button
                            className={`w-full py-4 text-center rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]`}
                            onClick={handleGenerateRoadmap}
                            disabled={isGenerating}
                        >
                            Generate Personalized Roadmap 🎉
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SwotModal;
