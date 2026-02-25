import { useState, useRef, useEffect, type ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export default function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 20,
  minLeftWidth = 15,
  maxLeftWidth = 40,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      const clampedWidth = Math.min(Math.max(newWidth, minLeftWidth), maxLeftWidth);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  return (
    <div ref={containerRef} className="flex h-full w-full">
      {/* Left Panel */}
      <div style={{ width: `${leftWidth}%` }} className="flex-shrink-0 p-1">
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <div
        className={`w-2 flex-shrink-0 cursor-col-resize transition-colors ${
          isDragging
            ? 'bg-blue-600 dark:bg-blue-500'
            : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400'
        }`}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-0.5 h-8 bg-gray-400 dark:bg-gray-500 rounded"></div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-1">
        {rightPanel}
      </div>
    </div>
  );
}
