'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, remove, onChildAdded, onChildRemoved, get } from 'firebase/database';
import SessionControlBar from './SessionControlBar';
import PictureInPictureVideo from './PictureInPictureVideo';
import WhiteboardShare from './WhiteboardShare';
import {
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreen,
    getOptimalLayout,
    formatDuration
} from '../utils/sessionUtils';

const RemoteVideo = ({ stream, participantName, isSpeaking }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${isSpeaking ? 'ring-4 ring-green-500' : ''}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                <span className="text-white text-sm font-medium">{participantName || 'Participant'}</span>
            </div>
        </div>
    );
};

export default function FullscreenSession({ roomId, sessionData, onExit }) {
    const { user } = useAuth();
    const containerRef = useRef(null);
    const localVideoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Session state
    const [participants, setParticipants] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const peerConnectionsRef = useRef({});

    // UI state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(0);

    // Sharing state
    const [shareMode, setShareMode] = useState(null); // null | 'whiteboard' | 'screen' | 'notes'
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [pipPosition, setPipPosition] = useState({ x: null, y: null });
    const [pipSize, setPipSize] = useState('small');

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const roomRef = ref(rtdb, `calls/${roomId}`);
    const participantsRef = ref(rtdb, `calls/${roomId}/participants`);

    // Session timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSessionDuration((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Initialize local media
    useEffect(() => {
        const setupLocalMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                if (user) {
                    set(ref(rtdb, `calls/${roomId}/participants/${user.uid}`), {
                        displayName: user.displayName || user.email || user.uid,
                        joined: new Date().toISOString(),
                    });
                }

                // Enter fullscreen
                if (containerRef.current) {
                    await enterFullscreen(containerRef.current);
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
                alert('Could not access camera or microphone. Please check permissions.');
            }
        };

        setupLocalMedia();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }

            if (user) {
                remove(ref(rtdb, `calls/${roomId}/participants/${user.uid}`));
            }

            exitFullscreen();
        };
    }, [roomId, user]);

    // Participant management (simplified WebRTC setup)
    useEffect(() => {
        if (!user || !localStream) return;

        const handleNewParticipant = (snapshot) => {
            const participantId = snapshot.key;
            const participantData = snapshot.val();

            if (participantId === user.uid) return;

            setParticipants((prev) => ({
                ...prev,
                [participantId]: participantData,
            }));

            createPeerConnection(participantId, true);
        };

        const handleParticipantLeft = (snapshot) => {
            const participantId = snapshot.key;

            if (participantId === user.uid) return;

            if (peerConnectionsRef.current[participantId]) {
                peerConnectionsRef.current[participantId].close();
                delete peerConnectionsRef.current[participantId];
            }

            setRemoteStreams((prev) => {
                const newStreams = { ...prev };
                delete newStreams[participantId];
                return newStreams;
            });

            setParticipants((prev) => {
                const newParticipants = { ...prev };
                delete newParticipants[participantId];
                return newParticipants;
            });
        };

        get(participantsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const participantsData = snapshot.val();

                Object.entries(participantsData).forEach(([id, data]) => {
                    if (id !== user.uid) {
                        setParticipants((prev) => ({
                            ...prev,
                            [id]: data,
                        }));

                        createPeerConnection(id, true);
                    }
                });
            }
        });

        const newParticipantListener = onChildAdded(participantsRef, handleNewParticipant);
        const participantLeftListener = onChildRemoved(participantsRef, handleParticipantLeft);

        return () => {
            newParticipantListener();
            participantLeftListener();
        };
    }, [roomId, user, localStream]);

    const createPeerConnection = (participantId, isInitiator) => {
        if (peerConnectionsRef.current[participantId]) {
            return peerConnectionsRef.current[participantId];
        }

        const pc = new RTCPeerConnection(configuration);
        peerConnectionsRef.current[participantId] = pc;

        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({
                ...prev,
                [participantId]: event.streams[0],
            }));
        };

        // Simplified signaling - in production, implement full WebRTC signaling
        // This is a placeholder for the WebRTC connection logic

        return pc;
    };

    // Control handlers
    const handleToggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleToggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleShareScreen = async () => {
        if (isScreenSharing) {
            // Stop screen sharing
            setIsScreenSharing(false);
            setShareMode(null);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false,
                });

                // Replace video track with screen track
                const screenTrack = screenStream.getVideoTracks()[0];

                Object.values(peerConnectionsRef.current).forEach((pc) => {
                    const senders = pc.getSenders();
                    const sender = senders.find((s) => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                setIsScreenSharing(true);
                setShareMode('screen');

                screenTrack.onended = () => {
                    handleShareScreen(); // Stop sharing when user stops from browser
                };
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        }
    };

    const handleShareWhiteboard = () => {
        setShowWhiteboard(true);
        setShareMode('whiteboard');
    };

    const handleShareNotes = () => {
        // Placeholder for notes sharing
        setShareMode('notes');
        alert('Notes sharing will be implemented soon!');
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1920;
                canvas.height = 1080;

                const canvasStream = canvas.captureStream(30);
                const audioTrack = localStream.getAudioTracks()[0];

                if (audioTrack) {
                    canvasStream.addTrack(audioTrack);
                }

                const mediaRecorder = new MediaRecorder(canvasStream, {
                    mimeType: 'video/webm;codecs=vp9',
                });

                mediaRecorderRef.current = mediaRecorder;
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `session-${roomId}-${Date.now()}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Error starting recording:', error);
                alert('Failed to start recording. Please try again.');
            }
        }
    };

    const handleLeaveSession = async () => {
        if (isRecording) {
            handleToggleRecording();
        }

        await exitFullscreen();
        onExit();
    };

    const handleToggleFullscreen = async () => {
        if (containerRef.current) {
            await toggleFullscreen(containerRef.current);
        }
    };

    // Calculate grid layout
    const participantCount = Object.keys(remoteStreams).length + 1; // +1 for local user
    const layout = getOptimalLayout(participantCount);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-gray-950 z-50 flex flex-col"
        >
            {/* Header */}
            <div className="bg-gray-900/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-white font-bold text-lg">
                        {sessionData?.title || 'Online Session'}
                    </h2>
                    <span className="text-gray-400 text-sm">
                        {formatDuration(sessionDuration)}
                    </span>
                    {isRecording && (
                        <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            Recording
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">
                        {participantCount} participant{participantCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 relative overflow-hidden">
                {showWhiteboard ? (
                    // Whiteboard mode
                    <>
                        <WhiteboardShare
                            groupId={roomId}
                            onClose={() => {
                                setShowWhiteboard(false);
                                setShareMode(null);
                            }}
                        />
                        {/* PiP video overlay */}
                        {localStream && (
                            <PictureInPictureVideo
                                stream={localStream}
                                participantName="You"
                                initialPosition={pipPosition}
                                initialSize={pipSize}
                                onPositionChange={setPipPosition}
                                onSizeChange={setPipSize}
                                isMuted={isMuted}
                                isVideoOff={isVideoOff}
                            />
                        )}
                    </>
                ) : (
                    // Video grid mode
                    <div className="w-full h-full p-6">
                        <div
                            className="grid gap-4 h-full"
                            style={{
                                gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                                gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                            }}
                        >
                            {/* Local video */}
                            <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {isVideoOff && (
                                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white text-4xl font-bold">
                                            {user?.displayName?.charAt(0).toUpperCase() || 'Y'}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                                    <span className="text-white text-sm font-medium">
                                        You {isMuted && '🔇'}
                                    </span>
                                </div>
                            </div>

                            {/* Remote videos */}
                            {Object.entries(remoteStreams).map(([participantId, stream]) => (
                                <RemoteVideo
                                    key={participantId}
                                    stream={stream}
                                    participantName={participants[participantId]?.displayName || 'Participant'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Control bar */}
            <SessionControlBar
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                isRecording={isRecording}
                onToggleMute={handleToggleMute}
                onToggleVideo={handleToggleVideo}
                onShareScreen={handleShareScreen}
                onShareWhiteboard={handleShareWhiteboard}
                onShareNotes={handleShareNotes}
                onToggleRecording={handleToggleRecording}
                onToggleParticipants={() => setShowParticipants(!showParticipants)}
                onToggleChat={() => setShowChat(!showChat)}
                onLeaveSession={handleLeaveSession}
                onToggleFullscreen={handleToggleFullscreen}
                participantCount={participantCount}
            />
        </div>
    );
}
