
'use client';

import { useFont } from '../context/FontContext';

const fontSizeClasses = {
  'small': 'text-sm',
  'medium': 'text-base',
  'large': 'text-lg',
  'x-large': 'text-xl'
};

const fontFamilyClasses = {
  'default': 'font-sans',
  'opendyslexic': 'font-open-dyslexic',
  'comic-sans': 'font-comic-neue',
  'serif': 'font-serif',
  'system': 'font-sans',
  'dyslexic': 'font-open-dyslexic'
};

export default function FontWrapper({ children }) {
  const { fontSize, fontFamily, highContrast } = useFont();
  
  const fontSizeClass = fontSizeClasses[fontSize] || 'text-base';
  const fontFamilyClass = fontFamilyClasses[fontFamily] || 'font-sans';
  
  const highContrastClass = highContrast ? 'high-contrast-mode' : '';
  
  return (
    <div className={`${fontSizeClass} ${fontFamilyClass} ${highContrastClass}`}>
      {children}
    </div>
  );
}