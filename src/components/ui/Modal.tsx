import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-[#d3b7a0]/30 overflow-hidden" style={{
        boxShadow: `
          0 25px 80px rgba(0, 0, 0, 0.4), 
          0 15px 40px rgba(142, 22, 26, 0.3),
          0 5px 15px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `
      }}>
        <div className="px-6 py-4 flex items-center justify-between border-b-2 border-[#d3b7a0]/20" style={{
          background: `
            linear-gradient(135deg, 
              #0f1419 0%, 
              #1a1f29 25%, 
              #2c1d1d 50%, 
              #8e161a 75%, 
              #d3b7a0 100%
            )
          `
        }}>
          {title && (
            <div className="font-bold text-xl text-white" style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              {title}
            </div>
          )}
          <button
            className="text-white hover:text-[#d3b7a0] text-2xl font-bold ml-4 transition-colors duration-300 hover:scale-110"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
      </div>
    </div>
  );
};
