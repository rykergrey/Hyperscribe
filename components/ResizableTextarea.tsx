import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface ResizableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
}

export function ResizableTextarea({ 
  minHeight = 100, 
  value,
  onChange,
  className,
  ...props 
}: ResizableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [value, minHeight]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`;
        }
      }}
      style={{ 
        minHeight: `${minHeight}px`,
        resize: 'both', // Changed from 'none' to 'both'
        overflow: 'auto' // Changed from 'hidden' to 'auto'
      }}
      className={`w-full ${className}`}
      {...props}
    />
  );
}