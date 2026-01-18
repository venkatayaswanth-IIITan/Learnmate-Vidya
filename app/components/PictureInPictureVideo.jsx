'use client';

import { useRef, useState, useEffect } from 'react';
import { getPipSize, getPipConstraints, constrainPipPosition } from '../utils/sessionUtils';

export default function PictureInPictureVideo({
    stream,
    participantName = 'You',
    initialPosition = { x: null, y: null },
    initialSize = 'small',
    onPositionChange,
    onSizeChange,
    isMuted = false,
    isVideoOff = false,
}) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState(initialSize);
    const [isMinimized, setIsMinimized] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Set video stream
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Initialize position to top-right if not specified
    useEffect(() => {
        if (position.x === null || position.y === null) {
            const { width, height } = getPipSize(size);
            const newPosition = {
                x: window.innerWidth - width - 24,
                y: 24,
            };
            setPosition(newPosition);
            onPositionChange?.(newPosition);
        }
    }, []);

    // Handle drag start
    const handleMouseDown = (e) => {
        if (e.target.closest('.pip-controls')) return; // Don't drag when clicking controls

        setIsDragging(true);
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Handle dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const { width, height } = getPipSize(size);
            const constraints = getPipConstraints(
                window.innerWidth,
                window.innerHeight,
                width,
                height
            );

            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            const constrainedPosition = constrainPipPosition(newX, newY, constraints);
            setPosition(constrainedPosition);
            onPositionChange?.(constrainedPosition);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, size, onPositionChange]);

    // Handle size change
    const cycleSize = () => {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];

        setSize(nextSize);
        onSizeChange?.(nextSize);

        // Adjust position to keep within bounds
        const { width, height } = getPipSize(nextSize);
        const constraints = getPipConstraints(
            window.innerWidth,
            window.innerHeight,
            width,
            height
        );
        const constrainedPosition = constrainPipPosition(position.x, position.y, constraints);
        setPosition(constrainedPosition);
        onPositionChange?.(constrainedPosition);
    };

    // Toggle minimize
    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const { width, height } = getPipSize(size);
    const minimizedHeight = 48;

    return (
        <div
            ref={containerRef}
            className={`fixed z-50 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
                } ${isMinimized ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-black'}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${width}px`,
                height: isMinimized ? `${minimizedHeight}px` : `${height}px`,
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Video */}
            {!isMinimized && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            )}

            {/* Video off overlay */}
            {!isMinimized && isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl font-bold">
                        {participantName.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-medium truncate">
                        {participantName}
                        {isMuted && ' 🔇'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="pip-controls absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                {/* Minimize/Maximize button */}
                <button
                    onClick={toggleMinimize}
                    className="w-6 h-6 rounded-full bg-gray-900/80 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
                    title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMinimized ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        )}
                    </svg>
                </button>

                {/* Resize button */}
                {!isMinimized && (
                    <button
                        onClick={cycleSize}
                        className="w-6 h-6 rounded-full bg-gray-900/80 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
                        title="Resize"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Minimized state indicator */}
            {isMinimized && (
                <div className="flex items-center justify-between px-3 h-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                            {participantName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium">{participantName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isMuted && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isVideoOff && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Drag indicator */}
            {isDragging && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none" />
            )}
        </div>
    );
}
