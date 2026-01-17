
import { EVENT_TYPES, CONTEXT_MODES } from './loggingService';

// --- Dummy Data Generator ---

const SAMPLE_SESSION_IDS = ['sess_1', 'sess_2', 'sess_3', 'sess_4', 'sess_5'];
const USERS = ['user_1'];

export const createDummyLogData = () => {
    const events = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const batchId = Date.now().toString(36); // Unique batch ID

    // Create 10 sessions over last 14 days
    for (let i = 0; i < 10; i++) {
        const sessionId = `sess_${batchId}_${i}`;
        const dayOffset = Math.floor(Math.random() * 14);
        const startTime = now - (dayOffset * oneDay); // Random time in last 14 days

        // Session Start
        events.push({
            eventId: `evt_${i}_start`,
            eventType: 'SESSION_JOINED', // Keeping internal types for structure, but will map for user logic
            timestamp: startTime,
            sessionId,
            context: { mode: Math.random() > 0.3 ? 'solo' : 'group' }, // 30% group
        });

        // Duration: 15 to 60 minutes
        const durationMins = 15 + Math.floor(Math.random() * 45);

        // Generate interactions with "Decay" timestamp distribution (more early, less late)
        // or just random but plentiful. Let's do random but ensure validity.
        const interactionCount = 5 + Math.floor(Math.random() * 25); // 5-30 interactions to ensure graph bars
        let hasChat = false;
        let hasQuestion = false;
        let hasWhiteboard = false;

        for (let j = 0; j < interactionCount; j++) {
            // Weighted Random for timestamp: biased towards first half
            // Math.random()^2 pushes values towards 0
            let timeWeight = Math.random();
            if (Math.random() > 0.3) timeWeight = timeWeight * timeWeight; // 70% chance of being earlier

            const offset = Math.floor(timeWeight * durationMins * 60 * 1000);
            const typeRoll = Math.random();
            let type;

            if (typeRoll < 0.4) {
                type = "CHAT_MESSAGE_SENT";
                hasChat = true;
            } else if (typeRoll < 0.6) {
                type = "QUESTION_ASKED";
                hasQuestion = true;
            } else if (typeRoll < 0.7) {
                type = "WHITEBOARD_USED";
                hasWhiteboard = true;
            } else if (typeRoll < 0.8) {
                type = "CHATBOT_OPENED";
            } else {
                type = "RESOURCE_OPENED";
            }

            events.push({
                eventId: `evt_${i}_${j}`,
                eventType: type,
                timestamp: startTime + offset,
                sessionId,
                context: { mode: Math.random() > 0.3 ? 'solo' : 'group' },
            });
        }

        // Session End
        events.push({
            eventId: `evt_${i}_end`,
            eventType: 'SESSION_LEFT',
            timestamp: startTime + (durationMins * 60 * 1000),
            sessionId,
            context: { mode: 'solo' }
        });
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
};

// --- Model Data Generators (for initial view) ---

export const generateModelGraphData = (totalInteractions = 44) => {
    // A standard decay curve: f(x) = a * e^(-bx)
    // We'll normalize this into 10 buckets
    const graph = Array(10).fill(0);
    const decayFactor = 0.25; // Higher = faster decay

    let sum = 0;
    const weights = Array(10).fill(0).map((_, i) => {
        const w = Math.exp(-decayFactor * i);
        sum += w;
        return w;
    });

    // Distribute totalInteractions based on weights
    weights.forEach((w, i) => {
        graph[i] = Math.round((w / sum) * totalInteractions);
    });

    return graph;
};

export const getInitialModelMetrics = (profile) => {
    const totalSessions = profile.sessionsJoined || 14;
    const interactionValues = Object.values(profile.resourcesUsed);
    const totalInteractions = interactionValues.reduce((a, b) => a + b, 0);
    const avgDuration = 45; // benchmark
    const interactRate = totalInteractions / (totalSessions * avgDuration);

    return {
        summary: {
            totalSessions,
            activityMap: {} // Heartbeat already has initial state
        },
        metrics: {
            engagement: {
                "Avg Duration": `${avgDuration} min`,
                "Interact Rate": `${interactRate.toFixed(2)} /min`,
                "Decay Point": `18.5 min`
            },
            consistency: {
                "Active Days": `4 days`,
                "Longest Gap": `2.4 days`
            },
            collaboration: {
                "Collab Ratio": `28%`
            },
            participation: {
                "Msgs/Session": `1.5`,
                "Silent Ratio": `15%`
            },
            engagementMode: {
                "Hands-on Rate": `35%`
            },
            helpSeeking: {
                "Help Actions": `0.4 /sess`
            },
            rhythm: {
                "Frequency": `0.7 /day`,
                "Clustering": `42%`
            },
            execution: {
                "Completion": `85%`,
                "Abandonment": `10%`
            }
        },
        graphData: generateModelGraphData(totalInteractions)
    };
};

// --- Metrics Calculation ---

export const calculateMetrics = (events) => {
    if (!events || events.length === 0) return null;

    // 1. Sessionization
    const sessions = {};
    events.forEach(e => {
        if (!e.sessionId) return;
        if (!sessions[e.sessionId]) {
            sessions[e.sessionId] = {
                id: e.sessionId,
                startTime: e.timestamp,
                endTime: e.timestamp,
                events: [],
                mode: e.context?.mode || 'solo'
            };
        }
        sessions[e.sessionId].events.push(e);
        sessions[e.sessionId].startTime = Math.min(sessions[e.sessionId].startTime, e.timestamp);
        sessions[e.sessionId].endTime = Math.max(sessions[e.sessionId].endTime, e.timestamp);
    });

    // 2. Filter & Refine Sessions
    const filteredSessions = Object.values(sessions)
        .map(s => {
            const duration = (s.endTime - s.startTime) / (1000 * 60); // minutes
            return { ...s, duration: Math.max(duration, 0.5) };
        })
        .filter(s => s.duration > 1 && s.duration < 480); // 1min to 8hrs only

    const totalSessions = filteredSessions.length;
    if (totalSessions === 0) {
        return {
            summary: { totalSessions: 0, activityMap: {} },
            metrics: {
                engagementScore: 0,
                handsOnRate: 0,
                consistencyScore: 0
            },
            graphData: Array(10).fill(0)
        };
    }

    // 3. Derived Metrics (Using ONLY filtered data)
    const allFilteredEvents = filteredSessions.flatMap(s => s.events);
    const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
    const interactions = allFilteredEvents.filter(e =>
        ["CHAT_MESSAGE_SENT", "QUESTION_ASKED", "WHITEBOARD_USED", "CHATBOT_OPENED", "RESOURCE_OPENED"].includes(e.eventType)
    );

    const avgDuration = totalMinutes / totalSessions;
    const interactRate = interactions.length / totalMinutes;

    // Consistency
    const activeDaysSet = new Set(filteredSessions.map(s => new Date(s.startTime).toISOString().split('T')[0]));
    const sortedDays = Array.from(activeDaysSet).sort();
    let longestGap = 0;
    if (sortedDays.length > 1) {
        for (let i = 1; i < sortedDays.length; i++) {
            const gap = (new Date(sortedDays[i]) - new Date(sortedDays[i - 1])) / (1000 * 60 * 60 * 24);
            longestGap = Math.max(longestGap, gap);
        }
    }

    // Collaboration
    const groupSess = filteredSessions.filter(s => s.mode === 'group').length;
    const collabRatio = groupSess / totalSessions;

    // Participation
    const msgs = allFilteredEvents.filter(e => e.eventType === "CHAT_MESSAGE_SENT").length;
    const silentSess = filteredSessions.filter(s => !s.events.some(e => e.eventType === "CHAT_MESSAGE_SENT")).length;

    // Hands-on (Whiteboard/Chatbot)
    const handsOn = allFilteredEvents.filter(e => ["WHITEBOARD_USED", "CHATBOT_OPENED"].includes(e.eventType)).length;
    const handsOnRate = handsOn / (interactions.length || 1);

    // Help Seeking
    const help = allFilteredEvents.filter(e => e.eventType === "QUESTION_ASKED").length;

    // Rhythm (Clustering)
    let clusterCount = 0;
    const sortedSess = [...filteredSessions].sort((a, b) => a.startTime - b.startTime);
    for (let i = 1; i < sortedSess.length; i++) {
        const gap = (sortedSess[i].startTime - sortedSess[i - 1].endTime) / (1000 * 60);
        if (gap < 180) clusterCount++;
    }

    // Decay Point (Weighted avg of interaction times)
    let decaySum = 0;
    interactions.forEach(e => {
        const s = sessions[e.sessionId];
        if (s) decaySum += (e.timestamp - s.startTime) / (1000 * 60);
    });
    const decayPoint = interactions.length > 0 ? (decaySum / interactions.length) : (avgDuration * 0.5);

    // 4. Graph Logic
    const graph = Array(10).fill(0);
    filteredSessions.forEach(s => {
        const dur = s.endTime - s.startTime;
        if (dur <= 0) return;
        s.events.forEach(e => {
            let bucket = Math.floor(((e.timestamp - s.startTime) / dur) * 10);
            if (bucket >= 10) bucket = 9;
            if (bucket < 0) bucket = 0;
            graph[bucket]++;
        });
    });

    // 5. Activity Map
    const activityMap = {};
    filteredSessions.forEach(s => {
        const date = new Date(s.startTime).toISOString().split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + s.events.length;
    });

    return {
        summary: { totalSessions, activityMap },
        metrics: {
            engagement: {
                "Avg Duration": `${avgDuration.toFixed(1)} min`,
                "Interact Rate": `${interactRate.toFixed(2)} /min`,
                "Decay Point": `${decayPoint.toFixed(1)} min`
            },
            consistency: {
                "Active Days": `${activeDaysSet.size} days`,
                "Longest Gap": `${longestGap.toFixed(1)} days`
            },
            collaboration: {
                "Collab Ratio": `${(collabRatio * 100).toFixed(0)}%`
            },
            participation: {
                "Msgs/Session": `${(msgs / totalSessions).toFixed(1)}`,
                "Silent Ratio": `${((silentSess / totalSessions) * 100).toFixed(0)}%`
            },
            engagementMode: {
                "Hands-on Rate": `${(handsOnRate * 100).toFixed(0)}%`
            },
            helpSeeking: {
                "Help Actions": `${(help / totalSessions).toFixed(1)} /sess`
            },
            rhythm: {
                "Frequency": `${(totalSessions / 14).toFixed(1)} /day`,
                "Clustering": `${(clusterCount / (totalSessions - 1 || 1) * 100).toFixed(0)}%`
            },
            execution: {
                "Completion": `${((1 - (filteredSessions.filter(s => s.duration < 5).length / totalSessions)) * 100).toFixed(0)}%`,
                "Abandonment": `${((filteredSessions.filter(s => s.duration < 5).length / totalSessions) * 100).toFixed(0)}%`
            },
            // Raw scores for comparison logic
            engagementScore: Math.min(interactRate * 2, 1),
            handsOnRate: handsOnRate,
            consistencyScore: Math.min(totalSessions / 10, 1)
        },
        graphData: graph
    };
};

export const getSWOTAnalysis = (metrics) => {
    if (!metrics) return [];

    const insights = [];

    // Helper to parse numeric values from strings like "45.0 min" or "28%"
    const parse = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(val.toString().replace(/[^0-9.]/g, ''));
    };

    const m = metrics;

    // --- Engagement ---
    const avgDur = parse(m.engagement["Avg Duration"]);
    if (avgDur >= 40) {
        insights.push({
            category: "Engagement",
            type: "strength",
            reason: `Good endurance with ${avgDur}m average session time`,
            metricRefs: ["Avg Duration"]
        });
    } else if (avgDur < 20) {
        insights.push({
            category: "Engagement",
            type: "weakness",
            reason: "Short focus spans; sessions often under 20 mins",
            metricRefs: ["Avg Duration"]
        });
    }

    const decay = parse(m.engagement["Decay Point"]);
    if (decay < 20) {
        insights.push({
            category: "Engagement",
            type: "risk",
            reason: `Early attention drop noted around ${decay} minutes`,
            metricRefs: ["Decay Point"]
        });
    }

    const interact = parse(m.engagement["Interact Rate"]);
    if (interact < 0.1) {
        insights.push({
            category: "Engagement",
            type: "risk",
            reason: "Low active engagement during sessions",
            metricRefs: ["Interact Rate"]
        });
    }

    // --- Consistency ---
    const days = parse(m.consistency["Active Days"]);
    if (days < 5) {
        insights.push({
            category: "Consistency",
            type: "risk",
            reason: "Inconsistent learning habit (low active days)",
            metricRefs: ["Active Days"]
        });
    }

    const gap = parse(m.consistency["Longest Gap"]);
    if (gap > 2) {
        insights.push({
            category: "Consistency",
            type: "risk",
            reason: `Breaks learning flow with gaps over ${gap} days`,
            metricRefs: ["Longest Gap"]
        });
    }

    // --- Collaboration ---
    const collab = parse(m.collaboration["Collab Ratio"]);
    if (collab < 30) {
        insights.push({
            category: "Collaboration",
            type: "neutral",
            reason: "Prefers solo learning environment",
            metricRefs: ["Collab Ratio"]
        });
    }

    // --- Participation ---
    const silent = parse(m.participation["Silent Ratio"]);
    if (silent < 20) {
        insights.push({
            category: "Participation",
            type: "strength",
            reason: "Actively present and vocal in chat",
            metricRefs: ["Silent Ratio"]
        });
    }

    const msgs = parse(m.participation["Msgs/Session"]);
    if (msgs < 1) {
        insights.push({
            category: "Participation",
            type: "weakness",
            reason: "Selective participation in session discussions",
            metricRefs: ["Msgs/Session"]
        });
    }

    // --- Mode ---
    const handsOn = parse(m.engagementMode["Hands-on Rate"]);
    if (handsOn < 40) {
        insights.push({
            category: "Learning Mode",
            type: "weakness",
            reason: "Passive learning tendency (low tool usage)",
            metricRefs: ["Hands-on Rate"]
        });
    }

    // --- Help Seeking ---
    const help = parse(m.helpSeeking["Help Actions"]);
    if (help < 0.5) {
        insights.push({
            category: "Help Seeking",
            type: "opportunity",
            reason: "Hesitation in asking for help or using chatbot",
            metricRefs: ["Help Actions"]
        });
    }

    // --- Rhythm ---
    const clustering = parse(m.rhythm["Clustering"]);
    if (clustering > 40) {
        insights.push({
            category: "Rhythm",
            type: "neutral",
            reason: "Burst learning pattern (high session clustering)",
            metricRefs: ["Clustering"]
        });
    }

    const freq = parse(m.rhythm["Frequency"]);
    if (freq < 1) {
        insights.push({
            category: "Rhythm",
            type: "risk",
            reason: "Inconsistent rhythm; less than 1 session/day",
            metricRefs: ["Frequency"]
        });
    }

    // --- Execution ---
    const comp = parse(m.execution["Completion"]);
    if (comp > 80) {
        insights.push({
            category: "Execution",
            type: "strength",
            reason: "Strong follow-through on learning tasks",
            metricRefs: ["Completion"]
        });
    }

    const aban = parse(m.execution["Abandonment"]);
    if (aban < 15) {
        insights.push({
            category: "Execution",
            type: "strength",
            reason: "Low session drop-off rate",
            metricRefs: ["Abandonment"]
        });
    }

    return insights;
};

export const deriveLearningState = (metrics) => {
    if (!metrics) return null;

    const parse = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(val.toString().replace(/[^0-9.]/g, ''));
    };

    const m = metrics;

    // 1. Focus: based on Decay Point
    // if decayPoint < 20 → focus = "short_burst"
    // if decayPoint >= 30 → focus = "sustained"
    const decayPoint = parse(m.engagement["Decay Point"]);
    let focus = "balanced";
    if (decayPoint < 20) focus = "short_burst";
    else if (decayPoint >= 30) focus = "sustained";

    // 2. Consistency: based on Active Days
    // if activeDays < 5 → consistency = "irregular"
    // else → consistency = "consistent"
    const activeDays = parse(m.consistency["Active Days"]);
    const consistency = activeDays < 5 ? "irregular" : "consistent";

    // 3. Collaboration: based on Collab Ratio
    // if collaborationRatio < 30 → collaboration = "independent"
    // else → collaboration = "collaborative"
    const collaborationRatio = parse(m.collaboration["Collab Ratio"]);
    const collaboration = collaborationRatio < 30 ? "independent" : "collaborative";

    // 4. Engagement Mode: based on Hands-on Rate
    // if handsOnRate < 40 → engagementMode = "mostly_passive"
    // else → engagementMode = "hands_on"
    const handsOnRate = parse(m.engagementMode["Hands-on Rate"]);
    const engagementMode = handsOnRate < 40 ? "mostly_passive" : "hands_on";

    // 5. Help Seeking: based on Help Actions
    // if helpActions < 0.5 → helpSeeking = "low"
    // else → helpSeeking = "healthy"
    const helpActions = parse(m.helpSeeking["Help Actions"]);
    const helpSeeking = helpActions < 0.5 ? "low" : "healthy";

    // 6. Execution: based on Completion Rate
    // if completionRate > 80 → execution = "strong"
    // else → execution = "inconsistent"
    const completionRate = parse(m.execution["Completion"]);
    const execution = completionRate > 80 ? "strong" : "inconsistent";

    return {
        focus,
        consistency,
        collaboration,
        engagementMode,
        helpSeeking,
        execution
    };
};

export const deriveDecisionLayer = (learningState) => {
    if (!learningState) return null;

    const s = learningState;
    const decisions = {
        sessionDesign: "standard_blocks",
        learningPace: "adaptive",
        activityBias: "balanced",
        supportStyle: "proactive",
        collaborationPressure: "low"
    };

    // 1. Session Design
    if (s.focus === "short_burst") {
        decisions.sessionDesign = "shorter_blocks";
    } else if (s.focus === "sustained") {
        decisions.sessionDesign = "deep_dive_sessions";
    }

    // 2. Learning Pace
    if (s.consistency === "irregular") {
        decisions.learningPace = "flexible_catchup";
    } else {
        decisions.learningPace = "steady_acceleration";
    }

    // 3. Activity Bias
    if (s.engagementMode === "mostly_passive") {
        decisions.activityBias = "increase_hands_on";
    } else {
        decisions.activityBias = "maintain_active_tools";
    }

    // 4. Support Style
    if (s.helpSeeking === "low") {
        decisions.supportStyle = "gentle_nudges";
    } else {
        decisions.supportStyle = "collaborative_inquiry";
    }

    // 5. Collaboration Pressure
    if (s.collaboration === "independent") {
        decisions.collaborationPressure = "none";
    } else {
        decisions.collaborationPressure = "moderate";
    }

    return decisions;
};

export const deriveActionLayer = (decisions, history = []) => {
    if (!decisions) return [];

    const actionsPool = {
        sessionDesign: {
            shorter_blocks: [
                {
                    type: "nudge",
                    message: "Try the Pomodoro technique: 25m focus, 5m break.",
                    id: "n-pomodoro",
                    reason: "We've noticed your focus is strongest in shorter bursts. This helps prevent burnout.",
                    intent: "Focus Pacing",
                    successCriteria: { minDuration: 25, requiredEvents: [] }
                },
                {
                    type: "roadmap_task",
                    variant: "micro_burst",
                    duration: 15,
                    label: "Quick Syntax Drill",
                    id: "t-syntax-drill",
                    reason: "Short, targeted practice matches your current engagement rhythm.",
                    intent: "Engagement Velocity",
                    successCriteria: { minInteractions: 3, maxDuration: 20 }
                },
                {
                    type: "nudge",
                    message: "Use a timer to stay within your 20m focus window.",
                    id: "n-timer",
                    reason: "Keeping sessions tight ensures you stay energized throughout your study.",
                    intent: "Focus Boundary",
                    successCriteria: { maxSessionGap: 5 }
                }
            ],
            deep_dive_sessions: [
                {
                    type: "roadmap_task",
                    variant: "project_build",
                    duration: 60,
                    label: "Build a Mini-Feature",
                    id: "t-mini-feature",
                    reason: "Your metrics show high sustained focus, making you perfect for project-based deep dives.",
                    intent: "Deep Focus Mastery",
                    successCriteria: { minDuration: 45, requiredEvents: ["WHITEBOARD_USED"] }
                },
                {
                    type: "nudge",
                    message: "Eliminate all distractions for a 90-minute flow state.",
                    id: "n-flow",
                    reason: "You excel at long-form concentration; this nudge helps you hit that 'flow' faster.",
                    intent: "Extended Engagement",
                    successCriteria: { minDuration: 90, minInteractions: 10 }
                }
            ],
            standard_blocks: [
                {
                    type: "roadmap_task",
                    variant: "balanced_study",
                    duration: 30,
                    label: "Concept Review",
                    id: "t-concept-review",
                    reason: "A balanced pace fits your consistent learning pattern.",
                    intent: "Study Consistency",
                    successCriteria: { minDuration: 25, minInteractions: 5 }
                }
            ]
        },
        activityBias: {
            increase_hands_on: [
                {
                    type: "roadmap_task",
                    variant: "hands_on_practice",
                    duration: 20,
                    label: "Debug this Component",
                    id: "t-debug-comp",
                    reason: "Active debugging will help reinforce concepts where you've shown passive patterns.",
                    intent: "Practical Mastery",
                    successCriteria: { requiredEvents: ["WHITEBOARD_USED", "CHAT_MESSAGE_SENT"] }
                },
                {
                    type: "nudge",
                    message: "Don't just read—type along with the examples!",
                    id: "n-type-along",
                    reason: "Turning theory into practice will boost your retention based on your hands-on rate.",
                    intent: "Active Learning",
                    successCriteria: { minInteractions: 8 }
                },
                {
                    type: "roadmap_task",
                    variant: "whiteboard_challenge",
                    duration: 15,
                    label: "Logic Mapping",
                    id: "t-logic-map",
                    reason: "Visualizing logic helps bridge the gap between concept and execution.",
                    intent: "Conceptual Visualization",
                    successCriteria: { requiredEvents: ["WHITEBOARD_USED"] }
                }
            ],
            maintain_active_tools: [
                {
                    type: "nudge",
                    message: "Use the Whiteboard to sketch your next logic flow.",
                    id: "n-use-wb",
                    reason: "You've been using tools effectively; this keeps that positive momentum going.",
                    intent: "Tool Proficiency",
                    successCriteria: { requiredEvents: ["WHITEBOARD_USED"] }
                }
            ]
        },
        supportStyle: {
            gentle_nudges: [
                {
                    type: "nudge",
                    message: "It's okay to ask the AI if you're stuck for >5 mins.",
                    id: "n-ai-ask",
                    reason: "We noticed you sometimes struggle in silence; asking for help early keeps you moving.",
                    intent: "Help-Seeking Efficiency",
                    successCriteria: { requiredEvents: ["CHATBOT_OPENED"] }
                },
                {
                    type: "nudge",
                    message: "Small progress is still progress. Keep going!",
                    id: "n-small-progress",
                    reason: "Consistent small wins are key to your long-term success metrics.",
                    intent: "Persistence",
                    successCriteria: { minDuration: 15 }
                }
            ],
            collaborative_inquiry: [
                {
                    type: "nudge",
                    message: "Share your current snippet in the group for feedback.",
                    id: "n-group-share",
                    reason: "Your social style is collaborative; sharing will give you the boost you need.",
                    intent: "Social Engagement",
                    successCriteria: { requiredEvents: ["CHAT_MESSAGE_SENT"], minContextMode: "group" }
                }
            ]
        }
    };

    const selectedActions = [];
    const seenIds = new Set(history);

    // Pick one action from each available category in decisions
    Object.entries(decisions).forEach(([key, value]) => {
        if (actionsPool[key] && actionsPool[key][value]) {
            const possibleButtons = actionsPool[key][value];
            // Find first one not in history
            const freshAction = possibleButtons.find(a => !seenIds.has(a.id));
            if (freshAction) {
                selectedActions.push(freshAction);
            } else if (possibleButtons.length > 0) {
                // If all seen, pick the first one anyway (or could skip)
                selectedActions.push(possibleButtons[0]);
            }
        }
    });

    // Limit to 3 actions total to avoid overwhelm
    return selectedActions.slice(0, 3);
};
