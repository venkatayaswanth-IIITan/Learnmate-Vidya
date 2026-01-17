'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/sidebar';
import { subscribeToEvents, clearEvents, exportEventsAsJson, EVENT_TYPES, CONTEXT_SOURCES } from '../utils/loggingService';

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [filterSource, setFilterSource] = useState('all');

    useEffect(() => {
        const unsubscribe = subscribeToEvents((newLogs) => {
            setLogs(newLogs);
        });

        return () => unsubscribe();
    }, []);

    const filteredLogs = logs.filter(log => {
        const typeMatch = filterType === 'all' || log.eventType === filterType;
        const sourceMatch = filterSource === 'all' || log.context?.source === filterSource;
        return typeMatch && sourceMatch;
    });

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <DashboardLayout activeItem="logs">
            <div className="p-6 h-screen overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Activity Logs</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to PERMANENTLY delete all logs from the database?')) {
                                    clearEvents();
                                }
                            }}
                            className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg flex items-center gap-2 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            DELETE ALL LOGS
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Event Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Types</option>
                            {Object.values(EVENT_TYPES).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Context Source</label>
                        <select
                            value={filterSource}
                            onChange={(e) => setFilterSource(e.target.value)}
                            className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Sources</option>
                            {Object.values(CONTEXT_SOURCES).map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-lg shadow flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">Time</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">Event Type</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">Source</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">Mode</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">Details (Metadata)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-semibold text-lg">
                                            No logs found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, index) => (
                                        <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800 text-xs whitespace-nowrap">
                                                {formatTime(log.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${!log.eventType ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                        log.eventType.includes('session') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                            log.eventType.includes('chat') ? 'bg-green-100 text-green-800 border-green-300' :
                                                                log.eventType.includes('tool') ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                                    'bg-gray-100 text-gray-800 border-gray-300'
                                                    }`}>
                                                    {(log.eventType || 'Unknown').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-700">{log.context?.source}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-700 capitalize">{log.context?.mode}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600 font-medium">
                                                {log.metadata ? (
                                                    <div className="max-w-md overflow-hidden text-ellipsis">
                                                        {Object.entries(log.metadata).map(([key, value]) => (
                                                            <span key={key} className="mr-3">
                                                                <strong className="text-gray-800">{key}:</strong> {String(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                        <span>Showing {filteredLogs.length} events</span>
                        <span>Firestore Sync Active • Real-time Updates</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
