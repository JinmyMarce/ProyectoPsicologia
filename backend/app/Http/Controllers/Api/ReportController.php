<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function analytics(Request $request)
    {
        try {
        // Soporte para parámetro 'range' (por ejemplo, '7d')
        $range = $request->get('range');
        if ($range && preg_match('/^(\d+)d$/', $range, $matches)) {
            $days = (int)$matches[1];
            $dateTo = Carbon::now();
            $dateFrom = Carbon::now()->subDays($days - 1)->startOfDay();
        } else {
            $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
            $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());
        }

            // Convertir a Carbon si son strings
            if (is_string($dateFrom)) {
                $dateFrom = Carbon::parse($dateFrom)->startOfDay();
            }
            if (is_string($dateTo)) {
                $dateTo = Carbon::parse($dateTo)->endOfDay();
            }

        // Estadísticas generales
        $totalAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])->count();
        $completedAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'completada')->count();
        $cancelledAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'cancelada')->count();
        $pendingAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'pendiente')->count();

            // Si es admin, excluir super_admin de las estadísticas
            $user = Auth::user();
            $userQuery = User::query();
            if ($user && $user->role === 'admin') {
                $userQuery->where('role', '!=', 'super_admin');
            }

            $totalPsychologists = (clone $userQuery)->where('role', 'psychologist')->count();
            $activePsychologists = (clone $userQuery)->where('role', 'psychologist')->where('active', true)->count();
            $totalStudents = (clone $userQuery)->where('role', 'student')->count();

        // Datos mensuales
        $monthlyData = Cita::selectRaw('
            DATE_FORMAT(fecha, "%Y-%m") as month,
            COUNT(*) as appointments,
            SUM(CASE WHEN estado = "completada" THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN estado = "cancelada" THEN 1 ELSE 0 END) as cancelled
        ')
        ->whereBetween('fecha', [$dateFrom, $dateTo])
        ->groupBy('month')
        ->orderBy('month')
        ->get();

            // Rendimiento de psicólogos - usar psychologistCitas en lugar de citas
            $psychologistQuery = (clone $userQuery)->where('role', 'psychologist')->where('active', true);
            $psychologistPerformance = $psychologistQuery
                ->withCount(['psychologistCitas as appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo]);
            }])
                ->withCount(['psychologistCitas as completed_appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo])
                      ->where('estado', 'completada');
            }])
            ->get()
            ->map(function($psychologist) {
                $completionRate = $psychologist->appointments > 0 
                    ? ($psychologist->completed_appointments / $psychologist->appointments) * 100 
                    : 0;
                
                return [
                    'name' => $psychologist->name,
                        'appointments' => $psychologist->appointments ?? 0,
                    'rating' => 4.5, // Mock rating
                    'completionRate' => round($completionRate, 2)
                ];
            });

            // Tipos de citas - verificar si existe el campo tipo
            $appointmentTypes = [];
            try {
        $appointmentTypes = Cita::selectRaw('
                    COALESCE(tipo, "general") as type,
            COUNT(*) as count
        ')
        ->whereBetween('fecha', [$dateFrom, $dateTo])
        ->groupBy('tipo')
        ->get()
        ->map(function($type) use ($totalAppointments) {
            $percentage = $totalAppointments > 0 ? ($type->count / $totalAppointments) * 100 : 0;
            return [
                        'type' => $type->type ?? 'general',
                'count' => $type->count,
                'percentage' => round($percentage, 2)
            ];
        });
            } catch (\Exception $e) {
                // Si el campo tipo no existe, usar un valor por defecto
                Log::warning('Campo tipo no encontrado en citas: ' . $e->getMessage());
                $appointmentTypes = [[
                    'type' => 'general',
                    'count' => $totalAppointments,
                    'percentage' => 100
                ]];
            }

        return response()->json([
            'success' => true,
            'data' => [
                'totalAppointments' => $totalAppointments,
                'completedAppointments' => $completedAppointments,
                'cancelledAppointments' => $cancelledAppointments,
                'pendingAppointments' => $pendingAppointments,
                'totalPsychologists' => $totalPsychologists,
                'activePsychologists' => $activePsychologists,
                'totalStudents' => $totalStudents,
                'averageRating' => 4.2, // Mock rating
                'monthlyData' => $monthlyData,
                'psychologistPerformance' => $psychologistPerformance,
                'appointmentTypes' => $appointmentTypes
            ]
        ]);
        } catch (\Exception $e) {
            Log::error('Error en ReportController@analytics: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function appointments(Request $request)
    {
        $query = Cita::with(['psychologist', 'student']);

        // Filtros
        if ($request->has('date_from') && $request->date_from) {
            $query->where('fecha', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('fecha', '<=', $request->date_to);
        }

        if ($request->has('psychologist_id') && $request->psychologist_id) {
            $query->where('psychologist_id', $request->psychologist_id);
        }

        if ($request->has('student_id') && $request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('estado', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $appointments = $query->orderBy('fecha', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'pagination' => [
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
                'per_page' => $appointments->perPage(),
                'total' => $appointments->total(),
            ]
        ]);
    }

    public function psychologists(Request $request)
    {
        $query = User::where('role', 'psychologist')->withCount('citas');

        // Filtros
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->withCount(['citas as appointments_in_period' => function($q) use ($request) {
                $q->where('fecha', '>=', $request->date_from);
            }]);
        }

        $perPage = $request->get('per_page', 15);
        $psychologists = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $psychologists->items(),
            'pagination' => [
                'current_page' => $psychologists->currentPage(),
                'last_page' => $psychologists->lastPage(),
                'per_page' => $psychologists->perPage(),
                'total' => $psychologists->total(),
            ]
        ]);
    }

    public function students(Request $request)
    {
        $query = User::where('role', 'student')->withCount('citas');

        // Filtros
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->withCount(['citas as appointments_in_period' => function($q) use ($request) {
                $q->where('fecha', '>=', $request->date_from);
            }]);
        }

        $perPage = $request->get('per_page', 15);
        $students = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $students->items(),
            'pagination' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ]
        ]);
    }

    public function generatePDF(Request $request)
    {
        try {
            // Validar request
            try {
                $validator = $request->validate([
                    'type' => 'required|in:appointments,psychologists,students,analytics',
                    'filters' => 'array'
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('Error de validación en generatePDF: ' . json_encode($e->errors()));
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $e->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener y validar rango de fechas
            $range = $request->input('filters.range', 'month');
            $rangeMap = ['week' => '7d', 'month' => '30d', 'quarter' => '90d', 'year' => '365d'];
            $rangeValue = $rangeMap[$range] ?? '30d';

            // Calcular fechas dinámicamente con validación
            try {
                if (preg_match('/^(\d+)d$/', $rangeValue, $matches)) {
                    $days = (int)$matches[1];
                    if ($days <= 0 || $days > 3650) {
                        throw new \Exception('Rango de días inválido');
                    }
                    $dateTo = Carbon::now();
                    $dateFrom = Carbon::now()->subDays($days - 1)->startOfDay();
                } else {
                    $dateFrom = Carbon::now()->startOfMonth();
                    $dateTo = Carbon::now()->endOfMonth();
                }
            } catch (\Exception $e) {
                Log::error('Error calculando fechas: ' . $e->getMessage());
                $dateFrom = Carbon::now()->startOfMonth();
                $dateTo = Carbon::now()->endOfMonth();
            }

            // Obtener estadísticas de citas dinámicamente con manejo de errores
            try {
                $totalAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])->count();
                $completedAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
                    ->where('estado', 'completada')->count();
                $cancelledAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
                    ->where('estado', 'cancelada')->count();
                $pendingAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
                    ->where('estado', 'pendiente')->count();
            } catch (\Exception $e) {
                Log::error('Error obteniendo estadísticas de citas: ' . $e->getMessage());
                $totalAppointments = 0;
                $completedAppointments = 0;
                $cancelledAppointments = 0;
                $pendingAppointments = 0;
            }

            // Obtener estadísticas de usuarios dinámicamente con manejo de errores
            $getBaseQuery = function() use ($user) {
                try {
                    $query = User::query();
                    if ($user && $user->role === 'admin') {
                        $query->where('role', '!=', 'super_admin');
                    }
                    return $query;
                } catch (\Exception $e) {
                    Log::error('Error creando query base: ' . $e->getMessage());
                    return User::query();
                }
            };
            
            try {
                $userStats = [
                    'total_users' => $getBaseQuery()->count(),
                    'active_users' => $getBaseQuery()->where('active', true)->count(),
                    'inactive_users' => $getBaseQuery()->where('active', false)->count(),
                    'verified_users' => $getBaseQuery()->where('verified', true)->count(),
                    'by_role' => [
                        'students' => $getBaseQuery()->where('role', 'student')->count(),
                        'psychologists' => $getBaseQuery()->where('role', 'psychologist')->count(),
                        'admins' => $getBaseQuery()->where('role', 'admin')->count(),
                    ]
                ];
            } catch (\Exception $e) {
                Log::error('Error obteniendo estadísticas de usuarios: ' . $e->getMessage());
                $userStats = [
                    'total_users' => 0,
                    'active_users' => 0,
                    'inactive_users' => 0,
                    'verified_users' => 0,
                    'by_role' => [
                        'students' => 0,
                        'psychologists' => 0,
                        'admins' => 0,
                    ]
                ];
            }

            // Obtener datos mensuales dinámicamente
            $monthlyData = collect([]);
            try {
                $monthlyData = Cita::selectRaw('
                    DATE_FORMAT(fecha, "%Y-%m") as month,
                    COUNT(*) as appointments,
                    SUM(CASE WHEN estado = "completada" THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN estado = "cancelada" THEN 1 ELSE 0 END) as cancelled
                ')
                ->whereBetween('fecha', [$dateFrom, $dateTo])
                ->groupBy('month')
                ->orderBy('month')
                ->get();
            } catch (\Exception $e) {
                Log::warning('Error obteniendo datos mensuales: ' . $e->getMessage());
                $monthlyData = collect([]);
            }

            // Obtener top psicólogos dinámicamente
            $psychologistPerformance = [];
            try {
                $psychologistQuery = $getBaseQuery()->where('role', 'psychologist')->where('active', true);
                $psychologistPerformance = $psychologistQuery
                    ->withCount(['psychologistCitas as appointments' => function($query) use ($dateFrom, $dateTo) {
                        try {
                            $query->whereBetween('fecha', [$dateFrom, $dateTo]);
                        } catch (\Exception $e) {
                            Log::error('Error en withCount appointments: ' . $e->getMessage());
                        }
                    }])
                    ->withCount(['psychologistCitas as completed_appointments' => function($query) use ($dateFrom, $dateTo) {
                        try {
                            $query->whereBetween('fecha', [$dateFrom, $dateTo])
                                  ->where('estado', 'completada');
                        } catch (\Exception $e) {
                            Log::error('Error en withCount completed: ' . $e->getMessage());
                        }
                    }])
                    ->get()
                    ->map(function($psychologist) {
                        try {
                            $appointments = $psychologist->appointments ?? 0;
                            $completed = $psychologist->completed_appointments ?? 0;
                            $completionRate = $appointments > 0 
                                ? ($completed / $appointments) * 100 
                                : 0;
                            
                            return [
                                'name' => htmlspecialchars($psychologist->name ?? 'Sin nombre', ENT_QUOTES, 'UTF-8'),
                                'appointments' => (int)$appointments,
                                'rating' => 4.5,
                                'completionRate' => round($completionRate, 2)
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error mapeando psicólogo: ' . $e->getMessage());
                            return null;
                        }
                    })
                    ->filter(function($psych) {
                        return $psych !== null && isset($psych['appointments']) && $psych['appointments'] > 0;
                    })
                    ->sort(function($a, $b) {
                        return ($b['appointments'] ?? 0) - ($a['appointments'] ?? 0);
                    })
                    ->take(5)
                    ->values()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning('Error obteniendo psicólogos: ' . $e->getMessage());
                Log::warning('Stack trace: ' . $e->getTraceAsString());
                $psychologistPerformance = [];
            }

            // Crear HTML para el PDF con validación y escape de datos
            try {
                $userName = htmlspecialchars($user->name ?? 'Administrador', ENT_QUOTES, 'UTF-8');
                $rangeDisplay = htmlspecialchars(ucfirst($range), ENT_QUOTES, 'UTF-8');
                $totalUsers = (int)($userStats['total_users'] ?? 0);
                $activeUsers = (int)($userStats['active_users'] ?? 0);
                $students = (int)($userStats['by_role']['students'] ?? 0);
                $psychologists = (int)($userStats['by_role']['psychologists'] ?? 0);
                $completionRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 2) : 0;
                $cancellationRate = $totalAppointments > 0 ? round(($cancelledAppointments / $totalAppointments) * 100, 2) : 0;

                $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Administración</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1a202c; }
        h1 { color: #1e3a5f; border-bottom: 3px solid #1e3a5f; padding-bottom: 10px; }
        h2 { color: #2d3748; margin-top: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e0; padding: 8px; text-align: left; }
        th { background-color: #1e3a5f; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f7fafc; }
        .metric-box { display: inline-block; padding: 15px; margin: 10px; background: #edf2f7; border-left: 4px solid #1e3a5f; min-width: 150px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .metric-label { font-size: 12px; color: #718096; margin-top: 5px; }
        .header-info { background: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Reporte de Administración</h1>
    <div class="header-info">
        <p><strong>Fecha de generación:</strong> ' . htmlspecialchars(date('d/m/Y H:i:s'), ENT_QUOTES, 'UTF-8') . '</p>
        <p><strong>Período:</strong> ' . $rangeDisplay . '</p>
        <p><strong>Generado por:</strong> ' . $userName . '</p>
    </div>

    <h2>Resumen de Usuarios</h2>
    <div style="display: flex; flex-wrap: wrap;">
        <div class="metric-box">
            <div class="metric-value">' . $totalUsers . '</div>
            <div class="metric-label">Total Usuarios</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . $activeUsers . '</div>
            <div class="metric-label">Usuarios Activos</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . $students . '</div>
            <div class="metric-label">Estudiantes</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . $psychologists . '</div>
            <div class="metric-label">Psicólogos</div>
        </div>
    </div>

    <h2>Estadísticas de Citas</h2>
    <div style="display: flex; flex-wrap: wrap;">
        <div class="metric-box">
            <div class="metric-value">' . (int)$totalAppointments . '</div>
            <div class="metric-label">Total Citas</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . (int)$completedAppointments . '</div>
            <div class="metric-label">Completadas</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . (int)$pendingAppointments . '</div>
            <div class="metric-label">Pendientes</div>
        </div>
        <div class="metric-box">
            <div class="metric-value">' . (int)$cancelledAppointments . '</div>
            <div class="metric-label">Canceladas</div>
        </div>
    </div>
    <div style="margin-top: 15px; padding: 10px; background: #edf2f7; border-radius: 5px;">
        <p><strong>Tasa de completitud:</strong> ' . number_format($completionRate, 2) . '%</p>
        <p><strong>Tasa de cancelación:</strong> ' . number_format($cancellationRate, 2) . '%</p>
    </div>';

                // Agregar tabla de psicólogos top
                if (!empty($psychologistPerformance) && is_array($psychologistPerformance)) {
                    $html .= '<h2>Top Psicólogos por Rendimiento</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Psicólogo</th>
                                <th>Citas</th>
                                <th>Tasa de Completitud</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>';
                    
                    foreach ($psychologistPerformance as $psych) {
                        if (!is_array($psych) || !isset($psych['name'])) {
                            continue;
                        }
                        $html .= '<tr>
                            <td>' . htmlspecialchars($psych['name'], ENT_QUOTES, 'UTF-8') . '</td>
                            <td>' . (int)($psych['appointments'] ?? 0) . '</td>
                            <td>' . number_format($psych['completionRate'] ?? 0, 2) . '%</td>
                            <td>' . number_format($psych['rating'] ?? 0, 1) . '</td>
                        </tr>';
                    }
                    
                    $html .= '</tbody></table>';
                }

                // Agregar datos mensuales
                if ($monthlyData && $monthlyData->count() > 0) {
                    $html .= '<h2>Tendencias Mensuales</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Mes</th>
                                <th>Total Citas</th>
                                <th>Completadas</th>
                                <th>Canceladas</th>
                            </tr>
                        </thead>
                        <tbody>';
                    
                    foreach ($monthlyData as $month) {
                        $monthStr = is_object($month) ? ($month->month ?? '') : ($month['month'] ?? '');
                        $appointments = is_object($month) ? ($month->appointments ?? 0) : ($month['appointments'] ?? 0);
                        $completed = is_object($month) ? ($month->completed ?? 0) : ($month['completed'] ?? 0);
                        $cancelled = is_object($month) ? ($month->cancelled ?? 0) : ($month['cancelled'] ?? 0);
                        
                        try {
                            if ($monthStr && preg_match('/^\d{4}-\d{2}$/', $monthStr)) {
                                $monthDate = Carbon::createFromFormat('Y-m', $monthStr);
                                $monthName = $monthDate->format('F Y');
                                // Traducir mes al español
                                $meses = [
                                    'January' => 'Enero', 'February' => 'Febrero', 'March' => 'Marzo',
                                    'April' => 'Abril', 'May' => 'Mayo', 'June' => 'Junio',
                                    'July' => 'Julio', 'August' => 'Agosto', 'September' => 'Septiembre',
                                    'October' => 'Octubre', 'November' => 'Noviembre', 'December' => 'Diciembre'
                                ];
                                $monthName = str_replace(array_keys($meses), array_values($meses), $monthName);
                            } else {
                                $monthName = $monthStr ?: 'Desconocido';
                            }
                        } catch (\Exception $e) {
                            Log::warning('Error formateando mes: ' . $e->getMessage());
                            $monthName = $monthStr ?: 'Desconocido';
                        }
                        $html .= '<tr>
                            <td>' . htmlspecialchars(ucfirst($monthName), ENT_QUOTES, 'UTF-8') . '</td>
                            <td>' . (int)$appointments . '</td>
                            <td>' . (int)$completed . '</td>
                            <td>' . (int)$cancelled . '</td>
                        </tr>';
                    }
                    
                    $html .= '</tbody></table>';
                }

                $html .= '</body></html>';

                // Validar que el HTML no esté vacío
                if (empty(trim($html))) {
                    throw new \Exception('El HTML generado está vacío');
                }

                // Validar que DomPDF esté disponible
                if (!class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
                    throw new \Exception('La librería DomPDF no está instalada. Ejecuta: composer require barryvdh/laravel-dompdf');
                }

            } catch (\Exception $htmlError) {
                Log::error('Error generando HTML: ' . $htmlError->getMessage());
                Log::error('Stack trace: ' . $htmlError->getTraceAsString());
                throw new \Exception('Error al generar el contenido del reporte: ' . $htmlError->getMessage());
            }

            // Generar PDF
            try {
                $pdf = Pdf::loadHTML($html);
                $pdf->setPaper('a4', 'portrait');
                $pdf->setOption('enable-local-file-access', true);
                $pdf->setOption('isHtml5ParserEnabled', true);
                $filename = 'reporte_admin_' . date('Y-m-d_His') . '.pdf';
                
                return $pdf->download($filename);
            } catch (\Exception $pdfError) {
                Log::error('Error generando PDF con DomPDF: ' . $pdfError->getMessage());
                Log::error('Stack trace: ' . $pdfError->getTraceAsString());
                Log::error('HTML length: ' . strlen($html));
                Log::error('HTML preview (first 500 chars): ' . substr($html, 0, 500));
                
                // Intentar devolver un error más descriptivo
                return response()->json([
                    'success' => false,
                    'message' => 'Error al generar el PDF: ' . $pdfError->getMessage(),
                    'error' => $pdfError->getMessage(),
                    'error_type' => get_class($pdfError),
                    'hint' => 'Verifica que DomPDF esté instalado correctamente: composer require barryvdh/laravel-dompdf'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error generando PDF: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('File: ' . $e->getFile());
            Log::error('Line: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function generateExcel(Request $request)
    {
        $validator = $request->validate([
            'type' => 'required|in:appointments,psychologists,students,analytics',
            'filters' => 'array'
        ]);

        // Aquí se implementaría la generación de Excel
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Reporte Excel generado exitosamente',
            'download_url' => '/reports/download/mock-excel-report.xlsx'
        ]);
    }

    public function performance(Request $request)
    {
        $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
        $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

        $performance = User::where('role', 'psychologist')
            ->where('active', true)
            ->withCount(['citas as total_appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo]);
            }])
            ->withCount(['citas as completed_appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo])
                      ->where('estado', 'completada');
            }])
            ->withCount(['citas as cancelled_appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo])
                      ->where('estado', 'cancelada');
            }])
            ->get()
            ->map(function($psychologist) {
                $completionRate = $psychologist->total_appointments > 0 
                    ? ($psychologist->completed_appointments / $psychologist->total_appointments) * 100 
                    : 0;
                
                $cancellationRate = $psychologist->total_appointments > 0 
                    ? ($psychologist->cancelled_appointments / $psychologist->total_appointments) * 100 
                    : 0;

                return [
                    'id' => $psychologist->id,
                    'name' => $psychologist->name,
                    'email' => $psychologist->email,
                    'specialization' => $psychologist->specialization,
                    'total_appointments' => $psychologist->total_appointments,
                    'completed_appointments' => $psychologist->completed_appointments,
                    'cancelled_appointments' => $psychologist->cancelled_appointments,
                    'completion_rate' => round($completionRate, 2),
                    'cancellation_rate' => round($cancellationRate, 2),
                    'average_rating' => 4.5 // Mock rating
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    public function trends(Request $request)
    {
        $dateFrom = $request->get('date_from', Carbon::now()->subMonths(6));
        $dateTo = $request->get('date_to', Carbon::now());

        $trends = Cita::selectRaw('
            DATE_FORMAT(fecha, "%Y-%m") as month,
            COUNT(*) as total_appointments,
            SUM(CASE WHEN estado = "completada" THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN estado = "cancelada" THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN estado = "pendiente" THEN 1 ELSE 0 END) as pending
        ')
        ->whereBetween('fecha', [$dateFrom, $dateTo])
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $trends
        ]);
    }

    public function revenue(Request $request)
    {
        // Mock revenue data - en un sistema real esto vendría de transacciones
        $revenue = [
            'total_revenue' => 15000,
            'monthly_revenue' => [
                ['month' => '2024-01', 'revenue' => 2500],
                ['month' => '2024-02', 'revenue' => 2800],
                ['month' => '2024-03', 'revenue' => 3200],
                ['month' => '2024-04', 'revenue' => 2900],
                ['month' => '2024-05', 'revenue' => 3600],
            ],
            'by_psychologist' => [
                ['name' => 'Dr. García', 'revenue' => 4500],
                ['name' => 'Dra. López', 'revenue' => 3800],
                ['name' => 'Dr. Martínez', 'revenue' => 3200],
                ['name' => 'Dra. Rodríguez', 'revenue' => 3500],
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $revenue
        ]);
    }

    public function scheduleReport(Request $request)
    {
        $validator = $request->validate([
            'type' => 'required|in:appointments,psychologists,students,analytics',
            'frequency' => 'required|in:daily,weekly,monthly',
            'email' => 'required|email',
            'filters' => 'array'
        ]);

        // Aquí se implementaría la programación de reportes
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Reporte programado exitosamente'
        ]);
    }

    public function getScheduledReports()
    {
        // Mock scheduled reports
        $reports = [
            [
                'id' => 1,
                'type' => 'appointments',
                'frequency' => 'weekly',
                'email' => 'admin@example.com',
                'next_run' => '2024-01-15 09:00:00',
                'active' => true
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function cancelScheduledReport($id)
    {
        // Aquí se implementaría la cancelación del reporte programado
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Reporte programado cancelado exitosamente'
        ]);
    }

    // Nuevo endpoint para actividad reciente
    public function activity(Request $request)
    {
        // Últimas 10 citas y 10 usuarios creados
        $recentAppointments = \App\Models\Cita::orderBy('created_at', 'desc')->limit(10)->get();
        $recentUsers = \App\Models\User::orderBy('created_at', 'desc')->limit(10)->get();

        $activity = [];
        foreach ($recentAppointments as $cita) {
            $activity[] = [
                'type' => 'appointment',
                'id' => $cita->id,
                'fecha' => $cita->fecha,
                'hora' => $cita->hora,
                'estado' => $cita->estado,
                'created_at' => $cita->created_at,
                'student_id' => $cita->student_id,
                'psychologist_id' => $cita->psychologist_id,
            ];
        }
        foreach ($recentUsers as $user) {
            $activity[] = [
                'type' => 'user',
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ];
        }
        // Ordenar por fecha de creación descendente
        usort($activity, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        // Limitar a 15 actividades
        $activity = array_slice($activity, 0, 15);

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    // Estado general del sistema
    public function systemStatus(Request $request)
    {
        try {
            // Verificar que solo super_admin pueda acceder
            $user = Auth::user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo el superadministrador puede acceder a esta información.'
                ], 403);
            }

        // Uso de disco
        $diskTotal = disk_total_space(base_path());
        $diskFree = disk_free_space(base_path());
        $diskUsed = $diskTotal - $diskFree;
            $diskPercent = $diskTotal > 0 ? round(($diskUsed / $diskTotal) * 100, 2) : 0;

        // Memoria y CPU (solo para sistemas tipo Unix)
        $memory = null;
        $cpuLoad = null;
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
                try {
            $memory = shell_exec('free -m');
            $cpuLoad = sys_getloadavg();
                } catch (\Exception $e) {
                    // Ignorar errores de shell
                }
            } else {
                // Para Windows, intentar obtener información básica
                $memory = 'Windows - Información no disponible';
                $cpuLoad = 'Windows - Información no disponible';
        }

        // Uptime
        $uptime = null;
        if (file_exists('/proc/uptime')) {
                try {
                    $uptimeContent = file_get_contents('/proc/uptime');
                    $uptimeSeconds = (int)explode(' ', $uptimeContent)[0];
            $uptime = gmdate('H:i:s', $uptimeSeconds);
                } catch (\Exception $e) {
                    // Ignorar errores
                }
        }

        // Versiones
        $phpVersion = phpversion();
        $laravelVersion = app()->version();

        // Últimos errores del log
        $logPath = storage_path('logs/laravel.log');
        $lastErrors = [];
        if (file_exists($logPath)) {
                try {
            $lines = array_slice(file($logPath), -10);
            $lastErrors = array_map('trim', $lines);
                } catch (\Exception $e) {
                    // Ignorar errores de lectura
                }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'disk' => [
                    'total' => $diskTotal,
                    'used' => $diskUsed,
                    'free' => $diskFree,
                    'percent' => $diskPercent
                ],
                'memory' => $memory,
                'cpu' => $cpuLoad,
                'uptime' => $uptime,
                'php_version' => $phpVersion,
                'laravel_version' => $laravelVersion,
                'last_errors' => $lastErrors
            ]
        ]);
        } catch (\Exception $e) {
            Log::error('Error en systemStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el estado del sistema',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Descargar reporte general del sistema en PDF profesional
    public function downloadSystemReportPDF(Request $request)
    {
        try {
            // Verificar que solo super_admin pueda acceder
            $user = Auth::user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo el superadministrador puede descargar este reporte.'
                ], 403);
            }

            $statusResponse = $this->systemStatus($request);
            $statusData = $statusResponse->getData(true);
            
            if (!$statusData['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener datos del sistema'
                ], 500);
            }
            
            $status = $statusData['data'];
            
            // Crear HTML simple para el PDF
            $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte del Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1e3a5f; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1e3a5f; color: white; }
    </style>
</head>
<body>
    <h1>Reporte del Sistema</h1>
    <p><strong>Fecha:</strong> ' . date('Y-m-d H:i:s') . '</p>
    <h2>Estado del Servidor</h2>
    <table>
        <tr><th>Métrica</th><th>Valor</th></tr>
        <tr><td>Espacio en disco usado</td><td>' . number_format($status['disk']['used'] / 1024 / 1024 / 1024, 2) . ' GB</td></tr>
        <tr><td>Espacio en disco total</td><td>' . number_format($status['disk']['total'] / 1024 / 1024 / 1024, 2) . ' GB</td></tr>
        <tr><td>Porcentaje usado</td><td>' . $status['disk']['percent'] . '%</td></tr>
        <tr><td>PHP Version</td><td>' . $status['php_version'] . '</td></tr>
        <tr><td>Laravel Version</td><td>' . $status['laravel_version'] . '</td></tr>
        <tr><td>Uptime</td><td>' . ($status['uptime'] ?? 'N/A') . '</td></tr>
    </table>
    <h2>Últimos Errores</h2>
    <pre>' . implode("\n", array_slice($status['last_errors'], -5)) . '</pre>
</body>
</html>';
            
            $pdf = Pdf::loadHTML($html);
        return $pdf->download('reporte_general_sistema.pdf');
        } catch (\Exception $e) {
            Log::error('Error al generar PDF: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas para el dashboard de admin
     * Endpoint dinámico que devuelve estadísticas actualizadas
     */
    public function adminStats(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Función helper para crear query base (excluir super_admin si es admin)
            $getBaseQuery = function() use ($user) {
                $query = User::query();
                if ($user && $user->role === 'admin') {
                    $query->where('role', '!=', 'super_admin');
                }
                return $query;
            };

            // Obtener estadísticas de usuarios dinámicamente
            $totalUsers = $getBaseQuery()->count();
            $totalPsychologists = $getBaseQuery()->where('role', 'psychologist')->count();
            $totalStudents = $getBaseQuery()->where('role', 'student')->count();

            // Obtener estadísticas de citas dinámicamente (todas las citas, no solo del mes)
            $totalAppointments = Cita::count();
            $completedAppointments = Cita::where('estado', 'completada')->count();
            $pendingAppointments = Cita::where('estado', 'pendiente')->count();
            $cancelledAppointments = Cita::where('estado', 'cancelada')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'total_psychologists' => $totalPsychologists,
                    'total_students' => $totalStudents,
                    'total_appointments' => $totalAppointments,
                    'completed_appointments' => $completedAppointments,
                    'pending_appointments' => $pendingAppointments,
                    'cancelled_appointments' => $cancelledAppointments,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en ReportController@adminStats: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descargar PDF de estadísticas de admin
     */
    public function downloadAdminStatsPDF(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Función helper para crear query base
            $getBaseQuery = function() use ($user) {
                $query = User::query();
                if ($user && $user->role === 'admin') {
                    $query->where('role', '!=', 'super_admin');
                }
                return $query;
            };

            // Obtener estadísticas dinámicamente
            $totalUsers = $getBaseQuery()->count();
            $totalPsychologists = $getBaseQuery()->where('role', 'psychologist')->count();
            $totalStudents = $getBaseQuery()->where('role', 'student')->count();
            $totalAppointments = Cita::count();
            $completedAppointments = Cita::where('estado', 'completada')->count();
            $pendingAppointments = Cita::where('estado', 'pendiente')->count();
            $cancelledAppointments = Cita::where('estado', 'cancelada')->count();

            $userName = htmlspecialchars($user->name ?? 'Administrador', ENT_QUOTES, 'UTF-8');
            $completionRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 2) : 0;
            $cancellationRate = $totalAppointments > 0 ? round(($cancelledAppointments / $totalAppointments) * 100, 2) : 0;

            $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Estadísticas del Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1a202c; }
        h1 { color: #8e161a; border-bottom: 3px solid #8e161a; padding-bottom: 10px; text-align: center; }
        h2 { color: #2d3748; margin-top: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        .header-info { background: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #8e161a; }
        .stat-value { font-size: 32px; font-weight: bold; color: #8e161a; margin: 10px 0; }
        .stat-label { font-size: 14px; color: #718096; }
        .appointments-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .appointment-card { background: #edf2f7; padding: 15px; border-radius: 8px; text-align: center; }
        .appointment-value { font-size: 24px; font-weight: bold; color: #1e3a5f; margin: 5px 0; }
        .appointment-label { font-size: 12px; color: #718096; }
        .rates { background: #edf2f7; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Estadísticas del Sistema</h1>
    <div class="header-info">
        <p><strong>Fecha de generación:</strong> ' . htmlspecialchars(date('d/m/Y H:i:s'), ENT_QUOTES, 'UTF-8') . '</p>
        <p><strong>Generado por:</strong> ' . $userName . '</p>
    </div>

    <h2>Resumen de Usuarios</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">' . $totalUsers . '</div>
            <div class="stat-label">Total Usuarios</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">' . $totalPsychologists . '</div>
            <div class="stat-label">Psicólogos</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">' . $totalStudents . '</div>
            <div class="stat-label">Estudiantes</div>
        </div>
    </div>

    <h2>Resumen de Citas</h2>
    <div class="appointments-grid">
        <div class="appointment-card">
            <div class="appointment-value">' . $totalAppointments . '</div>
            <div class="appointment-label">Total Citas</div>
        </div>
        <div class="appointment-card">
            <div class="appointment-value">' . $completedAppointments . '</div>
            <div class="appointment-label">Completadas</div>
        </div>
        <div class="appointment-card">
            <div class="appointment-value">' . $pendingAppointments . '</div>
            <div class="appointment-label">Pendientes</div>
        </div>
        <div class="appointment-card">
            <div class="appointment-value">' . $cancelledAppointments . '</div>
            <div class="appointment-label">Canceladas</div>
        </div>
    </div>
    <div class="rates">
        <p><strong>Tasa de completitud:</strong> ' . number_format($completionRate, 2) . '%</p>
        <p><strong>Tasa de cancelación:</strong> ' . number_format($cancellationRate, 2) . '%</p>
    </div>
</body>
</html>';

            // Validar que DomPDF esté disponible
            if (!class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
                throw new \Exception('La librería DomPDF no está instalada');
            }

            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('a4', 'portrait');
            $pdf->setOption('enable-local-file-access', true);
            $pdf->setOption('isHtml5ParserEnabled', true);
            $filename = 'estadisticas_admin_' . date('Y-m-d_His') . '.pdf';
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error generando PDF de estadísticas: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 