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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-[#6b1013]/50 overflow-hidden transform transition-all duration-500" style={{
        boxShadow: `
          0 40px 120px rgba(0, 0, 0, 0.6), 
          0 25px 60px rgba(107, 16, 19, 0.5),
          0 12px 30px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4)
        `
      }}>
        <div className="px-8 py-6 flex items-center justify-between border-b-2 border-[#6b1013]/30" style={{
          background: `
            linear-gradient(135deg, 
              #6b1013 0%, 
              #8e161a 20%, 
              #b91c1c 40%, 
              #dc2626 60%, 
              #ef4444 80%, 
              #6b1013 100%
            )
          `
        }}>
          {title && (
            <div className="font-bold text-2xl text-white" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
              letterSpacing: '0.5px'
            }}>
              {title}
            </div>
          )}
          <button
            className="text-white hover:text-[#ffffff] text-2xl font-bold ml-4 transition-colors duration-300 hover:scale-110"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-8 bg-gradient-to-br from-[#ffffff] to-[#f8fafc] text-[#1e293b]">{children}</div>
      </div>
    </div>
  );
};
