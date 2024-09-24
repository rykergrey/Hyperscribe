import { useEffect, useRef, useState } from 'react';

export function useTextSelection(onTextSelect: (text: string | null) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && (ref.current?.contains(selection.anchorNode) || ref.current?.contains(selection.focusNode))) {
        const text = selection.toString().trim();
        if (text !== selectedText) {
          setSelectedText(text);
          onTextSelect(text || null);
        }
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10); // Small delay to ensure selection is complete
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onTextSelect, selectedText]);

  return ref;
}