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

class ExportController extends Controller
{
    /**
     * Exportar citas a CSV
     */
    public function exportAppointments(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $query = Cita::with(['student', 'psychologist']);

            // Filtrar por rol del usuario
            if ($user->role === 'student') {
                $query->where('student_id', $user->id);
            } elseif ($user->role === 'psychologist') {
                $query->where('psychologist_id', $user->id);
            }

            // Aplicar filtros
            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha', '<=', $request->date_to);
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            $appointments = $query->orderBy('fecha', 'desc')->get();

            // Preparar datos para CSV
            $csvData = [];
            $csvData[] = ['ID', 'Estudiante', 'Psicólogo', 'Fecha', 'Hora', 'Motivo', 'Estado', 'Notas', 'Creado'];

            foreach ($appointments as $appointment) {
                $csvData[] = [
                    $appointment->id,
                    $appointment->student->name ?? 'N/A',
                    $appointment->psychologist->name ?? 'N/A',
                    $appointment->fecha,
                    $appointment->hora,
                    $appointment->motivo_consulta,
                    $appointment->estado,
                    $appointment->notas ?? '',
                    $appointment->created_at->format('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $csvData,
                'filename' => 'citas_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar psicólogos a CSV
     */
    public function exportPsychologists(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            $query = User::where('role', 'psychologist');

            // Aplicar filtros
            if ($request->has('active') && $request->active !== null) {
                $query->where('active', $request->active);
            }

            if ($request->has('verified') && $request->verified !== null) {
                $query->where('verified', $request->verified);
            }

            $psychologists = $query->orderBy('name')->get();

            // Preparar datos para CSV
            $csvData = [];
            $csvData[] = ['ID', 'Nombre', 'Email', 'Especialidad', 'Rating', 'Citas Totales', 'Verificado', 'Activo', 'Creado'];

            foreach ($psychologists as $psychologist) {
                $csvData[] = [
                    $psychologist->id,
                    $psychologist->name,
                    $psychologist->email,
                    $psychologist->specialization ?? 'N/A',
                    $psychologist->rating ?? 0,
                    $psychologist->total_appointments ?? 0,
                    $psychologist->verified ? 'Sí' : 'No',
                    $psychologist->active ? 'Sí' : 'No',
                    $psychologist->created_at->format('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $csvData,
                'filename' => 'psicologos_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar sesiones psicológicas a CSV
     */
    public function exportSessions(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $query = PsychologicalSession::with(['patient', 'psychologist']);

            // Filtrar por rol del usuario
            if ($user->role === 'student') {
                $query->where('patient_id', $user->id);
            } elseif ($user->role === 'psychologist') {
                $query->where('psychologist_id', $user->id);
            }

            // Aplicar filtros
            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha', '<=', $request->date_to);
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            $sessions = $query->orderBy('fecha', 'desc')->get();

            // Preparar datos para CSV
            $csvData = [];
            $csvData[] = ['ID', 'Paciente', 'Psicólogo', 'Fecha', 'Hora', 'Duración', 'Tipo Sesión', 'Motivo', 'Estado', 'Creado'];

            foreach ($sessions as $session) {
                $csvData[] = [
                    $session->id,
                    $session->patient->name ?? 'N/A',
                    $session->psychologist->name ?? 'N/A',
                    $session->fecha,
                    $session->hora,
                    $session->duracion . ' min',
                    $session->tipo_sesion,
                    $session->motivo_consulta,
                    $session->estado,
                    $session->created_at->format('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $csvData,
                'filename' => 'sesiones_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar reporte general del sistema
     */
    public function exportSystemReport(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
            $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

            // Estadísticas generales
            $stats = [
                'total_students' => User::where('role', 'student')->count(),
                'total_psychologists' => User::where('role', 'psychologist')->count(),
                'active_psychologists' => User::where('role', 'psychologist')->where('active', true)->count(),
                'total_appointments' => Cita::whereBetween('fecha', [$dateFrom, $dateTo])->count(),
                'completed_appointments' => Cita::whereBetween('fecha', [$dateFrom, $dateTo])->where('estado', 'completada')->count(),
                'cancelled_appointments' => Cita::whereBetween('fecha', [$dateFrom, $dateTo])->where('estado', 'cancelada')->count(),
                'total_sessions' => PsychologicalSession::whereBetween('fecha', [$dateFrom, $dateTo])->count(),
                'completed_sessions' => PsychologicalSession::whereBetween('fecha', [$dateFrom, $dateTo])->where('estado', 'completada')->count(),
            ];

            // Top psicólogos
            $topPsychologists = User::where('role', 'psychologist')
                ->where('active', true)
                ->withCount(['psychologistCitas as appointments' => function($query) use ($dateFrom, $dateTo) {
                    $query->whereBetween('fecha', [$dateFrom, $dateTo]);
                }])
                ->orderBy('appointments', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ],
                    'statistics' => $stats,
                    'top_psychologists' => $topPsychologists,
                    'filename' => 'reporte_sistema_' . Carbon::now()->format('Y-m-d_H-i-s') . '.json'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }
} 