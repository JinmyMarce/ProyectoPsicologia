import { apiClient } from './apiClient';

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  psychologist_id?: string;
  student_id?: string;
  status?: string;
  type?: string;
}

export interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalPsychologists: number;
  activePsychologists: number;
  totalStudents: number;
  averageRating: number;
  monthlyData: {
    month: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }[];
  psychologistPerformance: {
    name: string;
    appointments: number;
    rating: number;
    completionRate: number;
  }[];
  appointmentTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export const reportService = {
  // Obtener datos de análisis general
  async getAnalytics(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/analytics?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener análisis');
    }
  },

  // Obtener reporte de citas
  async getAppointmentsReport(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/appointments?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de citas');
    }
  },

  // Obtener reporte de psicólogos
  async getPsychologistsReport(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/psychologists?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de psicólogos');
    }
  },

  // Obtener reporte de estudiantes
  async getStudentsReport(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/students?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de estudiantes');
    }
  },

  // Generar reporte en PDF
  async generatePDFReport(type: string, filters: ReportFilters = {}) {
    try {
      const response = await apiClient.post(`/reports/generate-pdf`, {
        type,
        filters
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al generar reporte PDF');
    }
  },

  // Generar reporte en Excel
  async generateExcelReport(type: string, filters: ReportFilters = {}) {
    try {
      const response = await apiClient.post(`/reports/generate-excel`, {
        type,
        filters
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al generar reporte Excel');
    }
  },

  // Obtener estadísticas de rendimiento
  async getPerformanceStats(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/performance?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de rendimiento');
    }
  },

  // Obtener tendencias de citas
  async getAppointmentTrends(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/trends?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tendencias');
    }
  },

  // Obtener reporte de ingresos (si aplica)
  async getRevenueReport(filters: ReportFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/reports/revenue?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de ingresos');
    }
  },

  // Programar reporte automático
  async scheduleReport(scheduleData: {
    type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    email: string;
    filters: ReportFilters;
  }) {
    try {
      const response = await apiClient.post('/reports/schedule', scheduleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al programar reporte');
    }
  },

  // Obtener reportes programados
  async getScheduledReports() {
    try {
      const response = await apiClient.get('/reports/scheduled');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reportes programados');
    }
  },

  // Cancelar reporte programado
  async cancelScheduledReport(id: string) {
    try {
      const response = await apiClient.delete(`/reports/scheduled/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cancelar reporte programado');
    }
  }
}; 