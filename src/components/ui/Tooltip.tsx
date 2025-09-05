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
          className={`z-50 absolute whitespace-nowrap px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl transition-all duration-300
            ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
            ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
            ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
            ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
          `}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 70%, #e2e8f0 100%)',
            color: '#1e293b',
            boxShadow: `
              0 8px 32px rgba(255, 255, 255, 0.4),
              0 4px 16px rgba(30, 41, 59, 0.2),
              0 2px 8px rgba(51, 65, 85, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            border: '1px solid rgba(30, 41, 59, 0.2)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}; 