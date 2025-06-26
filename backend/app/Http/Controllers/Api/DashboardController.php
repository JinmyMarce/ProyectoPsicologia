<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use App\Models\PsychologicalSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas del dashboard para estudiantes
     */
    public function studentDashboard(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            // Citas del estudiante
            $totalAppointments = Cita::where('student_id', $user->id)->count();
            $pendingAppointments = Cita::where('student_id', $user->id)
                ->where('estado', 'pendiente')->count();
            $completedAppointments = Cita::where('student_id', $user->id)
                ->where('estado', 'completada')->count();
            $cancelledAppointments = Cita::where('student_id', $user->id)
                ->where('estado', 'cancelada')->count();

            // Próximas citas
            $upcomingAppointments = Cita::with(['psychologist'])
                ->where('student_id', $user->id)
                ->where('estado', 'pendiente')
                ->where('fecha', '>=', Carbon::today())
                ->orderBy('fecha')
                ->orderBy('hora')
                ->limit(5)
                ->get();

            // Historial reciente
            $recentAppointments = Cita::with(['psychologist'])
                ->where('student_id', $user->id)
                ->where('estado', 'completada')
                ->orderBy('fecha', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_appointments' => $totalAppointments,
                        'pending_appointments' => $pendingAppointments,
                        'completed_appointments' => $completedAppointments,
                        'cancelled_appointments' => $cancelledAppointments,
                    ],
                    'upcoming_appointments' => $upcomingAppointments,
                    'recent_appointments' => $recentAppointments,
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
     * Obtener estadísticas del dashboard para psicólogos
     */
    public function psychologistDashboard(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user || $user->role !== 'psychologist') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            // Citas del psicólogo
            $totalAppointments = Cita::where('psychologist_id', $user->id)->count();
            $pendingAppointments = Cita::where('psychologist_id', $user->id)
                ->where('estado', 'pendiente')->count();
            $completedAppointments = Cita::where('psychologist_id', $user->id)
                ->where('estado', 'completada')->count();
            $todayAppointments = Cita::where('psychologist_id', $user->id)
                ->where('fecha', Carbon::today())
                ->where('estado', '!=', 'cancelada')
                ->count();

            // Próximas citas
            $upcomingAppointments = Cita::with(['student'])
                ->where('psychologist_id', $user->id)
                ->where('estado', 'pendiente')
                ->where('fecha', '>=', Carbon::today())
                ->orderBy('fecha')
                ->orderBy('hora')
                ->limit(5)
                ->get();

            // Sesiones psicológicas
            $totalSessions = PsychologicalSession::where('psychologist_id', $user->id)->count();
            $completedSessions = PsychologicalSession::where('psychologist_id', $user->id)
                ->where('estado', 'completada')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_appointments' => $totalAppointments,
                        'pending_appointments' => $pendingAppointments,
                        'completed_appointments' => $completedAppointments,
                        'today_appointments' => $todayAppointments,
                        'total_sessions' => $totalSessions,
                        'completed_sessions' => $completedSessions,
                    ],
                    'upcoming_appointments' => $upcomingAppointments,
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
     * Obtener estadísticas del dashboard para super administrador
     */
    public function superAdminDashboard(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user || $user->role !== 'super_admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            // Estadísticas generales
            $totalStudents = User::where('role', 'student')->count();
            $totalPsychologists = User::where('role', 'psychologist')->count();
            $activePsychologists = User::where('role', 'psychologist')->where('active', true)->count();
            $totalAppointments = Cita::count();
            $pendingAppointments = Cita::where('estado', 'pendiente')->count();
            $completedAppointments = Cita::where('estado', 'completada')->count();

            // Citas recientes
            $recentAppointments = Cita::with(['student', 'psychologist'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Psicólogos más activos
            $topPsychologists = User::where('role', 'psychologist')
                ->where('active', true)
                ->withCount(['psychologistCitas as appointments' => function($query) {
                    $query->where('estado', 'completada');
                }])
                ->orderBy('appointments', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_students' => $totalStudents,
                        'total_psychologists' => $totalPsychologists,
                        'active_psychologists' => $activePsychologists,
                        'total_appointments' => $totalAppointments,
                        'pending_appointments' => $pendingAppointments,
                        'completed_appointments' => $completedAppointments,
                    ],
                    'recent_appointments' => $recentAppointments,
                    'top_psychologists' => $topPsychologists,
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
     * Obtener estadísticas del dashboard según el rol del usuario
     */
    public function dashboard(): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        switch ($user->role) {
            case 'student':
                return $this->studentDashboard();
            case 'psychologist':
                return $this->psychologistDashboard();
            case 'super_admin':
                return $this->superAdminDashboard();
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no soportado'
                ], 400);
        }
    }
} 