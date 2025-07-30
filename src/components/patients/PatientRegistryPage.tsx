import React, { useState } from 'react';
import { PatientList } from './PatientList';
import { MultiStepPatientRegistrationModal } from './MultiStepPatientRegistrationModal';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';

export function PatientRegistryPage() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#8e161a] mb-8 tracking-tight text-left">Registro y Gestión de Pacientes</h1>
        <PatientList onRegisterClick={() => setShowRegistration(true)} />
      </div>
      <MultiStepPatientRegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </div>
  );
}
