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
          className={`z-50 absolute whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity duration-300
            ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
            ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
            ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
            ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
          `}
          style={{
            background: 'linear-gradient(135deg, #0f1419 0%, #1a1f29 50%, #2c1d1d 100%)',
            color: 'white',
            boxShadow: `
              0 4px 15px rgba(0, 0, 0, 0.3),
              0 2px 8px rgba(142, 22, 26, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            border: '1px solid rgba(211, 183, 160, 0.2)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}; 