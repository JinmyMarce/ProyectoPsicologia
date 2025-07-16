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
use App\Http\Controllers\Api\PsychologistDashboardController;
use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Auth;


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

// Rutas públicas para horarios disponibles
Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);

// Rutas protegidas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de autenticación
    Route::post('/auth/verify', [AuthController::class, 'verifyToken']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    
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
        Route::post('/{id}/send-password-reset', [UserController::class, 'sendPasswordResetEmail']);
        Route::get('/stats', [UserController::class, 'stats']);
    });

    // Ruta temporal sin middleware para probar creación de usuarios
    Route::post('/users-temp', [UserController::class, 'store']);

    // Rutas para perfil del usuario autenticado
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
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
        Route::get('/stats', [NotificationController::class, 'stats']);
        Route::get('/test', [NotificationController::class, 'test']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::post('/appointment-reminder/{appointmentId}', [NotificationController::class, 'sendAppointmentReminder']);
        Route::post('/appointment-status/{appointmentId}', [NotificationController::class, 'sendAppointmentStatusChange']);
        Route::post('/appointment-approved/{appointmentId}', [NotificationController::class, 'sendAppointmentApproved']);
        Route::post('/appointment-rejected/{appointmentId}', [NotificationController::class, 'sendAppointmentRejected']);
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
        
        // Rutas específicas para psicólogos
        Route::get('/my-schedule', [ScheduleController::class, 'getMySchedule']);
        Route::post('/my-schedule', [ScheduleController::class, 'createMySchedule']);
        Route::post('/my-schedule/{id}/block', [ScheduleController::class, 'blockMySchedule']);
        Route::post('/my-schedule/{id}/unblock', [ScheduleController::class, 'unblockMySchedule']);
        Route::delete('/my-schedule/{id}', [ScheduleController::class, 'deleteMySchedule']);
        Route::get('/my-schedule/stats', [ScheduleController::class, 'getMyScheduleStats']);
    });

    // Rutas específicas para el panel del psicólogo
    Route::prefix('psychologist-dashboard')->group(function () {
        Route::get('/dashboard', [PsychologistDashboardController::class, 'dashboard']);
        Route::post('/appointments/{id}/approve', [PsychologistDashboardController::class, 'approveAppointment']);
        Route::post('/appointments/{id}/reject', [PsychologistDashboardController::class, 'rejectAppointment']);
        Route::post('/appointments/schedule-for-student', [PsychologistDashboardController::class, 'scheduleAppointmentForStudent']);
        Route::get('/students/search', [PsychologistDashboardController::class, 'searchStudent']);
        Route::get('/patients', [PsychologistDashboardController::class, 'getPatients']);
        Route::post('/sessions/register', [PsychologistDashboardController::class, 'registerSession']);
        Route::get('/sessions/history', [PsychologistDashboardController::class, 'getSessionHistory']);
        Route::get('/sessions/student-stats', [PsychologistDashboardController::class, 'getStudentSessionStats']);
    });

    // Rutas para citas
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::get('/appointments/all', [AppointmentController::class, 'getAllAppointments']);
    Route::get('/appointments/user/{userEmail}', [AppointmentController::class, 'getUserAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::patch('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::patch('/appointments/{id}/complete', [AppointmentController::class, 'complete']);
    Route::patch('/appointments/{id}/approve', [AppointmentController::class, 'approve']);
    Route::patch('/appointments/{id}/reject', [AppointmentController::class, 'reject']);
    Route::get('/appointments/pending', [AppointmentController::class, 'getPendingAppointments']);

    // Rutas para mensajes
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::get('/sent', [MessageController::class, 'sent']);
        Route::get('/{id}', [MessageController::class, 'show']);
        Route::post('/', [MessageController::class, 'store']);
        Route::post('/{id}/read', [MessageController::class, 'markAsRead']);
        Route::post('/mark-all-read', [MessageController::class, 'markAllAsRead']);
        Route::delete('/{id}', [MessageController::class, 'destroy']);
        Route::get('/conversation/{userId}', [MessageController::class, 'conversation']);
        Route::get('/stats', [MessageController::class, 'stats']);
        Route::get('/recipients', [MessageController::class, 'getRecipients']);
    });

    // Ruta específica para stats de mensajes (para debugging)
    Route::get('/messages-stats-debug', [MessageController::class, 'stats']);

});

// Ruta de prueba para verificar que la API funciona
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando correctamente'
    ]);
});

// Ruta de prueba para notificaciones sin autenticación
Route::get('/notifications-test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Endpoint de notificaciones accesible sin autenticación',
        'timestamp' => now()
    ]);
});

// Ruta temporal para stats sin autenticación
Route::get('/notifications-stats-test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Stats endpoint accesible sin autenticación',
        'data' => [
            'total' => 0,
            'unread' => 0,
            'read' => 0,
            'by_type' => [
                'appointment' => 0,
                'reminder' => 0,
                'status' => 0,
                'system' => 0
            ]
        ]
    ]);
});

// Rutas de prueba para diagnosticar problemas
Route::get('/debug/users', function () {
    try {
        $users = \App\Models\User::all();
        return response()->json([
            'success' => true,
            'message' => 'Usuarios obtenidos correctamente',
            'count' => $users->count(),
            'data' => $users
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener usuarios',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/debug/auth', function () {
    try {
        $user = Auth::user();
        return response()->json([
            'success' => true,
            'authenticated' => Auth::check(),
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error de autenticación',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/debug/migrations', function () {
    try {
        $migrations = \Illuminate\Support\Facades\DB::table('migrations')->get();
        $usersTable = \Illuminate\Support\Facades\Schema::hasTable('users');
        $usersColumns = $usersTable ? \Illuminate\Support\Facades\Schema::getColumnListing('users') : [];
        
        return response()->json([
            'success' => true,
            'migrations' => $migrations,
            'users_table_exists' => $usersTable,
            'users_columns' => $usersColumns
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al verificar migraciones',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint de prueba para POST
Route::post('/debug/test-post', function (Request $request) {
    try {
        return response()->json([
            'success' => true,
            'message' => 'POST funcionando correctamente',
            'received_data' => $request->all()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error en POST',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint temporal sin autenticación para probar creación de usuarios
Route::post('/debug/create-user', function (Request $request) {
    try {
        $data = $request->all();
        
        // Validar datos requeridos
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return response()->json([
                'success' => false,
                'message' => 'Datos incompletos',
                'required' => ['name', 'email', 'password']
            ], 422);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Datos recibidos correctamente',
            'received_data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error en creación de usuario',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint temporal para probar el UserController sin middleware
Route::post('/debug/users-test', function (Request $request) {
    try {
        // Simular la lógica del UserController sin middleware
        $data = $request->all();
        
        // Validar datos requeridos
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return response()->json([
                'success' => false,
                'message' => 'Datos incompletos',
                'required' => ['name', 'email', 'password']
            ], 422);
        }
        
        // Verificar si la tabla users existe
        $usersTableExists = \Illuminate\Support\Facades\Schema::hasTable('users');
        
        if (!$usersTableExists) {
            return response()->json([
                'success' => false,
                'message' => 'La tabla users no existe. Ejecuta las migraciones.',
                'solution' => 'php artisan migrate'
            ], 500);
        }
        
        // Verificar conexión a la base de datos
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Exception $e) {
            $dbConnected = false;
            $dbError = $e->getMessage();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'UserController funcionando correctamente',
            'received_data' => $data,
            'users_table_exists' => $usersTableExists,
            'database_connected' => $dbConnected,
            'database_error' => $dbError ?? null
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error en UserController',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Endpoint para probar autenticación
Route::post('/debug/auth-test', function (Request $request) {
    try {
        $token = $request->header('Authorization');
        $bearerToken = null;
        
        if ($token && strpos($token, 'Bearer ') === 0) {
            $bearerToken = substr($token, 7);
        }
        
        $isAuthenticated = Auth::check();
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'has_authorization_header' => !empty($token),
            'has_bearer_token' => !empty($bearerToken),
            'is_authenticated' => $isAuthenticated,
            'user_id' => $user ? $user->id : null,
            'user_role' => $user ? $user->role : null,
            'user_email' => $user ? $user->email : null,
            'token_length' => $bearerToken ? strlen($bearerToken) : 0,
            'token_preview' => $bearerToken ? substr($bearerToken, 0, 20) . '...' : null
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al verificar autenticación',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint para verificar token de autenticación
Route::get('/debug/check-token', function (Request $request) {
    try {
        $token = $request->header('Authorization');
        $bearerToken = null;
        
        if ($token && strpos($token, 'Bearer ') === 0) {
            $bearerToken = substr($token, 7);
        }
        
        return response()->json([
            'success' => true,
            'has_authorization_header' => !empty($token),
            'has_bearer_token' => !empty($bearerToken),
            'token_length' => $bearerToken ? strlen($bearerToken) : 0,
            'token_preview' => $bearerToken ? substr($bearerToken, 0, 20) . '...' : null
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al verificar token',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint para verificar estado del servidor y base de datos
Route::get('/debug/server-status', function () {
    try {
        $dbConnection = false;
        $migrationsTable = false;
        $usersTable = false;
        $error = null;
        
        try {
            // Verificar conexión a la base de datos
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            $dbConnection = true;
            
            // Verificar si existe la tabla migrations
            $migrationsTable = \Illuminate\Support\Facades\Schema::hasTable('migrations');
            
            // Verificar si existe la tabla users
            $usersTable = \Illuminate\Support\Facades\Schema::hasTable('users');
            
        } catch (\Exception $e) {
            $error = $e->getMessage();
        }
        
        return response()->json([
            'success' => true,
            'server_status' => 'running',
            'database_connection' => $dbConnection,
            'migrations_table_exists' => $migrationsTable,
            'users_table_exists' => $usersTable,
            'error' => $error,
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al verificar estado del servidor',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Endpoint de prueba para diagnosticar stats de mensajes
Route::get('/debug/messages-stats-test', function () {
    try {
        // Verificar si la tabla messages existe
        $messagesTableExists = \Illuminate\Support\Facades\Schema::hasTable('messages');
        
        if (!$messagesTableExists) {
            return response()->json([
                'success' => false,
                'message' => 'La tabla messages no existe'
            ], 500);
        }
        
        // Obtener estadísticas básicas
        $totalMessages = \App\Models\Message::count();
        $unreadMessages = \App\Models\Message::where('read', false)->count();
        $readMessages = \App\Models\Message::where('read', true)->count();
        
        return response()->json([
            'success' => true,
            'message' => 'Stats de mensajes obtenidos correctamente',
            'data' => [
                'total' => $totalMessages,
                'unread' => $unreadMessages,
                'read' => $readMessages,
                'table_exists' => $messagesTableExists
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener stats de mensajes',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Endpoint para simular exactamente el controlador de mensajes
Route::get('/debug/messages-controller-test', function (Request $request) {
    try {
        // Simular exactamente el método stats del MessageController
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado',
                'auth_check' => Auth::check(),
                'headers' => $request->headers->all()
            ], 401);
        }
        
        // Usar exactamente el mismo método del modelo
        $stats = \App\Models\Message::getStats($user->id);
        
        return response()->json([
            'success' => true,
            'data' => $stats,
            'user_id' => $user->id,
            'user_email' => $user->email
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener estadísticas: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}); 