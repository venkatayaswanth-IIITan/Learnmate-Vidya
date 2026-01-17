import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDocs, deleteDoc, writeBatch, doc } from 'firebase/firestore';

// --- Constants & Enums ---

export const EVENT_TYPES = {
    // Session Events
    SESSION_JOINED: 'session_joined',
    SESSION_LEFT: 'session_left',

    // Communication
    CHAT_SENT: 'chat_sent',
    QUESTION_ASKED: 'question_asked',

    // Tools & Resources
    TOOL_USED: 'tool_used',
    RESOURCE_OPENED: 'resource_opened',
    ROADMAP_TASK_COMPLETED: 'roadmap_task_completed',

    // System/Platform
    CHATBOT_OPENED: 'chatbot_opened',
    BREAK_REMINDER: 'break_reminder',
    RESULT_SHOWN: 'result_shown'
};

export const CONTEXT_MODES = {
    GROUP: 'group',
    SOLO: 'solo'
};

export const CONTEXT_SOURCES = {
    LIVE_SESSION: 'live_session',
    ROADMAP: 'roadmap',
    SELF_STUDY: 'self_study',
    DASHBOARD: 'dashboard'
};

// --- Helper Functions ---

const generateEventId = () => {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const getCurrentUser = () => {
    return auth.currentUser || { uid: 'anonymous', isAnonymous: true };
};

// --- Core Logging Function ---

/**
 * Logs a user interaction event to Firestore.
 * @param {string} eventType - One of EVENT_TYPES
 * @param {object} context - { mode, source }
 * @param {object} metadata - Additional details { duration, tool, taskId, etc. }
 * @param {string|null} sessionId - Optional session ID
 */
export const logEvent = async (eventType, context = {}, metadata = {}, sessionId = null) => {
    try {
        const user = getCurrentUser();

        // Default context
        const finalContext = {
            mode: context.mode || CONTEXT_MODES.SOLO,
            source: context.source || CONTEXT_SOURCES.SELF_STUDY,
            ...context
        };

        const eventData = {
            eventId: generateEventId(),
            userId: user.uid,
            sessionId: sessionId || null,
            eventType: eventType,
            context: finalContext,
            metadata: metadata || {},
            timestamp: Date.now(),
            createdAt: serverTimestamp() // Firestore server timestamp
        };

        const eventsRef = collection(db, 'learning_events');
        await addDoc(eventsRef, eventData);

        console.log(`[LoggingService] Event logged to Firestore: ${eventType}`, eventData);

    } catch (error) {
        console.error("[LoggingService] Failed to log event:", error);
    }
};

// --- Exported Utilities ---

/**
 * Subscribes to learning events in real-time.
 * @param {function} callback - Function to call with array of events
 * @returns {function} - Unsubscribe function
 */
export const subscribeToEvents = (callback) => {
    const eventsRef = collection(db, 'learning_events');
    const q = query(eventsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Handle serverTimestamp which might be null immediately after write (latency compensation)
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });
        callback(events);
    }, (error) => {
        console.error("[LoggingService] Error subscribing to events:", error);
        callback([]);
    });
};

/**
 * Permanently deletes all learning events from Firestore.
 */
export const clearEvents = async () => {
    try {
        const eventsRef = collection(db, 'learning_events');
        const snapshot = await getDocs(eventsRef);

        // Delete all documents in parallel
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log("[LoggingService] All events cleared from Firestore.");
    } catch (error) {
        console.error("[LoggingService] Failed to clear events:", error);
    }
};

/**
 * Batches write multiple events to Firestore.
 * @param {Array} events - Array of event objects
 */
export const batchWriteLogs = async (events) => {
    try {
        const batch = writeBatch(db);
        const eventsRef = collection(db, 'learning_events');

        events.forEach(event => {
            const docRef = doc(eventsRef); // Auto-ID
            batch.set(docRef, {
                ...event,
                createdAt: serverTimestamp()
            });
        });

        await batch.commit();
        console.log(`[LoggingService] Batch wrote ${events.length} events to Firestore.`);
    } catch (error) {
        console.error("[LoggingService] Failed to batch write events:", error);
        throw error;
    }
};

/**
 * Fetches all learning events once.
 * @returns {Promise<Array>}
 */
export const fetchLogs = async () => {
    try {
        const eventsRef = collection(db, 'learning_events');
        const q = query(eventsRef, orderBy('timestamp', 'asc')); // Oldest first for replay/analysis
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
        }));
    } catch (error) {
        console.error("[LoggingService] Failed to fetch events:", error);
        return [];
    }
};

export const exportEventsAsJson = (events) => {
    // If events not passed, try to use what we have or empty
    const safetyEvents = events || [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(safetyEvents, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "learning_events_" + new Date().toISOString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
