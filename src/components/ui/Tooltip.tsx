import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const showTooltip = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setVisible(true), 100);
  };
  
  const hideTooltip = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(prev => !prev);
  };

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visible && tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible]);

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      aria-describedby="tooltip"
    >
      <span onClick={toggleTooltip}>
        {children}
      </span>
      {visible && (
        <span
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`z-50 absolute whitespace-normal px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xl transition-all duration-300
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
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            maxWidth: '250px'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}; 