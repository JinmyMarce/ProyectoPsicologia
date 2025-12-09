import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Search, RefreshCw, UserPlus, Eye, Trash2, Filter, AlertTriangle, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  // Ref para controlar si el componente está montado y evitar actualizaciones después de desmontar
  const isMountedRef = useRef(true);
  // Ref para evitar llamadas duplicadas
  const loadingRef = useRef(false);
  // Ref para almacenar el timeout del mensaje de éxito
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref para almacenar el último patientData editado y evitar actualizaciones innecesarias
  const lastEditPatientDataRef = useRef<string | null>(null);

  // Memoizar la función loadPatients con useCallback para evitar recreaciones
  const loadPatients = useCallback(async (page = 1, search = '', type = 'email') => {
    // Prevenir llamadas duplicadas
    if (loadingRef.current) {
      console.warn('loadPatients ya está en ejecución, ignorando llamada duplicada');
      return;
    }

    // Validar que el componente esté montado
    if (!isMountedRef.current) {
      return;
    }

    loadingRef.current = true;
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
      
      // Validar respuesta antes de actualizar estado
      if (!isMountedRef.current) {
        return;
      }

      if (response && response.success) {
        // Validar que data sea un array
        const patientsData = Array.isArray(response.data) ? response.data : [];
        setPatients(patientsData);
        
        // Validar y establecer paginación - solo actualizar si cambió
        const lastPage = response.last_page || response.pagination?.last_page || 1;
        const currentPageNum = response.current_page || response.pagination?.current_page || page;
        const validLastPage = Math.max(1, lastPage);
        const validCurrentPage = Math.max(1, Math.min(currentPageNum, validLastPage));
        
        // Solo actualizar si los valores son diferentes
        setTotalPages(prev => prev !== validLastPage ? validLastPage : prev);
        setCurrentPage(prev => prev !== validCurrentPage ? validCurrentPage : prev);
      } else {
        setError(response?.message || 'Error al cargar los pacientes');
        setPatients([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err: any) {
      if (!isMountedRef.current) {
        return;
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar los pacientes';
      setError(errorMessage);
      console.error('Error loading patients:', err);
      setPatients([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  // useEffect con dependencias correctas - solo se ejecuta una vez al montar
  // NO incluir loadPatients en las dependencias para evitar bucles infinitos
  useEffect(() => {
    isMountedRef.current = true;
    // Llamar directamente sin depender de la función memoizada
    const initialLoad = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const params: any = {
          page: 1,
          per_page: 10,
          role: 'patient'
        };

        const response = await patientsService.getPatients(params);
        
        if (!isMountedRef.current) {
          return;
        }

        if (response && response.success) {
          const patientsData = Array.isArray(response.data) ? response.data : [];
          setPatients(patientsData);
          
          const lastPage = response.last_page || response.pagination?.last_page || 1;
          const currentPageNum = response.current_page || response.pagination?.current_page || 1;
          const validLastPage = Math.max(1, lastPage);
          const validCurrentPage = Math.max(1, Math.min(currentPageNum, validLastPage));
          
          // Solo actualizar si los valores son diferentes para evitar re-renders innecesarios
          setTotalPages(prev => prev !== validLastPage ? validLastPage : prev);
          setCurrentPage(prev => prev !== validCurrentPage ? validCurrentPage : prev);
        } else {
          setError(response?.message || 'Error al cargar los pacientes');
          setPatients([]);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!isMountedRef.current) {
          return;
        }
        const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar los pacientes';
        setError(errorMessage);
        console.error('Error loading patients:', err);
        setPatients([]);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    };

    initialLoad();

    // Cleanup: limpiar timeout y marcar como desmontado
    return () => {
      isMountedRef.current = false;
      loadingRef.current = false;
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío - solo se ejecuta al montar

  // Memoizar handlers para evitar recreaciones
  const handleSearch = useCallback(() => {
    if (loadingRef.current) {
      return; // Prevenir búsquedas mientras se carga
    }
    
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
    // Solo actualizar currentPage si no es 1
    setCurrentPage(prev => {
      if (prev !== 1) {
        return 1;
      }
      return prev;
    });
    loadPatients(1, searchTerm, searchType);
  }, [searchTerm, searchType, loadPatients]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || loadingRef.current) {
      return;
    }
    // Solo actualizar si la página realmente cambió
    setCurrentPage(prev => {
      if (prev !== page) {
        loadPatients(page, searchTerm, searchType);
        return page;
      }
      return prev;
    });
  }, [searchTerm, searchType, totalPages, loadPatients]);

  const handleClearSearch = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    setSearchTerm('');
    setSearchType('email');
    setError(null);
    // Solo actualizar currentPage si no es 1
    setCurrentPage(prev => {
      if (prev !== 1) {
        loadPatients(1, '', 'email');
        return 1;
      }
      loadPatients(1, '', 'email');
      return prev;
    });
  }, [loadPatients]);

  // Memoizar placeholder según el tipo de búsqueda
  const searchPlaceholder = useMemo(() => {
    switch (searchType) {
      case 'email':
        return 'estudiante.istta.edu.pe.';
      case 'dni':
        return 'Ingrese el DNI (8 dígitos)...';
      default:
        return 'Buscar...';
    }
  }, [searchType]);

  const getStatusBadge = useCallback((active: boolean) => {
    return (
      <Badge
        variant={active ? "success" : "danger"}
        className="font-semibold"
      >
        {active ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  }, []);

  const handleDeletePatient = useCallback(async (patientId: number) => {
    if (!patientId || loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Desactivar el paciente en lugar de eliminarlo
      await patientsService.deactivatePatient(patientId);
      
      if (!isMountedRef.current) {
        return;
      }
      
      // Recargar la lista de pacientes
      await loadPatients(currentPage, searchTerm, searchType);
      
      // Mostrar mensaje de éxito
      setError(null);
      setSuccessMessage('Paciente desactivado exitosamente. Se han enviado las notificaciones correspondientes.');
      
      // Limpiar timeout anterior si existe
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      // Limpiar el mensaje de éxito después de 5 segundos
      successTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setSuccessMessage(null);
        }
      }, 5000);
      
    } catch (err: any) {
      if (!isMountedRef.current) {
        return;
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al desactivar el paciente';
      setError(errorMessage);
      console.error('Error deactivating patient:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [currentPage, searchTerm, searchType, loadPatients]);

  return (
    <>
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-cyan-50 selection:text-cyan-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section - Compact & Professional - CELESTE SUAVE que combina con el sistema */}
        <div className="bg-gradient-to-br from-cyan-100 via-sky-100 to-cyan-200 rounded-2xl shadow-lg relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-cyan-200/40">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30"></div>

          {/* Minimal decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          {/* Subtle dots */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-32 w-1 h-1 bg-sky-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-white/70 backdrop-blur-xl text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-sm border border-cyan-300/50 hover:bg-white/80 transition-all duration-300">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    SAPTA
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">Gestión de Pacientes</h1>
                <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                  Administra y gestiona los pacientes del sistema.
                  <span className="hidden sm:inline text-cyan-700"> Busca y visualiza información de pacientes.</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-300/40 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Wave pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
              <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
            </svg>
          </div>
        </div>

        <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">

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
          <div className="bg-white rounded-xl p-2 mb-3 border border-cyan-200 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-cyan-600" />
              <h3 className="text-base font-bold text-cyan-700">Buscar Paciente</h3>
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
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base bg-white"
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
                  placeholder={searchPlaceholder}
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
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base"
                />
              </div>

              {/* Botón de búsqueda */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-bold shadow-md transition-all duration-300 px-4 py-2 text-sm rounded-lg"
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
                if (loadingRef.current) {
                  return;
                }
                setError(null);
                setSuccessMessage(null);
                loadPatients(currentPage, searchTerm, searchType);
              }}
              disabled={loadingRef.current}
              variant="outline"
              className="border-2 border-cyan-300 text-cyan-700 font-semibold bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loadingRef.current ? 'animate-spin' : ''}`} />
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
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-cyan-200 w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-200 via-sky-200 to-cyan-300 text-cyan-900">
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
                            className="text-cyan-600 hover:bg-cyan-50 hover:text-cyan-800 transition-colors duration-200"
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
                            className="text-cyan-600 hover:bg-cyan-50 hover:text-cyan-800 transition-colors duration-200"
                            disabled={loadingRef.current}
                            onClick={async () => {
                              if (loadingRef.current || !patient.id) {
                                return;
                              }

                              try {
                                loadingRef.current = true;
                                setLoading(true);
                                setError(null);
                                
                                const res = await patientsService.getPatient(patient.id);
                                
                                if (!isMountedRef.current) {
                                  return;
                                }

                                if (res && res.success && res.data) {
                                  // Preparar los datos para el modal de edición
                                  // Usar useMemo o crear una función estable para evitar recreaciones
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
                                  
                                  // Crear una clave única para comparar
                                  const dataKey = `${patient.id}-${res.data.dni || ''}-${res.data.email || ''}`;
                                  
                                  // Solo actualizar si los datos realmente cambiaron
                                  if (lastEditPatientDataRef.current !== dataKey) {
                                    lastEditPatientDataRef.current = dataKey;
                                    setEditPatientId(patient.id);
                                    setEditPatientData(patientData);
                                  }
                                  
                                  setEditModalOpen(true);
                                } else {
                                  setError(res?.message || 'No se pudo cargar los datos del paciente');
                                }
                              } catch (e: any) {
                                if (!isMountedRef.current) {
                                  return;
                                }
                                const errorMessage = e?.response?.data?.message || e?.message || 'Error al cargar datos del paciente';
                                setError(errorMessage);
                                console.error('Error loading patient data:', e);
                              } finally {
                                if (isMountedRef.current) {
                                  setLoading(false);
                                }
                                loadingRef.current = false;
                              }
                            }}
                          >
                            Modificar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cyan-600 hover:bg-cyan-50 hover:text-cyan-800 transition-colors duration-200"
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

      {/* Modal de detalles del paciente - Solo renderizar si está abierto */}
      {detailsModalOpen && selectedPatientId && (
        <PatientDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedPatientId(null);
          }}
          patientId={selectedPatientId}
        />
      )}

      {/* Modal de edición de paciente - Solo renderizar si está abierto */}
      {editModalOpen && (
        <MultiStepPatientRegistrationModal
          isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditPatientId(null);
          setEditPatientData(null);
          lastEditPatientDataRef.current = null;
        }}
          patientId={editPatientId || undefined}
          patientData={editPatientData}
          onSuccess={() => {
            setEditModalOpen(false);
            setEditPatientId(null);
            setEditPatientData(null);
            lastEditPatientDataRef.current = null;
            // Usar setTimeout para evitar conflictos con otros estados
            setTimeout(() => {
              if (isMountedRef.current && !loadingRef.current) {
                loadPatients(currentPage, searchTerm, searchType);
              }
            }, 300);
          }}
        />
      )}

      {/* Modal de confirmación de eliminación - Solo renderizar si está abierto */}
      {deleteConfirmationOpen && patientToDeleteId && (
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
                disabled={loadingRef.current}
                onClick={() => {
                  if (!loadingRef.current) {
                    handleDeletePatient(patientToDeleteId);
                    setDeleteConfirmationOpen(false);
                    setPatientToDeleteId(null);
                  }
                }}
              >
                Desactivar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default PatientList;