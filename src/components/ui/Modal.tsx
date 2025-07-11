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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro bg-opacity-50">
      <div className="bg-blanco border-2 border-granate rounded-xl shadow-2xl max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-granate hover:text-granate-dark text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {title && <div className="p-5 border-b-2 border-granate font-bold text-xl text-granate">{title}</div>}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
