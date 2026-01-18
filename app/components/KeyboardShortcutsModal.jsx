import { useState } from 'react';
import { useKeyboardShortcuts } from '../context/KeyboardShortcutContext';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const { 
    shortcuts, 
    updateShortcut, 
    resetToDefaults,
    isListenerActive,
    toggleShortcutsListener
  } = useKeyboardShortcuts();
  
  const [editingKey, setEditingKey] = useState(null);
  const [recordingNewShortcut, setRecordingNewShortcut] = useState(false);
  const [newShortcutKeys, setNewShortcutKeys] = useState([]);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleStartRecording = (key) => {
    setEditingKey(key);
    setRecordingNewShortcut(true);
    setNewShortcutKeys([]);
    setError('');
  };
  
  const handleKeyDown = (e) => {
    if (!recordingNewShortcut) return;
    
    e.preventDefault();
    
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('ctrl');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');
    if (e.metaKey) modifiers.push('meta');
    
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }
    
    if (modifiers.length === 0) {
      setError('Please include at least one modifier key (Ctrl, Alt, Shift)');
      return;
    }
    
    const keyCombo = [...modifiers, e.key.toLowerCase()];
    setNewShortcutKeys(keyCombo);
    setRecordingNewShortcut(false);
    
    saveNewShortcut(keyCombo.join('+'));
  };
  
  const saveNewShortcut = async (newKey) => {
    if (!editingKey) return;
    
    const oldKey = editingKey;
    const { action, description } = shortcuts[oldKey];
    
    const success = await updateShortcut(oldKey, newKey, action, description);
    
    if (success) {
      setEditingKey(null);
    } else {
      setError(`The shortcut ${newKey} is already in use. Please try another combination.`);
    }
  };
  
  const handleRemoveShortcut = async (key) => {
    await updateShortcut(key, null);
  };
  
  const sortedShortcuts = Object.entries(shortcuts).sort((a, b) => 
    a[1].description.localeCompare(b[1].description)
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        tabIndex="0"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label className="mr-2 text-sm">Enable Shortcuts</label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input
                  type="checkbox"
                  name="toggle"
                  id="shortcuts-toggle"
                  className="sr-only"
                  checked={isListenerActive}
                  onChange={toggleShortcutsListener}
                />
                <label
                  htmlFor="shortcuts-toggle"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    isListenerActive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Customize keyboard shortcuts to navigate the platform more efficiently.
            Click on a shortcut to edit it.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2 border">Action</th>
                <th className="px-4 py-2 border">Shortcut</th>
                <th className="px-4 py-2 border w-24">Options</th>
              </tr>
            </thead>
            <tbody>
              {sortedShortcuts.map(([key, { action, description }]) => (
                <tr key={key} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 border">{description}</td>
                  <td className="px-4 py-3 border">
                    {editingKey === key ? (
                      <div className="flex items-center">
                        {recordingNewShortcut ? (
                          <span className="text-blue-600 animate-pulse">
                            Press keys...
                          </span>
                        ) : (
                          <div className="flex gap-1">
                            {newShortcutKeys.map((k, i) => (
                              <kbd
                                key={i}
                                className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer flex gap-1" 
                        onClick={() => handleStartRecording(key)}
                      >
                        {key.split('+').map((k, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 border">
                    <div className="flex justify-end gap-2">
                      {editingKey !== key ? (
                        <>
                          <button
                            onClick={() => handleStartRecording(key)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveShortcut(key)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingKey(null)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Cancel"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;