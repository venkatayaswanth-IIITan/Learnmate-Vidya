'use client';

import { useState } from 'react';

export default function SessionControlBar({
    isMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    onToggleMute,
    onToggleVideo,
    onShareScreen,
    onShareWhiteboard,
    onShareNotes,
    onToggleRecording,
    onToggleParticipants,
    onToggleChat,
    onLeaveSession,
    onToggleFullscreen,
    participantCount = 0,
}) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
            onMouseEnter={() => setIsVisible(true)}
        >
            {/* Glassmorphism control bar */}
            <div className="mx-auto max-w-4xl mb-6 px-4">
                <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left controls */}
                        <div className="flex items-center gap-2">
                            {/* Microphone */}
                            <button
                                onClick={onToggleMute}
                                className={`p-3 rounded-xl transition-all ${isMuted
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    {isMuted ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                                            clipRule="evenodd"
                                        />
                                    ) : (
                                        <path
                                            fillRule="evenodd"
                                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                                            clipRule="evenodd"
                                        />
                                    )}
                                </svg>
                            </button>

                            {/* Camera */}
                            <button
                                onClick={onToggleVideo}
                                className={`p-3 rounded-xl transition-all ${isVideoOff
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                title={isVideoOff ? 'Turn Video On (V)' : 'Turn Video Off (V)'}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    {isVideoOff ? (
                                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                                    ) : (
                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Center controls */}
                        <div className="flex items-center gap-2">
                            {/* Share menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className={`p-3 rounded-xl transition-all ${isScreenSharing
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                        }`}
                                    title="Share (S)"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                </button>

                                {/* Share dropdown menu */}
                                {showShareMenu && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                onShareWhiteboard();
                                                setShowShareMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            <span className="text-sm font-medium">Whiteboard</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onShareScreen();
                                                setShowShareMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium">Screen</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onShareNotes();
                                                setShowShareMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium">Notes</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Recording */}
                            <button
                                onClick={onToggleRecording}
                                className={`p-3 rounded-xl transition-all ${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                title={isRecording ? 'Stop Recording' : 'Start Recording'}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <circle cx="10" cy="10" r="6" />
                                </svg>
                            </button>

                            {/* Participants */}
                            <button
                                onClick={onToggleParticipants}
                                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all relative"
                                title="Participants"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                {participantCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {participantCount}
                                    </span>
                                )}
                            </button>

                            {/* Chat */}
                            <button
                                onClick={onToggleChat}
                                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all"
                                title="Chat"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-2">
                            {/* Fullscreen */}
                            <button
                                onClick={onToggleFullscreen}
                                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all"
                                title="Toggle Fullscreen (F)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
                                </svg>
                            </button>

                            {/* Leave session */}
                            <button
                                onClick={onLeaveSession}
                                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all font-medium text-sm"
                                title="Leave Session"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show/hide indicator */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-t-lg text-white text-xs hover:bg-gray-800 transition-colors"
            >
                {isVisible ? '▼' : '▲'}
            </button>
        </div>
    );
}
