import React, { useState } from 'react';
import PatientList from './PatientList';
import { MultiStepPatientRegistrationModal } from './MultiStepPatientRegistrationModal';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';

export function PatientRegistryPage() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <>
      <PatientList onRegisterClick={() => setShowRegistration(true)} />
      <MultiStepPatientRegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </>
  );
}
