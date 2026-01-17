import { useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '../context/KeyboardShortcutContext';
import { useRouter } from 'next/navigation';

const KeyboardShortcutsListener = ({ onActionTriggered }) => {
  const { shortcuts, isListenerActive } = useKeyboardShortcuts();
  const router = useRouter();
  
  const handleKeyDown = useCallback((event) => {
    if (!isListenerActive) return;
    
    if (
      event.target.tagName === 'INPUT' || 
      event.target.tagName === 'TEXTAREA' || 
      event.target.isContentEditable
    ) {
      return;
    }
    
    let keyCombo = [];
    if (event.ctrlKey) keyCombo.push('ctrl');
    if (event.altKey) keyCombo.push('alt');
    if (event.shiftKey) keyCombo.push('shift');
    if (event.metaKey) keyCombo.push('meta'); 
    
    keyCombo.push(event.key.toLowerCase());
    const keyString = keyCombo.join('+');
    
    if (shortcuts[keyString]) {
      event.preventDefault();
      
      const { action } = shortcuts[keyString];
      
      if (onActionTriggered) {
        onActionTriggered(action);
      }
    }
  }, [shortcuts, isListenerActive, onActionTriggered]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return null; 
};

export default KeyboardShortcutsListener;