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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#6b1115] to-[#8e161a] px-6 py-4 flex items-center justify-between border-b-4 border-[#8e161a]">
          {title && <div className="font-bold text-xl text-white">{title}</div>}
          <button
            className="text-white hover:text-gray-200 text-2xl font-bold ml-4"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
