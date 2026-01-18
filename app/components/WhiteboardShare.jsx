'use client';

import { useRef, useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export default function WhiteboardShare({ groupId, onClose }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState('pen');
    const [currentPath, setCurrentPath] = useState([]);
    const [allPaths, setAllPaths] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const { user } = useAuth();

    const whiteboardRef = ref(rtdb, `whiteboards/${groupId}`);
    const userPathsRef = ref(rtdb, `whiteboards/${groupId}/paths`);

    // Predefined color palette
    const colorPalette = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    ];

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current || !groupId) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas to full size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const handleResize = () => {
            const prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(prevImage, 0, 0);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasRef, groupId]);

    // Listen for remote paths
    useEffect(() => {
        if (!groupId) return;

        const unsubscribe = onValue(userPathsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const paths = Object.values(data);
            setAllPaths(paths);

            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                paths.forEach((path) => {
                    if (path.points.length < 2) return;

                    ctx.beginPath();
                    ctx.moveTo(path.points[0].x, path.points[0].y);

                    for (let i = 1; i < path.points.length; i++) {
                        ctx.lineTo(path.points[i].x, path.points[i].y);
                    }

                    ctx.strokeStyle = path.color;
                    ctx.lineWidth = path.brushSize;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                });
            }
        });

        return () => unsubscribe();
    }, [groupId, userPathsRef]);

    const startDrawing = (e) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setCurrentPath([{ x, y }]);

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();

        setCurrentPath((prev) => [...prev, { x, y }]);
    };

    const endDrawing = () => {
        if (!isDrawing) return;

        setIsDrawing(false);

        if (currentPath.length > 0 && groupId) {
            const newPathRef = push(userPathsRef);
            set(newPathRef, {
                userId: user?.uid,
                userName: user?.displayName || user?.email,
                color: tool === 'eraser' ? 'white' : color,
                brushSize: tool === 'eraser' ? brushSize * 3 : brushSize,
                tool: tool,
                points: currentPath,
                timestamp: Date.now(),
            });
        }

        setCurrentPath([]);
    };

    const clearWhiteboard = () => {
        if (!canvasRef.current || !groupId) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        set(userPathsRef, null);
    };

    const undo = () => {
        // Simple undo by removing last path
        if (allPaths.length > 0) {
            const pathsArray = Object.entries(allPaths);
            const lastPathKey = pathsArray[pathsArray.length - 1][0];
            remove(ref(rtdb, `whiteboards/${groupId}/paths/${lastPathKey}`));
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-6">
                    {/* Tools */}
                    <div className="flex items-center gap-2">
                        <button
                            className={`p-2 rounded-lg transition-all ${tool === 'pen'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => setTool('pen')}
                            title="Pen (P)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-all ${tool === 'eraser'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => setTool('eraser')}
                            title="Eraser (E)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Color palette */}
                    <div className="flex items-center gap-2">
                        {colorPalette.map((c) => (
                            <button
                                key={c}
                                className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-blue-500 scale-110' : 'border-gray-300'
                                    }`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                                title={c}
                            />
                        ))}
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer"
                            title="Custom color"
                        />
                    </div>

                    {/* Brush size */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-sm font-medium text-gray-700 w-8">
                            {brushSize}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={undo}
                            className="px-3 py-2 bg-white hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                            title="Undo (Ctrl+Z)"
                        >
                            Undo
                        </button>
                        <button
                            onClick={clearWhiteboard}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                            title="Clear All"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all"
                >
                    Close Whiteboard
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                />
            </div>
        </div>
    );
}
