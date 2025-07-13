<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use App\Models\PsychologicalSession;
use App\Models\Notification;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PsychologistDashboardController extends Controller
{
    /**
     * Panel General - Vista consolidada de actividades del psicólogo
     */
    public function dashboard(): JsonResponse
    {
        try {
            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
                ], 403);
            }

            // Estadísticas del día
            $today = Carbon::today();
            $todayAppointments = Cita::where('psychologist_id', $psychologist->id)
                ->whereDate('fecha', $today)
                ->count();
            
            $todaySessions = PsychologicalSession::where('psychologist_id', $psychologist->id)
                ->whereDate('fecha_sesion', $today)
                ->count();

            // Citas pendientes de aprobación
            $pendingAppointments = Cita::where('psychologist_id', $psychologist->id)
                ->where('estado', 'pendiente')
                ->with(['student'])
                ->orderBy('fecha', 'asc')
                ->orderBy('hora', 'asc')
                ->get();

            // Próximas citas confirmadas
            $upcomingAppointments = Cita::where('psychologist_id', $psychologist->id)
                ->where('estado', 'confirmada')
                ->where('fecha', '>=', $today)
                ->with(['student'])
                ->orderBy('fecha', 'asc')
                ->orderBy('hora', 'asc')
                ->limit(5)
                ->get();

            // Sesiones de hoy
            $todaySessionsList = PsychologicalSession::where('psychologist_id', $psychologist->id)
                ->whereDate('fecha_sesion', $today)
                ->with(['patient'])
                ->orderBy('fecha_sesion', 'asc')
                ->get();

            // Notificaciones no leídas
            $unreadNotifications = Notification::where('user_id', $psychologist->id)
                ->where('read', false)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Estadísticas del mes
            $monthStart = Carbon::now()->startOfMonth();
            $monthEnd = Carbon::now()->endOfMonth();
            
            $monthlyStats = [
                'total_appointments' => Cita::where('psychologist_id', $psychologist->id)
                    ->whereBetween('fecha', [$monthStart, $monthEnd])
                    ->count(),
                'completed_sessions' => PsychologicalSession::where('psychologist_id', $psychologist->id)
                    ->where('estado', 'Realizada')
                    ->whereBetween('fecha_sesion', [$monthStart, $monthEnd])
                    ->count(),
                'total_patients' => Cita::where('psychologist_id', $psychologist->id)
                    ->whereBetween('fecha', [$monthStart, $monthEnd])
                    ->distinct('student_id')
                    ->count('student_id')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'today_stats' => [
                        'appointments' => $todayAppointments,
                        'sessions' => $todaySessions
                    ],
                    'pending_appointments' => $pendingAppointments,
                    'upcoming_appointments' => $upcomingAppointments,
                    'today_sessions' => $todaySessionsList,
                    'unread_notifications' => $unreadNotifications,
                    'monthly_stats' => $monthlyStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos del dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aprobar una cita pendiente
     */
    public function approveAppointment(Request $request, $appointmentId): JsonResponse
    {
        try {
            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden aprobar citas.'
                ], 403);
            }

            $cita = Cita::where('id', $appointmentId)
                ->where('psychologist_id', $psychologist->id)
                ->where('estado', 'pendiente')
                ->with(['student'])
                ->first();

            if (!$cita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada o no está pendiente'
                ], 404);
            }

            $cita->update(['estado' => 'confirmada']);

            // Crear notificación para el estudiante
            Notification::create([
                'user_id' => $cita->student_id,
                'type' => 'appointment',
                'title' => 'Cita Aprobada',
                'message' => "Tu cita del {$cita->fecha->format('d/m/Y')} a las {$cita->hora->format('H:i')} ha sido aprobada por el psicólogo.",
                'data' => [
                    'appointment_id' => $cita->id,
                    'status' => 'confirmed'
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cita aprobada exitosamente',
                'data' => $cita->load(['student'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al aprobar la cita: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechazar una cita pendiente con motivo
     */
    public function rejectAppointment(Request $request, $appointmentId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rejection_reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden rechazar citas.'
                ], 403);
            }

            $cita = Cita::where('id', $appointmentId)
                ->where('psychologist_id', $psychologist->id)
                ->where('estado', 'pendiente')
                ->with(['student'])
                ->first();

            if (!$cita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada o no está pendiente'
                ], 404);
            }

            $cita->update([
                'estado' => 'cancelada',
                'notas' => "Rechazada por el psicólogo. Motivo: {$request->rejection_reason}"
            ]);

            // Crear notificación para el estudiante
            Notification::create([
                'user_id' => $cita->student_id,
                'type' => 'appointment',
                'title' => 'Cita Rechazada',
                'message' => "Tu cita del {$cita->fecha->format('d/m/Y')} a las {$cita->hora->format('H:i')} ha sido rechazada. Motivo: {$request->rejection_reason}",
                'data' => [
                    'appointment_id' => $cita->id,
                    'status' => 'rejected',
                    'reason' => $request->rejection_reason
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cita rechazada exitosamente',
                'data' => $cita->load(['student'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al rechazar la cita: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agendar cita directamente para un estudiante
     */
    public function scheduleAppointmentForStudent(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_identifier' => 'required|string', // DNI o email
                'fecha' => 'required|date|after:today',
                'hora' => 'required|date_format:H:i',
                'duracion' => 'required|integer|min:30|max:120',
                'motivo_consulta' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden agendar citas.'
                ], 403);
            }

            // Buscar estudiante por DNI o email
            $student = User::where('role', 'student')
                ->where(function($query) use ($request) {
                    $query->where('dni', $request->student_identifier)
                          ->orWhere('email', $request->student_identifier);
                })
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estudiante no encontrado'
                ], 404);
            }

            // Verificar disponibilidad
            $existingCita = Cita::where('psychologist_id', $psychologist->id)
                ->where('fecha', $request->fecha)
                ->where('hora', $request->hora)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($existingCita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una cita en ese horario'
                ], 422);
            }

            $cita = Cita::create([
                'student_id' => $student->id,
                'psychologist_id' => $psychologist->id,
                'fecha' => $request->fecha,
                'hora' => $request->hora,
                'duracion' => $request->duracion,
                'motivo_consulta' => $request->motivo_consulta,
                'estado' => 'confirmada', // Directamente confirmada
            ]);

            // Notificar al estudiante
            Notification::create([
                'user_id' => $student->id,
                'type' => 'appointment',
                'title' => 'Nueva Cita Agendada',
                'message' => "Se ha agendado una nueva cita para el {$cita->fecha->format('d/m/Y')} a las {$cita->hora->format('H:i')}.",
                'data' => [
                    'appointment_id' => $cita->id,
                    'status' => 'scheduled'
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cita agendada exitosamente',
                'data' => $cita->load(['student'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al agendar la cita: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar estudiante por DNI o email
     */
    public function searchStudent(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'identifier' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identificador requerido'
                ], 422);
            }

            $student = User::where('role', 'student')
                ->where(function($query) use ($request) {
                    $query->where('dni', 'like', '%' . $request->identifier . '%')
                          ->orWhere('email', 'like', '%' . $request->identifier . '%')
                          ->orWhere('name', 'like', '%' . $request->identifier . '%');
                })
                ->select('id', 'name', 'email', 'dni', 'career', 'semester', 'student_id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $student
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar estudiante: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista completa de pacientes con filtros
     */
    public function getPatients(Request $request): JsonResponse
    {
        try {
            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
                ], 403);
            }

            $query = User::where('role', 'student');

            // Filtros
            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%')
                      ->orWhere('dni', 'like', '%' . $request->search . '%')
                      ->orWhere('career', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->has('dni') && $request->dni) {
                $query->where('dni', 'like', '%' . $request->dni . '%');
            }

            if ($request->has('email') && $request->email) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }

            if ($request->has('career') && $request->career) {
                $query->where('career', 'like', '%' . $request->career . '%');
            }

            if ($request->has('semester') && $request->semester) {
                $query->where('semester', $request->semester);
            }

            // Agregar estadísticas de citas y sesiones
            $query->withCount(['citas as total_appointments', 'psychologicalSessions as total_sessions']);

            $perPage = $request->get('per_page', 15);
            $patients = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $patients->items(),
                'pagination' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'per_page' => $patients->perPage(),
                    'total' => $patients->total()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pacientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar nueva sesión psicológica
     */
    public function registerSession(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_dni' => 'required|string',
                'fecha_sesion' => 'required|date',
                'hora_sesion' => 'required|date_format:H:i',
                'duracion_minutos' => 'required|integer|min:15|max:300',
                'estado' => 'required|in:Programada,Realizada,Cancelada',
                'tipo_sesion' => 'nullable|string|max:100',
                'temas_tratados' => 'nullable|string',
                'notas' => 'nullable|string',
                'objetivos' => 'nullable|string',
                'conclusiones' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden registrar sesiones.'
                ], 403);
            }

            // Buscar paciente por DNI
            $patient = User::where('role', 'student')
                ->where('dni', $request->patient_dni)
                ->first();

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente no encontrado'
                ], 404);
            }

            // Combinar fecha y hora
            $fechaSesion = Carbon::parse($request->fecha_sesion . ' ' . $request->hora_sesion);

            $session = PsychologicalSession::create([
                'patient_id' => $patient->id,
                'psychologist_id' => $psychologist->id,
                'fecha_sesion' => $fechaSesion,
                'duracion_minutos' => $request->duracion_minutos,
                'estado' => $request->estado,
                'tipo_sesion' => $request->tipo_sesion,
                'temas_tratados' => $request->temas_tratados,
                'notas' => $request->notas,
                'objetivos' => $request->objetivos,
                'conclusiones' => $request->conclusiones
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesión registrada exitosamente',
                'data' => $session->load(['patient'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de sesiones con filtros
     */
    public function getSessionHistory(Request $request): JsonResponse
    {
        try {
            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
                ], 403);
            }

            $query = PsychologicalSession::where('psychologist_id', $psychologist->id)
                ->with(['patient']);

            // Filtros
            if ($request->has('patient_search') && $request->patient_search) {
                $query->whereHas('patient', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->patient_search . '%')
                      ->orWhere('dni', 'like', '%' . $request->patient_search . '%')
                      ->orWhere('email', 'like', '%' . $request->patient_search . '%')
                      ->orWhere('career', 'like', '%' . $request->patient_search . '%');
                });
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha_sesion', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha_sesion', '<=', $request->date_to . ' 23:59:59');
            }

            if ($request->has('tipo_sesion') && $request->tipo_sesion) {
                $query->where('tipo_sesion', 'like', '%' . $request->tipo_sesion . '%');
            }

            $perPage = $request->get('per_page', 15);
            $sessions = $query->orderBy('fecha_sesion', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $sessions->items(),
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial de sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de sesiones por estudiante
     */
    public function getStudentSessionStats(Request $request): JsonResponse
    {
        try {
            $psychologist = Auth::user();
            
            if (!$psychologist->isPsychologist()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'student_identifier' => 'required|string' // DNI, email o programa
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identificador de estudiante requerido'
                ], 422);
            }

            $students = User::where('role', 'student')
                ->where(function($query) use ($request) {
                    $query->where('dni', 'like', '%' . $request->student_identifier . '%')
                          ->orWhere('email', 'like', '%' . $request->student_identifier . '%')
                          ->orWhere('career', 'like', '%' . $request->student_identifier . '%');
                })
                ->withCount(['psychologicalSessions as total_sessions'])
                ->with(['psychologicalSessions' => function($query) {
                    $query->orderBy('fecha_sesion', 'desc');
                }])
                ->get();

            $stats = [];
            foreach ($students as $student) {
                $sessions = $student->psychologicalSessions;
                $stats[] = [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'dni' => $student->dni,
                        'email' => $student->email,
                        'career' => $student->career,
                        'semester' => $student->semester
                    ],
                    'total_sessions' => $student->total_sessions,
                    'sessions' => $sessions->map(function($session) {
                        return [
                            'id' => $session->id,
                            'fecha_sesion' => $session->fecha_sesion->format('d/m/Y H:i'),
                            'estado' => $session->estado,
                            'tipo_sesion' => $session->tipo_sesion,
                            'duracion_minutos' => $session->duracion_minutos,
                            'temas_tratados' => $session->temas_tratados
                        ];
                    })
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
} 