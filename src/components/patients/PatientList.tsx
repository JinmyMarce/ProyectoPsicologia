import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Search, RefreshCw, UserPlus, Eye, Trash2, Filter, AlertTriangle, Sparkles, User, Edit } from 'lucide-react';
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

  // Escuchar evento para abrir modal de registro desde el header
  useEffect(() => {
    const handleOpenRegister = () => {
      onRegisterClick();
    };
    
    window.addEventListener('openRegisterPatient', handleOpenRegister);
    return () => {
      window.removeEventListener('openRegisterPatient', handleOpenRegister);
    };
  }, [onRegisterClick]);

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

    // Escuchar evento para actualizar la lista desde el header
    useEffect(() => {
      const handleRefreshList = () => {
        if (!loadingRef.current && isMountedRef.current) {
          loadPatients(currentPage, searchTerm, searchType);
        }
      };
      
      window.addEventListener('refreshPatientList', handleRefreshList);
      return () => {
        window.removeEventListener('refreshPatientList', handleRefreshList);
      };
    }, [currentPage, searchTerm, searchType, loadPatients]);

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
    
    // Guardar el término de búsqueda antes de limpiar
    const searchValue = searchTerm;
    const searchTypeValue = searchType;
    
    // Limpiar el campo después de buscar
    setSearchTerm('');
    
    // Realizar la búsqueda con el valor guardado
    loadPatients(1, searchValue, searchTypeValue);
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
        className="font-semibold text-[10px] px-1.5 py-0.5"
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
    <div className="min-h-screen bg-white font-sans selection:bg-cyan-50 selection:text-cyan-800">
      {/* Header Section - Copiado del dashboard del psicólogo - Responsivo */}
      <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-xl sm:rounded-2xl shadow-2xl relative overflow-hidden mx-2 xs:mx-3 sm:mx-4 mt-2 sm:mt-3 border border-cyan-200/40">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>

          {/* Minimal decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          {/* Subtle dots */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-32 w-1 h-1 bg-sky-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6 pb-6 sm:pb-7 md:pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/70 text-cyan-700 text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                    SAPTA - Psicología
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-cyan-900 mb-1 sm:mb-1.5 leading-tight">
                  Gestión de Pacientes
                </h1>
                <p className="text-cyan-800 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
                  Administra y gestiona los pacientes del sistema.
                  <span className="hidden sm:inline text-cyan-700"> Busca y visualiza información de pacientes.</span>
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-end md:justify-start">
                <button
                  onClick={() => {
                    const event = new CustomEvent('refreshPatientList');
                    window.dispatchEvent(event);
                  }}
                  className="px-3 sm:px-4 py-2 bg-white rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 flex items-center gap-2 font-semibold text-xs sm:text-sm shadow-sm"
                  title="Actualizar lista"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 font-semibold text-[11px] sm:text-xs md:text-sm shadow-sm"
                  title="Registrar Paciente"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Registrar Paciente</span>
                  <span className="sm:hidden">Registrar</span>
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

        <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6 -mt-4 relative z-20 space-y-4 sm:space-y-6">

          {/* Mensajes de error y éxito - Responsivos */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <div className="flex items-start sm:items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-xs sm:text-sm break-words">{error}</span>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <div className="flex items-start sm:items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs sm:text-sm break-words">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Filtros y búsqueda - Copiado del diseño de agendar cita directamente - Responsivo */}
          <div className="bg-white rounded-xl shadow-lg border border-cyan-200/50 p-3 sm:p-4 md:p-5">
            <h2 className="text-sm sm:text-base md:text-lg font-black text-cyan-900 mb-3 sm:mb-4 md:mb-5 flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-slate-900 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm md:text-lg">Buscar Paciente</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Selector de tipo */}
              <div className="flex-shrink-0 w-full sm:w-32">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  Tipo de búsqueda
                </label>
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchTerm('');
                    setError(null);
                  }}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300"
                >
                  <option value="email">Correo</option>
                  <option value="dni">DNI</option>
                </select>
              </div>

              {/* Campo de búsqueda con botón al costado */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  {searchType === 'dni' ? 'DNI del paciente' : 'Correo electrónico del paciente'}
                </label>
                <div className="flex gap-2">
                  <input
                    type={searchType === 'dni' ? 'text' : 'email'}
                    inputMode={searchType === 'dni' ? 'numeric' : 'email'}
                    placeholder={searchType === 'dni' ? '12345678' : 'estudiante@istta.edu.pe'}
                    value={searchTerm}
                    onChange={(e) => {
                      if (searchType === 'dni') {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setSearchTerm(value);
                      } else {
                        setSearchTerm(e.target.value);
                      }
                      setError(null);
                    }}
                    onKeyPress={(e) => {
                      if (searchType === 'dni' && !/[0-9]/.test(e.key) && e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                        e.preventDefault();
                      }
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    maxLength={searchType === 'dni' ? 8 : undefined}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300 focus:outline-none"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-xs sm:text-sm self-end"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        <span className="hidden sm:inline">Buscando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Buscar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de pacientes - Diseño mejorado, compacto y responsivo */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200 w-full">
            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-slate-700">
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">DNI</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Nombre Completo</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Correo</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Estado</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-slate-400" />
                          <span className="text-sm font-medium">Cargando pacientes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                        <span className="text-sm font-medium">No se encontraron pacientes</span>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                        <td className="px-2 py-2.5 font-semibold text-xs text-slate-900 text-center">{patient.dni}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-700 text-center">{patient.name}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 text-center">{patient.email}</td>
                        <td className="px-2 py-2.5 text-center">
                          {getStatusBadge(patient.active)}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
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
                                    
                                    const dataKey = `${patient.id}-${res.data.dni || ''}-${res.data.email || ''}`;
                                    
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
                              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Modificar paciente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPatientToDeleteId(patient.id);
                                setDeleteConfirmationOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              title="Eliminar paciente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para pantallas pequeñas */}
            <div className="md:hidden">
              {loading ? (
                <div className="p-6 text-center text-slate-500">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-slate-400" />
                    <span className="text-sm font-medium">Cargando pacientes...</span>
                  </div>
                </div>
              ) : patients.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <span className="text-sm font-medium">No se encontraron pacientes</span>
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {patients.map((patient) => (
                    <div key={patient.id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{patient.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">DNI: {patient.dni}</p>
                          <p className="text-xs sm:text-sm text-slate-600 truncate">{patient.email}</p>
                        </div>
                        <div className="sm:ml-2 flex-shrink-0 self-start sm:self-auto">
                          {getStatusBadge(patient.active)}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 sm:pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setDetailsModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
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
                                
                                const dataKey = `${patient.id}-${res.data.dni || ''}-${res.data.email || ''}`;
                                
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
                          className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Modificar paciente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPatientToDeleteId(patient.id);
                            setDeleteConfirmationOpen(true);
                          }}
                          className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                          title="Eliminar paciente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paginación - Responsiva */}
          {patients.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 sm:space-x-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  className="px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 w-full sm:w-auto"
                >
                  Anterior
                </Button>
                <span className="px-2 sm:px-4 py-1 text-xs sm:text-sm text-slate-700 font-semibold text-center whitespace-nowrap">
                  <span className="hidden sm:inline">Página {currentPage} de {totalPages} (10 por página)</span>
                  <span className="sm:hidden">{currentPage}/{totalPages}</span>
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  className="px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 w-full sm:w-auto"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Información de resultados - Responsiva */}
          {!loading && (
            <div className="text-center mt-3 text-xs sm:text-sm text-slate-600 px-2">
              <span className="block sm:inline">Mostrando {patients.length} paciente{patients.length !== 1 ? 's' : ''}</span>
              {totalPages > 1 && (
                <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1">
                  <span className="hidden sm:inline">(página {currentPage} de {totalPages}, 10 por página)</span>
                  <span className="sm:hidden"> - Pág. {currentPage}/{totalPages}</span>
                </span>
              )}
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

      {/* Modal de confirmación de eliminación - Solo renderizar si está abierto - Responsivo */}
      {deleteConfirmationOpen && patientToDeleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-full sm:max-w-md w-full overflow-hidden border border-red-200 mx-2 sm:mx-4">
            {/* Header rojo */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-center text-white mb-1.5 sm:mb-2">
                ¿Desactivar esta cuenta?
              </h3>
              <p className="text-xs sm:text-sm text-red-100 text-center">
                Esta acción desactivará la cuenta del paciente
              </p>
            </div>
            
            {/* Body */}
            <div className="p-4 sm:p-5 md:p-6 bg-white">
              <p className="text-xs sm:text-sm text-gray-700 text-center mb-4 sm:mb-6 leading-relaxed">
                La cuenta se desactivará y se enviará un mensaje tanto al usuario como al administrador. El paciente no podrá acceder al sistema hasta que sea reactivado.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl font-semibold w-full sm:w-auto"
                  onClick={() => {
                    setDeleteConfirmationOpen(false);
                    setPatientToDeleteId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl w-full sm:w-auto"
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
        </div>
      )}
    </>
  );
};

export default PatientList;