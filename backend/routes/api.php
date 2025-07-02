<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PsychologistController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PsychologicalSessionController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PsychologistAvailabilityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas de autenticación
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'loginWithGoogle']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Rutas protegidas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de autenticación
    Route::post('/auth/verify', [AuthController::class, 'verifyToken']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    
    // Rutas del dashboard
    Route::get('/dashboard', [DashboardController::class, 'dashboard']);
    Route::get('/dashboard/student', [DashboardController::class, 'studentDashboard']);
    Route::get('/dashboard/psychologist', [DashboardController::class, 'psychologistDashboard']);
    Route::get('/dashboard/super-admin', [DashboardController::class, 'superAdminDashboard']);
    
    // Rutas de búsqueda
    Route::get('/search/psychologists', [SearchController::class, 'searchPsychologists']);
    Route::get('/search/appointments', [SearchController::class, 'searchAppointments']);
    Route::get('/search/sessions', [SearchController::class, 'searchSessions']);
    Route::get('/search/global', [SearchController::class, 'globalSearch']);
    
    // Rutas de exportación
    Route::get('/export/appointments', [ExportController::class, 'exportAppointments']);
    Route::get('/export/psychologists', [ExportController::class, 'exportPsychologists']);
    Route::get('/export/sessions', [ExportController::class, 'exportSessions']);
    Route::get('/export/system-report', [ExportController::class, 'exportSystemReport']);
    
    // Rutas para citas
    Route::apiResource('citas', CitaController::class);
    Route::get('/citas/psychologists/available', [CitaController::class, 'getAvailablePsychologists']);
    Route::post('/citas/psychologists/schedule', [CitaController::class, 'getPsychologistSchedule']);
    
    // Rutas para gestión de psicólogos (solo super admin)
    Route::prefix('psychologists')->group(function () {
        Route::get('/', [PsychologistController::class, 'index']);
        Route::post('/', [PsychologistController::class, 'store']);
        Route::get('/{id}', [PsychologistController::class, 'show']);
        Route::put('/{id}', [PsychologistController::class, 'update']);
        Route::post('/{id}/deactivate', [PsychologistController::class, 'deactivate']);
        Route::get('/history/list', [PsychologistController::class, 'history']);
        Route::post('/history/{id}/reactivate', [PsychologistController::class, 'reactivate']);
    });

    // Rutas para gestión de usuarios (solo super admin y admin)
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::post('/{id}/deactivate', [UserController::class, 'deactivate']);
        Route::post('/{id}/reactivate', [UserController::class, 'reactivate']);
        Route::get('/{id}/history', [UserController::class, 'history']);
        Route::post('/{id}/change-password', [UserController::class, 'changePassword']);
        Route::post('/{id}/send-verification', [UserController::class, 'sendVerificationEmail']);
        Route::get('/stats', [UserController::class, 'stats']);
        
        // Rutas para perfil del usuario autenticado
        Route::put('/profile/update', [UserController::class, 'updateProfile']);
        Route::post('/profile/change-password', [UserController::class, 'changeOwnPassword']);
    });

    // Rutas para gestión de pacientes
    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index']);
        Route::post('/', [PatientController::class, 'store']);
        Route::get('/{id}', [PatientController::class, 'show']);
        Route::put('/{id}', [PatientController::class, 'update']);
        Route::delete('/{id}', [PatientController::class, 'destroy']);
        Route::get('/search/dni/{dni}', [PatientController::class, 'searchByDni']);
        Route::get('/{id}/sessions', [PatientController::class, 'getSessions']);
    });

    // Rutas para gestión de sesiones psicológicas
    Route::prefix('psychological-sessions')->group(function () {
        Route::get('/', [PsychologicalSessionController::class, 'index']);
        Route::post('/', [PsychologicalSessionController::class, 'store']);
        Route::get('/{id}', [PsychologicalSessionController::class, 'show']);
        Route::put('/{id}', [PsychologicalSessionController::class, 'update']);
        Route::delete('/{id}', [PsychologicalSessionController::class, 'destroy']);
        Route::get('/patient/{patientId}', [PsychologicalSessionController::class, 'getByPatient']);
        Route::get('/psychologist/{psychologistId}', [PsychologicalSessionController::class, 'getByPsychologist']);
        Route::get('/date/{date}', [PsychologicalSessionController::class, 'getByDate']);
        Route::get('/search/patient-dni/{dni}', [PsychologicalSessionController::class, 'searchPatientByDni']);
        Route::get('/stats', [PsychologicalSessionController::class, 'stats']);
    });

    // Rutas para notificaciones
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::get('/stats', [NotificationController::class, 'stats']);
        Route::post('/appointment-reminder/{appointmentId}', [NotificationController::class, 'sendAppointmentReminder']);
        Route::post('/appointment-status/{appointmentId}', [NotificationController::class, 'sendAppointmentStatusChange']);
        Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
        Route::get('/preferences', [NotificationController::class, 'getPreferences']);
    });

    // Rutas para reportes y análisis
    Route::prefix('reports')->group(function () {
        Route::get('/analytics', [ReportController::class, 'analytics']);
        Route::get('/appointments', [ReportController::class, 'appointments']);
        Route::get('/psychologists', [ReportController::class, 'psychologists']);
        Route::get('/students', [ReportController::class, 'students']);
        Route::post('/generate-pdf', [ReportController::class, 'generatePDF']);
        Route::post('/generate-excel', [ReportController::class, 'generateExcel']);
        Route::get('/performance', [ReportController::class, 'performance']);
        Route::get('/trends', [ReportController::class, 'trends']);
        Route::get('/revenue', [ReportController::class, 'revenue']);
        Route::post('/schedule', [ReportController::class, 'scheduleReport']);
        Route::get('/scheduled', [ReportController::class, 'getScheduledReports']);
        Route::delete('/scheduled/{id}', [ReportController::class, 'cancelScheduledReport']);
    });

    // Rutas para gestión de horarios
    Route::prefix('schedule')->group(function () {
        Route::get('/psychologist/{psychologistId}', [ScheduleController::class, 'getPsychologistSchedule']);
        Route::get('/available/{psychologistId}', [ScheduleController::class, 'getAvailableSlots']);
        Route::post('/', [ScheduleController::class, 'store']);
        Route::post('/bulk', [ScheduleController::class, 'storeBulk']);
        Route::put('/{id}', [ScheduleController::class, 'update']);
        Route::delete('/{id}', [ScheduleController::class, 'destroy']);
        Route::post('/{id}/block', [ScheduleController::class, 'block']);
        Route::post('/{id}/unblock', [ScheduleController::class, 'unblock']);
        Route::get('/by-date', [ScheduleController::class, 'getByDate']);
        Route::get('/by-range', [ScheduleController::class, 'getByDateRange']);
        Route::get('/conflicts', [ScheduleController::class, 'getConflicts']);
        Route::get('/stats', [ScheduleController::class, 'stats']);
        Route::post('/import', [ScheduleController::class, 'import']);
        Route::get('/export', [ScheduleController::class, 'export']);
    });

    // Rutas para citas
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::get('/appointments/user/{userEmail}', [AppointmentController::class, 'getUserAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::patch('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::patch('/appointments/{id}/complete', [AppointmentController::class, 'complete']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);

    // Rutas para sesiones psicológicas
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::post('/sessions', [SessionController::class, 'store']);
    Route::get('/sessions/{id}', [SessionController::class, 'show']);
    Route::put('/sessions/{id}', [SessionController::class, 'update']);
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
});

// Ruta de prueba para verificar que la API funciona
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando correctamente'
    ]);
});

// Ruta de prueba para verificar configuración de Google
Route::get('/auth/google/config', [AuthController::class, 'testGoogleConfig']);

// Ruta de prueba POST para verificar que las peticiones POST funcionan
Route::post('/test-post', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'POST funcionando correctamente',
        'data' => $request->all()
    ]);
});

Route::get('/psychologists', [PsychologistController::class, 'indexPublic']);
Route::get('/psychologists/{id}/availability', [PsychologistAvailabilityController::class, '__invoke']);

// Ruta de prueba para crear psicólogos sin autenticación
Route::post('/test-psychologist', function (Request $request) {
    try {
        $data = $request->all();
        return response()->json([
            'success' => true,
            'message' => 'Datos recibidos correctamente',
            'data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}); 