<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class GroupSessionController extends Controller
{
    /**
     * Obtener todas las sesiones grupales
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        try {
            $query = GroupSession::with(['tutor']);

            // Filtrar según el rol del usuario
            if ($user->isTutor()) {
                // Tutores solo ven sus sesiones
                $query->where('tutor_id', $user->id);
            } elseif (!$user->isAdmin() && !$user->isSuperAdmin() && !$user->isStudent()) {
                // Otros roles no autorizados (psicólogos pueden ver para referencia)
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado.'
                ], 403);
            }

            // Filtros opcionales
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('tutor_id')) {
                $query->where('tutor_id', $request->tutor_id);
            }

            if ($request->has('day_of_week')) {
                $query->where('day_of_week', $request->day_of_week);
            }

            if ($request->has('date_from')) {
                $query->where('date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('date', '<=', $request->date_to);
            }

            // Filtro para sesiones futuras
            if ($request->has('future') && $request->future) {
                $query->future();
            }

            $sessions = $query->latest('date')->get();

            return response()->json([
                'success' => true,
                'data' => $sessions->map(function ($session) {
                    return $session->toApiArray();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones grupales'
            ], 500);
        }
    }

    /**
     * Crear una nueva sesión grupal (Solo tutores)
     */
    public function store(Request $request): JsonResponse
    {
        // Solo tutores pueden crear sesiones grupales
        if (!Auth::user()->isTutor()) {
            return response()->json([
                'success' => false,
                'message' => 'Solo los tutores pueden crear sesiones grupales.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'classroom' => 'required|string|max:50',
            'date' => 'required|date|after_or_equal:today',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday',
            'topic' => 'required|string|min:5|max:200',
            'max_students' => 'nullable|integer|min:1|max:50',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validar que la fecha corresponda al día de la semana
        $date = Carbon::parse($request->date);
        $dayOfWeek = strtolower($date->englishDayOfWeek);
        
        if ($dayOfWeek !== $request->day_of_week) {
            return response()->json([
                'success' => false,
                'message' => 'La fecha no corresponde al día de la semana seleccionado.'
            ], 422);
        }

        // Validar que no hay otra sesión del mismo tutor en la misma fecha y hora
        $existingSession = GroupSession::where('tutor_id', Auth::id())
            ->where('date', $request->date)
            ->where('start_time', '01:00:00')
            ->first();

        if ($existingSession) {
            return response()->json([
                'success' => false,
                'message' => 'Ya tienes una sesión programada para esta fecha y hora.'
            ], 422);
        }

        try {
            $session = GroupSession::create([
                'tutor_id' => Auth::id(),
                'classroom' => $request->classroom,
                'date' => $request->date,
                'start_time' => '01:00:00', // Horario fijo
                'end_time' => '02:00:00',   // Horario fijo
                'day_of_week' => $request->day_of_week,
                'topic' => $request->topic,
                'max_students' => $request->max_students ?? 30,
                'notes' => $request->notes,
                'registered_students' => [],
                'status' => 'scheduled',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesión grupal creada exitosamente',
                'data' => $session->load('tutor')->toApiArray()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la sesión grupal'
            ], 500);
        }
    }

    /**
     * Mostrar una sesión grupal específica
     */
    public function show($id): JsonResponse
    {
        $session = GroupSession::with(['tutor'])->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión grupal no encontrada'
            ], 404);
        }

        // Verificar permisos
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->isSuperAdmin() && 
            $session->tutor_id !== $user->id && !$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $session->toApiArray()
        ]);
    }

    /**
     * Actualizar una sesión grupal
     */
    public function update(Request $request, $id): JsonResponse
    {
        $session = GroupSession::find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión grupal no encontrada'
            ], 404);
        }

        // Solo el tutor propietario o admin pueden actualizar
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->isSuperAdmin() && $session->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para actualizar esta sesión.'
            ], 403);
        }

        // No se puede actualizar sesiones que ya empezaron o terminaron
        if (in_array($session->status, ['in_progress', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede actualizar una sesión que ya empezó o terminó.'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'classroom' => 'sometimes|required|string|max:50',
            'date' => 'sometimes|required|date|after_or_equal:today',
            'day_of_week' => 'sometimes|required|in:monday,tuesday,wednesday,thursday,friday',
            'topic' => 'sometimes|required|string|min:5|max:200',
            'max_students' => 'sometimes|nullable|integer|min:1|max:50',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only([
                'classroom', 'date', 'day_of_week', 'topic', 'max_students', 'notes'
            ]);

            $session->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Sesión grupal actualizada exitosamente',
                'data' => $session->fresh('tutor')->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la sesión grupal'
            ], 500);
        }
    }

    /**
     * Registrar estudiante en sesión grupal
     */
    public function registerStudent(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $session = GroupSession::find($id);
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión grupal no encontrada'
            ], 404);
        }

        // Verificar que el estudiante existe y es estudiante
        $student = User::find($request->student_id);
        if (!$student || !$student->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'El estudiante seleccionado no es válido.'
            ], 422);
        }

        // Solo se puede registrar en sesiones programadas
        if ($session->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se puede registrar en sesiones programadas.'
            ], 422);
        }

        try {
            $registered = $session->registerStudent($request->student_id);

            if (!$registered) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo registrar al estudiante. La sesión puede estar llena o el estudiante ya está registrado.'
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estudiante registrado exitosamente en la sesión',
                'data' => $session->fresh('tutor')->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar estudiante'
            ], 500);
        }
    }

    /**
     * Desregistrar estudiante de sesión grupal
     */
    public function unregisterStudent(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $session = GroupSession::find($id);
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión grupal no encontrada'
            ], 404);
        }

        try {
            $unregistered = $session->unregisterStudent($request->student_id);

            if (!$unregistered) {
                return response()->json([
                    'success' => false,
                    'message' => 'El estudiante no estaba registrado en esta sesión.'
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estudiante desregistrado exitosamente de la sesión',
                'data' => $session->fresh('tutor')->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desregistrar estudiante'
            ], 500);
        }
    }

    /**
     * Actualizar estado de sesión grupal
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'session_summary' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $session = GroupSession::find($id);
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión grupal no encontrada'
            ], 404);
        }

        // Solo el tutor propietario puede cambiar el estado
        if ($session->tutor_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Solo el tutor propietario puede actualizar el estado de la sesión.'
            ], 403);
        }

        try {
            $updateData = ['status' => $request->status];
            
            if ($request->has('session_summary')) {
                $updateData['session_summary'] = $request->session_summary;
            }

            $session->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Estado de sesión actualizado exitosamente',
                'data' => $session->fresh('tutor')->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado'
            ], 500);
        }
    }

    /**
     * Obtener sesiones disponibles para estudiantes
     */
    public function available(): JsonResponse
    {
        try {
            $sessions = GroupSession::scheduled()
                ->future()
                ->with(['tutor'])
                ->orderBy('date')
                ->get()
                ->filter(function ($session) {
                    return $session->hasAvailableSlots();
                });

            return response()->json([
                'success' => true,
                'data' => $sessions->values()->map(function ($session) {
                    return $session->toApiArray();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones disponibles'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de sesiones grupales
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        try {
            $stats = [
                'total' => GroupSession::count(),
                'scheduled' => GroupSession::where('status', 'scheduled')->count(),
                'in_progress' => GroupSession::where('status', 'in_progress')->count(),
                'completed' => GroupSession::where('status', 'completed')->count(),
                'cancelled' => GroupSession::where('status', 'cancelled')->count(),
                'by_day' => [
                    'monday' => GroupSession::where('day_of_week', 'monday')->count(),
                    'tuesday' => GroupSession::where('day_of_week', 'tuesday')->count(),
                    'wednesday' => GroupSession::where('day_of_week', 'wednesday')->count(),
                    'thursday' => GroupSession::where('day_of_week', 'thursday')->count(),
                    'friday' => GroupSession::where('day_of_week', 'friday')->count(),
                ],
                'total_registered_students' => GroupSession::sum('registered_students'),
                'average_attendance' => GroupSession::completed()
                    ->get()
                    ->average(function ($session) {
                        return count($session->registered_students ?? []);
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }
}































