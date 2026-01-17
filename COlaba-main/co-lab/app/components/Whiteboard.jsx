'use client';

import { useRef, useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { logEvent, EVENT_TYPES, CONTEXT_MODES, CONTEXT_SOURCES } from '../utils/loggingService';

export default function Whiteboard({ groupId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');
  const [currentPath, setCurrentPath] = useState([]);
  const [allPaths, setAllPaths] = useState([]);
  const { user } = useAuth();

  const whiteboardRef = ref(rtdb, `whiteboards/${groupId}`);
  const userPathsRef = ref(rtdb, `whiteboards/${groupId}/paths`);
  const userCursorsRef = ref(rtdb, `whiteboards/${groupId}/cursors`);

  useEffect(() => {
    if (!canvasRef.current || !groupId) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const handleResize = () => {
      const prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(prevImage, 0, 0);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef, groupId]);

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

        paths.forEach(path => {
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

  useEffect(() => {
    if (!groupId || !user) return;

    const userCursorRef = ref(rtdb, `whiteboards/${groupId}/cursors/${user.uid}`);

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      set(userCursorRef, {
        x,
        y,
        displayName: user.displayName || user.email,
        color: color,
        lastUpdated: Date.now()
      });
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      remove(userCursorRef);
    };
  }, [groupId, user, color]);

  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onValue(userCursorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !canvasRef.current) return;

      const cursors = Object.entries(data)
        .filter(([uid]) => uid !== user?.uid)
        .map(([uid, cursor]) => ({
          uid,
          ...cursor
        }));

      const drawCursors = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        allPaths.forEach(path => {
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

        cursors.forEach(cursor => {
          if (Date.now() - cursor.lastUpdated > 10000) return;

          ctx.beginPath();
          ctx.moveTo(cursor.x, cursor.y);
          ctx.lineTo(cursor.x - 6, cursor.y + 15);
          ctx.lineTo(cursor.x + 6, cursor.y + 15);
          ctx.closePath();
          ctx.fillStyle = cursor.color || '#000000';
          ctx.fill();

          ctx.font = '12px Arial';
          ctx.fillText(cursor.displayName || 'User', cursor.x + 10, cursor.y + 15);
        });
      };

      drawCursors();

      const animate = () => {
        drawCursors();
        requestAnimationFrame(animate);
      };

      const animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    });

    return () => unsubscribe();
  }, [groupId, user, userCursorsRef, allPaths]);

  const startDrawing = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);

    // Log whiteboard usage
    logEvent(EVENT_TYPES.TOOL_USED, {
      mode: CONTEXT_MODES.GROUP,
      source: CONTEXT_SOURCES.LIVE_SESSION
    }, {
      tool: 'whiteboard',
      action: 'draw_start',
      brushType: tool,
      groupId
    }, groupId);

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
    ctx.lineWidth = brushSize;
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

    setCurrentPath(prev => [...prev, { x, y }]);
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
        brushSize: brushSize,
        tool: tool,
        points: currentPath,
        timestamp: Date.now()
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-white shadow-md flex space-x-4 items-center">
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-100' : 'bg-gray-100'}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-100' : 'bg-gray-100'}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="color" className="text-sm text-gray-600">Color:</label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="brushSize" className="text-sm text-gray-600">Size:</label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600">{brushSize}px</span>
        </div>

        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          onClick={clearWhiteboard}
          title="Clear whiteboard"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>
    </div>
  );
}