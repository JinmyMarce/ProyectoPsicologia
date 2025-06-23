<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function analytics(Request $request)
    {
        $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
        $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

        // Estadísticas generales
        $totalAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])->count();
        $completedAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'completada')->count();
        $cancelledAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'cancelada')->count();
        $pendingAppointments = Cita::whereBetween('fecha', [$dateFrom, $dateTo])
            ->where('estado', 'pendiente')->count();

        $totalPsychologists = User::where('role', 'psychologist')->count();
        $activePsychologists = User::where('role', 'psychologist')->where('active', true)->count();
        $totalStudents = User::where('role', 'student')->count();

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

        // Rendimiento de psicólogos
        $psychologistPerformance = User::where('role', 'psychologist')
            ->where('active', true)
            ->withCount(['citas as appointments' => function($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('fecha', [$dateFrom, $dateTo]);
            }])
            ->withCount(['citas as completed_appointments' => function($query) use ($dateFrom, $dateTo) {
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
                    'appointments' => $psychologist->appointments,
                    'rating' => 4.5, // Mock rating
                    'completionRate' => round($completionRate, 2)
                ];
            });

        // Tipos de citas
        $appointmentTypes = Cita::selectRaw('
            tipo as type,
            COUNT(*) as count
        ')
        ->whereBetween('fecha', [$dateFrom, $dateTo])
        ->groupBy('tipo')
        ->get()
        ->map(function($type) use ($totalAppointments) {
            $percentage = $totalAppointments > 0 ? ($type->count / $totalAppointments) * 100 : 0;
            return [
                'type' => $type->type,
                'count' => $type->count,
                'percentage' => round($percentage, 2)
            ];
        });

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
        $validator = $request->validate([
            'type' => 'required|in:appointments,psychologists,students,analytics',
            'filters' => 'array'
        ]);

        // Aquí se implementaría la generación de PDF
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Reporte PDF generado exitosamente',
            'download_url' => '/reports/download/mock-pdf-report.pdf'
        ]);
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
} 