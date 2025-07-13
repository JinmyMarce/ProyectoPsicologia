export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin' | 'super_admin';
  specialization?: string;
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  career?: string;
  semester?: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  psychologistId: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface Psychologist extends User {
  role: 'psychologist';
  specialization: string;
  rating?: number;
  total_appointments?: number;
  completed_appointments?: number;
}

export interface PsychologistHistory {
  id: string;
  psychologist_id: string;
  action: string;
  reason: string;
  performed_by: string;
  created_at: string;
  updated_at: string;
  psychologist?: Psychologist;
  performedBy?: User;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Student extends User {
  role: 'student';
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'appointment' | 'reminder' | 'status' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Report {
  id: string;
  title: string;
  type: 'appointments' | 'psychologists' | 'students' | 'analytics';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface SuperAdmin extends User {
  role: 'super_admin';
}

export interface Cita {
  id: string;
  student_id: string;
  psychologist_id: string;
  schedule_id?: string;
  fecha: string;
  hora: string;
  duracion: number;
  tipo: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';
  motivo?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  psychologist?: Psychologist;
  schedule?: Schedule;
}

export interface Schedule {
  id: string;
  psychologist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_blocked: boolean;
  block_reason?: string;
  created_at: string;
  updated_at: string;
  psychologist?: Psychologist;
  appointments?: Cita[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'student' | 'psychologist';
  specialization?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'psychologist' | 'admin' | 'super_admin';
  specialization?: string;
  verified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  specialization?: string;
  verified?: boolean;
  active?: boolean;
}

export interface CreateCitaData {
  psychologist_id: string;
  schedule_id?: string;
  fecha: string;
  hora: string;
  duracion: number;
  tipo: string;
  motivo?: string;
  notas?: string;
}

export interface UpdateCitaData {
  fecha?: string;
  hora?: string;
  duracion?: number;
  tipo?: string;
  estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';
  motivo?: string;
  notas?: string;
}

export interface CreateScheduleData {
  psychologist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

export interface UpdateScheduleData {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  is_blocked?: boolean;
}

export interface CreateNotificationData {
  user_id: string;
  type: 'appointment' | 'reminder' | 'status' | 'system';
  title: string;
  message: string;
}

export interface UserFilters {
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CitaFilters {
  date_from?: string;
  date_to?: string;
  psychologist_id?: string;
  student_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface ScheduleFilters {
  psychologist_id?: string;
  date_from?: string;
  date_to?: string;
  is_available?: boolean;
  is_blocked?: boolean;
}

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  page?: number;
  per_page?: number;
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  psychologist_id?: string;
  student_id?: string;
  status?: string;
  type?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
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

export interface PerformanceStats {
  id: string;
  name: string;
  email: string;
  specialization: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  completion_rate: number;
  cancellation_rate: number;
  average_rating: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_type: {
    appointment: number;
    reminder: number;
    status: number;
    system: number;
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  by_role: {
    students: number;
    psychologists: number;
    admins: number;
    super_admins: number;
  };
}

export interface ScheduleStats {
  total_slots: number;
  available_slots: number;
  blocked_slots: number;
  booked_slots: number;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'time' | 'number' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: any;
}

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  features: {
    notifications: boolean;
    reports: boolean;
    schedule: boolean;
    googleAuth: boolean;
  };
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  status_updates: boolean;
  system_notifications: boolean;
  language: string;
  timezone: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  psychologist?: Psychologist;
  student?: Student;
  status: string;
}

export interface NotificationEvent {
  type: 'appointment' | 'reminder' | 'status' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}