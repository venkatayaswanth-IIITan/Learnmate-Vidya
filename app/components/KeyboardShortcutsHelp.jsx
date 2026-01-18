import { useKeyboardShortcuts } from '../context/KeyboardShortcutContext';

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  const { shortcuts, isListenerActive } = useKeyboardShortcuts();
  
  if (!isOpen) return null;
  
  const groupedShortcuts = Object.entries(shortcuts).reduce((groups, [key, data]) => {
    let category = 'General';
    
    if (data.action.startsWith('open-')) {
      category = 'Navigation';
    } else if (data.action.includes('toggle')) {
      category = 'Toggle Actions';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push({ key, ...data });
    return groups;
  }, {});
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Keyboard Shortcuts Reference</h2>
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
        
        {!isListenerActive && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Keyboard shortcuts are currently disabled. You can enable them in the settings.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {shortcuts.map(({ key, description }) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-gray-700">{description}</span>
                    <div className="flex gap-1">
                      {key.split('+').map((k, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">?</kbd> anywhere to open this help panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;