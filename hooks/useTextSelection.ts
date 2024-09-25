import { useEffect, useRef } from 'react';

export function useTextSelection(setSelectedText: (text: string | null) => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      setSelectedText(selectedText || null);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mouseup', handleSelection);
      element.addEventListener('touchend', handleSelection);
    }

    return () => {
      if (element) {
        element.removeEventListener('mouseup', handleSelection);
        element.removeEventListener('touchend', handleSelection);
      }
    };
  }, [setSelectedText]);

  return ref;
}