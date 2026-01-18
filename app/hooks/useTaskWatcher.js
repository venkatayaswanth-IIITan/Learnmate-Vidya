import { useEffect } from 'react';
import { logEvent } from '../utils/loggingService';
import { calculateMetrics } from '../utils/metricsService';

export const useTaskWatcher = (roadmapData, setRoadmapData, onComplete = null, checkInterval = 1000) => {

    useEffect(() => {
        if (!roadmapData || !roadmapData.roadmap) return;

        const interval = setInterval(() => {
            const currentTaskIdx = roadmapData.roadmap.findIndex(t => t.status !== 'completed');
            if (currentTaskIdx === -1) return;

            const currentTask = roadmapData.roadmap[currentTaskIdx];
            const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');

            // Filter logs since task assignment
            const recentLogs = logs.filter(l => l.timestamp > (currentTask.assignedAt || 0));

            const requirementsMet = checkTaskRequirements(currentTask, recentLogs);

            if (requirementsMet) {
                // Post-Completion Metric Analysis
                const currentMetrics = calculateMetrics(logs);
                const signal = evaluateGrowthSignal(currentTask.learningStateBefore?.metrics, currentMetrics);

                const completedTask = {
                    ...currentTask,
                    status: 'completed',
                    completedAt: Date.now(),
                    signal: signal, // success, fail, or neutral
                    metricsAfter: currentMetrics
                };

                const newRoadmap = {
                    ...roadmapData,
                    roadmap: roadmapData.roadmap.map((t, i) => i === currentTaskIdx ? completedTask : t)
                };

                setRoadmapData(newRoadmap);
                localStorage.setItem('student_roadmap', JSON.stringify(newRoadmap));
                if (onComplete) onComplete(newRoadmap);

                // Log to Firestore with deep insights
                logEvent("ROADMAP_TASK_AUTO_COMPLETED", {
                    mode: 'solo',
                    source: 'system_auto'
                }, {
                    taskId: currentTask.id || currentTaskIdx,
                    title: currentTask.title,
                    signal: signal,
                    improvementDetected: signal === 'success'
                });
            }
        }, checkInterval);

        return () => clearInterval(interval);
    }, [roadmapData, checkInterval]);

    const evaluateGrowthSignal = (oldMetrics, newMetrics) => {
        if (!oldMetrics || !newMetrics) return 'neutral';

        // Check for improvement in key engagement markers
        const engagementDiff = newMetrics.engagementScore - oldMetrics.engagementScore;
        const handsOnDiff = newMetrics.handsOnRate - oldMetrics.handsOnRate;

        if (engagementDiff > 0.05 || handsOnDiff > 0.1) return 'success';
        if (engagementDiff < -0.05) return 'fail';
        return 'neutral';
    };

    const checkTaskRequirements = (task, logs) => {
        const criteria = task.successCriteria;
        if (!criteria) return false;

        if (criteria.minDuration && logs.length > 0) {
            const span = (logs[logs.length - 1].timestamp - logs[0].timestamp) / (1000 * 60);
            if (span < criteria.minDuration) return false;
        }

        if (criteria.requiredEvents && criteria.requiredEvents.length > 0) {
            const logTypes = new Set(logs.map(l => l.eventType));
            const hasAllEvents = criteria.requiredEvents.every(e => logTypes.has(e));
            if (!hasAllEvents) return false;
        }

        if (criteria.minInteractions) {
            const interactionLogs = logs.filter(l =>
                ["CHAT_MESSAGE_SENT", "QUESTION_ASKED", "WHITEBOARD_USED"].includes(l.eventType)
            );
            if (interactionLogs.length < criteria.minInteractions) return false;
        }

        return true;
    };
};
