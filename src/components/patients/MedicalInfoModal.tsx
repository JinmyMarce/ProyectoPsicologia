import { useState, useEffect } from 'react';
import { X, AlertTriangle, Pill, Heart, FileText, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface MedicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalInfo: any;
}

export function MedicalInfoModal({ isOpen, onClose, medicalInfo }: MedicalInfoModalProps) {
  if (!isOpen || !medicalInfo) return null;

  const hasMedicalInfo = medicalInfo && (
    medicalInfo.medical_history || 
    medicalInfo.current_medications || 
    medicalInfo.allergies
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#660000] text-white border-b-4 border-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3 border border-white/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">Información Médica</h2>
                <span className="text-white/90 text-base font-medium">- Información Médica</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {hasMedicalInfo ? (
            <div className="space-y-6">
              {/* Antecedentes Médicos */}
              {medicalInfo.medical_history && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Antecedentes Médicos</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {medicalInfo.medical_history}
                    </p>
                  </div>
                </div>
              )}

              {/* Medicamentos Actuales */}
              {medicalInfo.current_medications && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <Pill className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Medicamentos Actuales</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {medicalInfo.current_medications}
                    </p>
                  </div>
                </div>
              )}

              {/* Alergias */}
              {medicalInfo.allergies && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Alergias</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {medicalInfo.allergies}
                    </p>
                  </div>
                </div>
              )}

              {/* Información de Emergencia Médica */}
              {medicalInfo.emergency_medical_info && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Información Médica de Emergencia</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {medicalInfo.emergency_medical_info}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Sin Información Médica</h3>
              <p className="text-gray-600 mb-6 text-sm">
                No se ha registrado información médica para este paciente.
              </p>
              <Badge variant="default" className="text-gray-500 border-gray-300">
                Sin datos médicos
              </Badge>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="bg-[#1e3a8a] text-white hover:bg-[#1e40af] px-6 py-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
