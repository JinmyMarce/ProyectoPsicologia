import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { patientsService, Patient } from '../../services/patients';
import { MultiStepPatientRegistrationModal } from './MultiStepPatientRegistrationModal';
import { PatientDetailsModal } from './PatientDetailsModal';

interface PatientListProps {
  onRegisterClick?: () => void;
}

export function PatientList({ onRegisterClick }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  // Estado para edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPatientId, setEditPatientId] = useState<number|null>(null);
  const [editPatientData, setEditPatientData] = useState<any>(null);
  // Estado para modal de detalles
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number|null>(null);

  const loadPatients = async (page = 1, search = '') => {
    setLoading(true);
    setError('');

    try {
      const response = await patientsService.getPatients({
        search,
        page,
        per_page: 10,
        role: 'student'
      });

      if (response.success) {
        setPatients(response.data);
        setTotalPages(response.pagination?.last_page || 1);
        setCurrentPage(response.pagination?.current_page || 1);
      } else {
        setError('Error al cargar pacientes');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadPatients(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPatients(page, searchTerm);
  };

  const handleDeletePatient = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este paciente?')) {
      return;
    }

    try {
      const response = await patientsService.deletePatient(id);
      if (response.success) {
        loadPatients(currentPage, searchTerm);
      } else {
        setError('Error al eliminar paciente');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar paciente');
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
        Activo
      </Badge>
    ) : (
      <Badge variant="destructive" className="font-semibold">
        Inactivo
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl rounded-3xl border-0 bg-white overflow-hidden" padding="lg">
          {/* Header con icono grande */}
          <div className="text-center mb-8 bg-white p-8 rounded-t-3xl border-b-2 border-[#8e161a]">
            <div className="flex items-center justify-center mx-auto mb-6">
              <div className="relative">
                <img 
                  src="/images/icons/psicologia.png"
                  alt="Logo Institucional"
                  className="w-24 h-24 object-contain drop-shadow-2xl filter brightness-110"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-[#8e161a] mb-3 tracking-tight">
              Visualizar Pacientes
            </h1>
            <p className="text-[#8e161a] font-semibold text-lg">
              Sistema de Gestión de Citas - Psicología
            </p>
            <p className="text-[#8e161a] font-bold text-sm mt-2">
              Instituto Túpac Amaru
            </p>
          </div>

          <div className="px-8 pb-8">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, email o DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-12 focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#d3b7a0] hover:text-[#8e161a] transition-colors"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => loadPatients(currentPage, searchTerm)}
                  variant="outline"
                  className="border-2 border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#8e161a] hover:text-white transition-all duration-300 px-6"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Actualizar
                </Button>
                <Button
                  className="bg-[#8e161a] text-white font-bold shadow-lg hover:bg-[#6d1115] transition-all duration-300 px-6"
                  onClick={onRegisterClick}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Registrar Paciente
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6">
                <p className="text-red-600 font-semibold text-center">{error}</p>
              </div>
            )}

            {/* Tabla de pacientes */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-[#8e161a]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#8e161a] text-white">
                    <th className="px-6 py-4 text-left font-bold text-lg">DNI</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Nombre</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Estado</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 animate-spin mr-3" />
                          <span className="text-lg font-semibold">Cargando pacientes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <span className="text-lg font-semibold">No se encontraron pacientes</span>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 font-semibold text-lg">{patient.dni}</td>
                        <td className="px-6 py-4 text-lg">{patient.name}</td>
                        <td className="px-6 py-4 text-gray-600 text-lg">{patient.email}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(patient.active)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setDetailsModalOpen(true);
                              }}
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                              onClick={async () => {
                                try {
                                  const res = await patientsService.getPatient(patient.id);
                                  if (res.success && res.data) {
                                    setEditPatientId(patient.id);
                                    setEditPatientData(res.data);
                                    setEditModalOpen(true);
                                  } else {
                                    setError('No se pudo cargar los datos del paciente');
                                  }
                                } catch (e) {
                                  setError('Error al cargar datos del paciente');
                                }
                              }}
                            >
                              Modificar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#8e161a] hover:bg-[#8e161a] hover:text-white transition-colors duration-200"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="w-5 h-5" />
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
              <div className="flex justify-center mt-8">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white px-6 py-3"
                  >
                    Anterior
                  </Button>
                  
                  <span className="px-6 py-3 text-lg text-gray-600 font-semibold">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-[#d3b7a0] text-[#8e161a] hover:bg-[#f2f3c6] px-6 py-3"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
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
          loadPatients(currentPage, searchTerm);
        }}
      />
      
      {/* Modal de detalles de paciente */}
      <PatientDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPatientId(null);
        }}
        patientId={selectedPatientId as number}
      />
    </div>
  );
}