import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface RejectAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
  error?: string;
}

export const RejectAppointmentModal: React.FC<RejectAppointmentModalProps> = ({
  open,
  onClose,
  onReject,
  loading,
  error
}) => {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReject = () => {
    setSubmitted(true);
    if (!reason.trim()) return;
    onReject(reason);
  };

  return (
    <Modal open={open} onClose={onClose} title="Rechazar cita">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center space-x-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}
      <div className="mb-4">
        <label className="font-bold mb-2 block text-gray-700">Motivo del rechazo <span className="text-red-600">*</span></label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all min-h-[80px] resize-none"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explica la razón del rechazo..."
          rows={3}
          required
        />
        {submitted && !reason.trim() && (
          <div className="text-xs text-red-500 mt-2">El motivo es obligatorio.</div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold">Cancelar</Button>
        <Button type="button" onClick={handleReject} loading={loading} className="bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md">Rechazar Cita</Button>
      </div>
    </Modal>
  );
};
