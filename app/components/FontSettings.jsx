
'use client';

import { useFont } from '../context/FontContext';

export default function FontSettings() {
  const { fontSize, fontFamily, changeFontSize, changeFontFamily } = useFont();

  return (
    <div className="font-settings p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Text Settings</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeFontSize('small')}
            className={`px-3 py-1 rounded ${fontSize === 'small' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Small
          </button>
          <button 
            onClick={() => changeFontSize('medium')}
            className={`px-3 py-1 rounded ${fontSize === 'medium' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => changeFontSize('large')}
            className={`px-3 py-1 rounded ${fontSize === 'large' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Large
          </button>
          <button 
            onClick={() => changeFontSize('x-large')}
            className={`px-3 py-1 rounded ${fontSize === 'x-large' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            X-Large
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => changeFontFamily('default')}
            className={`px-3 py-2 rounded font-sans ${fontFamily === 'default' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Default
          </button>
          <button 
            onClick={() => changeFontFamily('opendyslexic')}
            style={{ fontFamily: 'var(--font-open-dyslexic)' }}
            className={`px-3 py-2 rounded ${fontFamily === 'opendyslexic' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            OpenDyslexic
          </button>
          <button 
            onClick={() => changeFontFamily('comic-sans')}
            style={{ fontFamily: 'var(--font-comic-neue)' }}
            className={`px-3 py-2 rounded ${fontFamily === 'comic-sans' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Comic Sans
          </button>
          <button 
            onClick={() => changeFontFamily('arial')}
            style={{ fontFamily: 'Arial, sans-serif' }}
            className={`px-3 py-2 rounded ${fontFamily === 'arial' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Arial
          </button>
        </div>
      </div>
    </div>
  );
}