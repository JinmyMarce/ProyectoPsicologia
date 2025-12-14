import { X, AlertTriangle, Pill, Heart, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface MedicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalInfo: any;
  patientName?: string;
}

export function MedicalInfoModal({ isOpen, onClose, medicalInfo, patientName }: MedicalInfoModalProps) {
  if (!isOpen || !medicalInfo) return null;

  const hasMedicalInfo = medicalInfo && (
    medicalInfo.medical_history || 
    medicalInfo.current_medications || 
    medicalInfo.allergies
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] overflow-hidden border border-slate-300 mx-2 sm:mx-4">
        {/* Header compacto - Azul marino oscuro */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-2">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/90 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-slate-800" />
              </div>
              <div className="text-sm sm:text-base md:text-xl font-semibold text-white/80 leading-tight ml-1 sm:ml-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span>Información Médica</span>
                  {patientName && (
                    <div className="flex items-center gap-2">
                      <span className="font-normal text-xs sm:text-sm md:text-base text-white/70">- {patientName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-all duration-300 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 md:gap-x-8 gap-y-1 sm:gap-y-2 px-4 sm:px-6 md:px-12 pb-3 sm:pb-4 justify-start">
            <span className="text-[#f5d7d7]/70 text-xs sm:text-sm font-semibold">ACTUALIZADO: <span className="font-bold text-white/70 ml-1">
              {medicalInfo.updated_at ? new Date(medicalInfo.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'No disponible'}
            </span></span>
          </div>
        </div>

        {/* Body compacto */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-white max-h-[calc(90vh-140px)] sm:max-h-[calc(85vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Antecedentes Médicos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl px-3 sm:px-4 py-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-bold uppercase text-xs sm:text-sm">Antecedentes Médicos</span>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {medicalInfo.medical_history || 'No se han registrado antecedentes médicos.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medicamentos Actuales */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl px-3 sm:px-4 py-2">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-bold uppercase text-xs sm:text-sm">Medicamentos Actuales</span>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {medicalInfo.current_medications || 'No se han registrado medicamentos actuales.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Alergias */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl px-3 sm:px-4 py-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-bold uppercase text-xs sm:text-sm">Alergias</span>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {medicalInfo.allergies || 'No se han registrado alergias.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer compacto */}
          <div className="flex justify-end gap-2 pt-2 sm:pt-3 md:pt-4 border-t border-slate-200">
            <Button
              onClick={onClose}
              className="bg-white border-2 border-slate-300 text-slate-700 px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
