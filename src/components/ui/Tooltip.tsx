import React, { ReactNode, useState, useRef } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<number | null>(null);

  const showTooltip = () => {
    timeout.current = setTimeout(() => setVisible(true), 100);
  };
  const hideTooltip = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  };

  return (
    <span className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      aria-describedby="tooltip"
    >
      {children}
      {visible && (
        <span
          id="tooltip"
          role="tooltip"
          className={`z-50 absolute whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity duration-200 bg-gray-900 text-white opacity-95
            ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
            ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
            ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
            ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
          `}
        >
          {content}
        </span>
      )}
    </span>
  );
}; 