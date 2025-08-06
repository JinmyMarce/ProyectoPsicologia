import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Search, RefreshCw, UserPlus, Eye, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { patientsService } from '../../services/patients';
import { PatientDetailsModal } from './PatientDetailsModal';
import { MultiStepPatientRegistrationModal } from './MultiStepPatientRegistrationModal';

interface Patient {
  id: number;
  name: string;
  email: string;
  dni: string;
  active: boolean;
  programa_estudios?: string;
  // ... otros campos
}

interface PatientListProps {
  onRegisterClick: () => void;
}

const PatientList: React.FC<PatientListProps> = ({ onRegisterClick }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editPatientId, setEditPatientId] = useState<number | null>(null);
  const [editPatientData, setEditPatientData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [patientToDeleteId, setPatientToDeleteId] = useState<number | null>(null);

  const loadPatients = async (page = 1, search = '', type = 'email') => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        per_page: 10,
        role: 'patient'
      };

      if (search.trim()) {
        if (type === 'email') {
          params.search = search.trim();
        } else if (type === 'dni') {
          params.dni = search.trim();
        }
      }

      const response = await patientsService.getPatients(params);
      
      if (response.success) {
        setPatients(response.data || []);
        setTotalPages(response.last_page || response.pagination?.last_page || 1);
        setCurrentPage(response.current_page || response.pagination?.current_page || page);
      } else {
        setError('Error al cargar los pacientes');
        setPatients([]);
      }
    } catch (err) {
      setError('Error al cargar los pacientes');
      console.error('Error loading patients:', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = () => {
    // Validar DNI si es el tipo de búsqueda seleccionado
    if (searchType === 'dni' && searchTerm.trim()) {
      const dniRegex = /^\d{8}$/;
      if (!dniRegex.test(searchTerm.trim())) {
        setError('El DNI debe tener exactamente 8 dígitos numéricos');
        return;
      }
    }
    
    setError(null);
    setSuccessMessage(null);
    setCurrentPage(1); // Resetear a la primera página al buscar
    loadPatients(1, searchTerm, searchType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPatients(page, searchTerm, searchType);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('email');
    setError(null);
    setCurrentPage(1);
    loadPatients(1, '', 'email');
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'email':
        return 'estudiante.istta.edu.pe.';
      case 'dni':
        return 'Ingrese el DNI (8 dígitos)...';
      default:
        return 'Buscar...';
    }
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge
        variant={active ? "success" : "danger"}
        className="font-semibold"
      >
        {active ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  };

  const handleDeletePatient = async (patientId: number) => {
    try {
      setLoading(true);
      // Desactivar el paciente en lugar de eliminarlo
      await patientsService.deactivatePatient(patientId);
      
      // Recargar la lista de pacientes
      await loadPatients(currentPage, searchTerm, searchType);
      
      // Mostrar mensaje de éxito
      setError(null);
      setSuccessMessage('Paciente desactivado exitosamente. Se han enviado las notificaciones correspondientes.');
      
      // Limpiar el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      setError('Error al desactivar el paciente');
      console.error('Error deactivating patient:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-1">
      <div className="max-w-full mx-auto">
        <div className="px-0 pb-2">
          {/* Título y botón actualizar */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-[#8e161a] flex-1">Gestión de Pacientes</h1>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-xl p-2 mb-3 border border-[#8e161a] shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-[#8e161a]" />
              <h3 className="text-base font-bold text-[#8e161a]">Buscar Paciente</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              {/* Combo de tipo de búsqueda */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Buscar por
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base bg-white"
                >
                  <option value="email">Correo electrónico</option>
                  <option value="dni">DNI</option>
                </select>
              </div>

              {/* Campo de búsqueda */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {searchType === 'email' ? 'Correo electrónico' : 'DNI'}
                </label>
                <Input
                  type={searchType === 'dni' ? 'text' : 'text'}
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => {
                    if (searchType === 'dni') {
                      // Solo permitir números y máximo 8 dígitos
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSearchTerm(value);
                    } else {
                      setSearchTerm(e.target.value);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base"
                />
              </div>

              {/* Botón de búsqueda */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  className="bg-[#8e161a] text-white font-bold shadow-md hover:bg-[#6d1115] transition-all duration-300 px-4 py-2 text-sm rounded-lg"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Buscar
                </Button>
                {searchTerm && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 px-3 py-2 text-sm rounded-lg"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mb-2">
            <Button
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                loadPatients(currentPage, searchTerm, searchType);
              }}
              variant="outline"
              className="border-2 border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#8e161a] hover:text-white transition-all duration-300 px-4 py-2 text-sm rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </Button>
            <Button
              className="bg-[#8e161a] text-white font-bold shadow-md hover:bg-[#6d1115] transition-all duration-300 px-4 py-2 text-sm rounded-lg"
              onClick={onRegisterClick}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Registrar Paciente
            </Button>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border-2 border-red-200 rounded-xl mb-3">
              <p className="text-red-600 font-semibold text-center">{error}</p>
            </div>
          )}

          {/* Tabla de pacientes */}
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-[#8e161a] w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-[#8e161a] text-white">
                  <th className="px-3 py-2 text-center font-bold text-base">DNI</th>
                  <th className="px-3 py-2 text-center font-bold text-base">Nombre Completo</th>
                  <th className="px-3 py-2 text-center font-bold text-base">Correo</th>
                  <th className="px-3 py-2 text-center font-bold text-base">Estado</th>
                  <th className="px-3 py-2 text-center font-bold text-base">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-base font-semibold">Cargando pacientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      <span className="text-base font-semibold">No se encontraron pacientes</span>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-3 py-2 font-semibold text-base text-center">{patient.dni}</td>
                      <td className="px-3 py-2 text-sm text-gray-800 text-center">{patient.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 text-center">{patient.email}</td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(patient.active)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex space-x-1 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const res = await patientsService.getPatient(patient.id);
                                if (res.success && res.data) {
                                  // Preparar los datos para el modal de edición
                                  const patientData = {
                                    personalData: {
                                      dni: res.data.dni || '',
                                      fullName: res.data.name || '',
                                      birthDate: res.data.birth_date || res.data.birthDate || res.data.birthdate || '',
                                      gender: res.data.gender || '',
                                      address: res.data.address || '',
                                      studyProgram: res.data.career || res.data.programa_estudios || '',
                                      semester: String(res.data.semester || ''),
                                      phone: (res.data.phone || '').replace('+51', '').replace(/\D/g, ''),
                                      email: res.data.email || '',
                                      // No incluir nombre completo y email para que no se editen
                                    },
                                    emergencyContact: {
                                      name: res.data.emergency_contact?.name || res.data.emergency_name || '',
                                      relationship: res.data.emergency_contact?.relationship || res.data.emergency_relationship || '',
                                      phone: (res.data.emergency_contact?.phone || res.data.emergency_phone || '').replace('+51', '').replace(/\D/g, ''),
                                    },
                                    medicalInfo: {
                                      medicalHistory: res.data.medical_info?.medical_history || res.data.medical_history || '',
                                      currentMedications: res.data.medical_info?.current_medications || res.data.current_medications || '',
                                      allergies: res.data.medical_info?.allergies || res.data.allergies || '',
                                    }
                                  };
                                  
                                  setEditPatientId(patient.id);
                                  setEditPatientData(patientData);
                                  setEditModalOpen(true);
                                } else {
                                  setError('No se pudo cargar los datos del paciente');
                                }
                              } catch (e) {
                                setError('Error al cargar datos del paciente');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            Modificar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                            onClick={() => {
                              setPatientToDeleteId(patient.id);
                              setDeleteConfirmationOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </Button>
                <span className="px-4 py-1 text-sm text-gray-700 font-semibold">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-3 py-1 text-sm disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Información de resultados */}
          {!loading && (
            <div className="text-center mt-3 text-sm text-gray-600">
              Mostrando {patients.length} paciente{patients.length !== 1 ? 's' : ''} 
              {totalPages > 1 && ` de ${totalPages} página${totalPages !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del paciente */}
      {selectedPatientId && (
        <PatientDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedPatientId(null);
          }}
          patientId={selectedPatientId}
        />
      )}

      {/* Modal de edición de paciente */}
      <MultiStepPatientRegistrationModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditPatientId(null);
          setEditPatientData(null);
        }}
        patientId={editPatientId || undefined}
        patientData={editPatientData}
        onSuccess={() => {
          setEditModalOpen(false);
          setEditPatientId(null);
          setEditPatientData(null);
          loadPatients(currentPage, searchTerm, searchType);
        }}
      />

      {/* Modal de confirmación de eliminación */}
      {patientToDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
                         <h3 className="text-lg font-bold text-center text-gray-800 mb-4">
               ¿Está seguro de que desea desactivar esta cuenta?
             </h3>
             <p className="text-sm text-gray-600 text-center mb-6">
               La cuenta se desactivará y se enviará un mensaje tanto al usuario como al administrador. El paciente no podrá acceder al sistema hasta que sea reactivado.
             </p>
            <div className="flex justify-end gap-3">
                             <Button
                 variant="outline"
                 className="border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 px-4 py-2 text-sm rounded-lg"
                 onClick={() => {
                   setDeleteConfirmationOpen(false);
                   setPatientToDeleteId(null);
                 }}
               >
                 Cancelar
               </Button>
                             <Button
                 className="bg-red-500 text-white font-bold shadow-md hover:bg-red-600 transition-all duration-300 px-4 py-2 text-sm rounded-lg"
                 onClick={() => {
                   handleDeletePatient(patientToDeleteId);
                   setDeleteConfirmationOpen(false);
                   setPatientToDeleteId(null);
                 }}
               >
                 Desactivar
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;